import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    encounter: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

import { encounterRepository } from "./repository";

describe("encounterRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("findAll applies filters and pagination", async () => {
    prismaMock.encounter.findMany.mockResolvedValueOnce([{ id: 1 }]);
    prismaMock.encounter.count.mockResolvedValueOnce(1);

    const result = await encounterRepository.findAll(
      { patientId: 10, practitionerId: "clx123", encounterTypeId: 3 },
      { skip: 5, take: 10 }
    );

    expect(prismaMock.encounter.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          patientId: 10,
          practitionerId: "clx123",
          encounterTypeId: 3,
        },
        skip: 5,
        take: 10,
        orderBy: { createdAt: "desc" },
      })
    );
    expect(prismaMock.encounter.count).toHaveBeenCalledWith({
      where: {
        patientId: 10,
        practitionerId: "clx123",
        encounterTypeId: 3,
      },
    });
    expect(result).toEqual({ items: [{ id: 1 }], totalCount: 1 });
  });

  it("findAll uses empty where when filters are empty", async () => {
    prismaMock.encounter.findMany.mockResolvedValueOnce([]);
    prismaMock.encounter.count.mockResolvedValueOnce(0);

    await encounterRepository.findAll({}, { skip: 0, take: 20 });

    expect(prismaMock.encounter.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
      })
    );
    expect(prismaMock.encounter.count).toHaveBeenCalledWith({ where: {} });
  });

  it("findById queries encounter by id", async () => {
    prismaMock.encounter.findUnique.mockResolvedValueOnce({ id: 99 });

    const result = await encounterRepository.findById(99);

    expect(prismaMock.encounter.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 99 },
      })
    );
    expect(result).toEqual({ id: 99 });
  });

  it("findLatestByPatient queries latest encounter by patient", async () => {
    prismaMock.encounter.findFirst.mockResolvedValueOnce({ id: 77 });

    const result = await encounterRepository.findLatestByPatient(22);

    expect(prismaMock.encounter.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { patientId: 22 },
        orderBy: { createdAt: "desc" },
      })
    );
    expect(result).toEqual({ id: 77 });
  });

  it("create maps nested relations only when data exists", async () => {
    const created = { id: 5 };
    prismaMock.encounter.create.mockResolvedValueOnce(created);

    const payload = {
      patientId: 1,
      practitionerId: "clx123",
      encounterTypeId: 2,
      diagnoses: [{ icd10CodeId: 7, isPrimary: true }],
      vitalSign: { systolicBP: 120 },
      anthropometry: { weight: 150, height: 170 },
      allergies: [],
      habits: [],
    };

    const result = await encounterRepository.create(payload as never);

    expect(prismaMock.encounter.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          patientId: 1,
          practitionerId: "clx123",
          encounterTypeId: 2,
          vitalSign: { create: { systolicBP: 120 } },
          anthropometry: { create: { weight: 150, height: 170 } },
          diagnoses: { create: [{ icd10CodeId: 7, isPrimary: true }] },
          allergies: undefined,
          habits: undefined,
        }),
      })
    );
    expect(result).toBe(created);
  });
});