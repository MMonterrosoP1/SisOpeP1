import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError, ValidationError } from "@/shared/errors/app-error";

const { encounterRepositoryMock, patientRepositoryMock, auditServiceMock, prismaMock } = vi.hoisted(() => ({
  encounterRepositoryMock: {
    findAll: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
  },
  patientRepositoryMock: {
    findById: vi.fn(),
  },
  auditServiceMock: {
    log: vi.fn(),
  },
  prismaMock: {
    practitioner: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("./repository", () => ({
  encounterRepository: encounterRepositoryMock,
}));

vi.mock("../patient/repository", () => ({
  patientRepository: patientRepositoryMock,
}));

vi.mock("@/shared/audit/audit.service", () => ({
  auditService: auditServiceMock,
}));

import { encounterService } from "./service";

const basePayload = {
  patientId: 1,
  encounterTypeId: 2,
  diagnoses: [{ icd10CodeId: 10, isPrimary: true }],
};

describe("encounterService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.practitioner.findUnique.mockResolvedValue({ id: "clx123", userId: "user-99" });
  });

  it("create: throws NotFoundError when patient does not exist", async () => {
    patientRepositoryMock.findById.mockResolvedValueOnce(null);

    await expect(encounterService.create({ ...basePayload } as never, { id: "user-1", email: "test@example.com" })).rejects.toBeInstanceOf(NotFoundError);
    expect(encounterRepositoryMock.create).not.toHaveBeenCalled();
  });

  it("create: throws ValidationError when patient is inactive", async () => {
    patientRepositoryMock.findById.mockResolvedValueOnce({ id: 1, active: false, person: { sex: "FEMALE" } });

    await expect(encounterService.create({ ...basePayload } as never, { id: "user-1", email: "test@example.com" })).rejects.toBeInstanceOf(ValidationError);
    expect(encounterRepositoryMock.create).not.toHaveBeenCalled();
  });

  it("create: rejects pregnancy status for non-female patients", async () => {
    patientRepositoryMock.findById.mockResolvedValueOnce({ id: 1, active: true, person: { sex: "MALE" } });

    await expect(
      encounterService.create({ ...basePayload, pregnancyStatus: "PREGNANT" } as never, { id: "user-1", email: "test@example.com" })
    ).rejects.toMatchObject({ message: "El estado de embarazo solo es aplicable a pacientes femeninas" });
  });

  it("create: rejects gynecological history for non-female patients", async () => {
    patientRepositoryMock.findById.mockResolvedValueOnce({ id: 1, active: true, person: { sex: "MALE" } });

    await expect(
      encounterService.create({ ...basePayload, gynecologicalHistory: "detail" } as never, { id: "user-1", email: "test@example.com" })
    ).rejects.toMatchObject({ message: "La historia ginecológica solo es aplicable a pacientes femeninas" });
  });

  it("create: computes bmi, marks first visit and audits", async () => {
    const created = { id: 123, patientId: 1 };
    patientRepositoryMock.findById.mockResolvedValueOnce({ id: 1, active: true, person: { sex: "FEMALE" } });
    encounterRepositoryMock.findAll.mockResolvedValueOnce({ items: [], totalCount: 0 });
    encounterRepositoryMock.create.mockResolvedValueOnce(created);

    const payload = {
      ...basePayload,
      anthropometry: { weight: 154, height: 170 },
      pregnancyStatus: "NOT_APPLICABLE",
    };

    const result = await encounterService.create(payload as never, { id: "user-99", email: "test@example.com" });

    expect(result).toBe(created);
    expect(encounterRepositoryMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        practitionerId: "user-99",
        createdBy: "test@example.com",
        updatedBy: "test@example.com",
        isFirstVisit: true,
        anthropometry: expect.objectContaining({
          weight: 154,
          height: 170,
          bmi: 24.17,
          bmiCategory: "NORMAL",
        }),
      })
    );
    expect(auditServiceMock.log).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-99",
        action: "CREATE",
        entityType: "encounter",
        entityId: 123,
      })
    );
  });

  it("create: marks isFirstVisit false when previous encounters exist", async () => {
    patientRepositoryMock.findById.mockResolvedValueOnce({ id: 1, active: true, person: { sex: "FEMALE" } });
    encounterRepositoryMock.findAll.mockResolvedValueOnce({ items: [{ id: 1 }], totalCount: 1 });
    encounterRepositoryMock.create.mockResolvedValueOnce({ id: 44 });

    await encounterService.create({ ...basePayload } as never, { id: "user-1", email: "test@example.com" });

    expect(encounterRepositoryMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        isFirstVisit: false,
      })
    );
  });

  it("getDetail: throws NotFoundError when encounter does not exist", async () => {
    encounterRepositoryMock.findById.mockResolvedValueOnce(null);

    await expect(encounterService.getDetail(999)).rejects.toBeInstanceOf(NotFoundError);
  });

  it("getDetail: returns encounter when found", async () => {
    const encounter = { id: 10 };
    encounterRepositoryMock.findById.mockResolvedValueOnce(encounter);

    const result = await encounterService.getDetail(10);

    expect(result).toBe(encounter);
  });
});