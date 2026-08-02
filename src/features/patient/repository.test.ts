import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    patient: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    person: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    emergencyContact: {
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

import { patientRepository } from "./repository";

describe("patientRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("findAll: aplica filtros y mapea resultados", async () => {
    prismaMock.patient.findMany.mockResolvedValueOnce([
      {
        id: 1,
        active: true,
        person: {
          givenNames: "Ana",
          familyNames: "Lopez",
          identityDocument: "1234567890123",
          documentType: "DPI",
          birthDate: new Date("1990-01-01"),
          sex: "FEMALE",
          phone: "5555-1111",
        },
        company: { name: "Empresa", acronym: "EMP" },
        workplace: { name: "HQ" },
        workArea: { name: "RRHH" },
        jobPosition: { name: "Analista" },
      },
    ]);
    prismaMock.patient.count.mockResolvedValueOnce(1);

    const result = await patientRepository.findAll(
      { active: true, search: "Ana", companyId: 10, workplaceId: 11, workAreaId: 12, jobPositionId: 13 },
      { skip: 0, take: 20 }
    );

    expect(prismaMock.patient.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          active: true,
          companyId: 10,
          workplaceId: 11,
          workAreaId: 12,
          jobPositionId: 13,
          OR: expect.any(Array),
        }),
        skip: 0,
        take: 20,
      })
    );

    expect(result.totalCount).toBe(1);
    expect(result.items[0]).toEqual(
      expect.objectContaining({
        givenNames: "Ana",
        familyNames: "Lopez",
        identityDocument: "1234567890123",
        companyName: "Empresa",
        workplaceName: "HQ",
      })
    );
  });

  it("create: crea person cuando no existe y luego crea patient", async () => {
    const tx = {
      person: {
        findUnique: vi.fn().mockResolvedValueOnce(null),
        create: vi.fn().mockResolvedValueOnce({ id: 55 }),
        update: vi.fn(),
      },
      patient: {
        create: vi.fn().mockResolvedValueOnce({ id: 99, person: { id: 55 } }),
      },
    };

    prismaMock.$transaction.mockImplementationOnce(async (callback) => callback(tx));

    const payload = {
      givenNames: "Ana",
      familyNames: "Lopez",
      documentType: "DPI",
      identityDocument: "1234567890123",
      birthDate: new Date("1990-01-01"),
      sex: "FEMALE",
      companyId: 1,
      workplaceId: 2,
      workAreaId: 3,
      jobPositionId: 4,
      maritalStatusId: 5,
    };

    const result = await patientRepository.create(payload as never);

    expect(tx.person.create).toHaveBeenCalled();
    expect(tx.person.update).not.toHaveBeenCalled();
    expect(tx.patient.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ personId: 55 }),
      })
    );
    expect(result).toEqual({ id: 99, person: { id: 55 } });
  });

  it("update: sincroniza emergencyContacts y actualiza person/patient", async () => {
    const tx = {
      emergencyContact: {
        deleteMany: vi.fn().mockResolvedValueOnce({ count: 2 }),
      },
      patient: {
        findUnique: vi.fn().mockResolvedValueOnce({ id: 10, personId: 40 }),
        update: vi.fn().mockResolvedValueOnce({ id: 10, active: true }),
      },
      person: {
        update: vi.fn().mockResolvedValueOnce({ id: 40 }),
      },
    };

    prismaMock.$transaction.mockImplementationOnce(async (callback) => callback(tx));

    const result = await patientRepository.update(10, {
      givenNames: "Nuevo",
      emergencyContacts: [
        {
          fullName: "Contacto",
          phone: "5555",
          relationshipTypeId: 1,
          isPrimary: true,
        },
      ],
    } as never);

    expect(tx.emergencyContact.deleteMany).toHaveBeenCalledWith({ where: { patientId: 10 } });
    expect(tx.person.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 40 },
        data: expect.objectContaining({ givenNames: "Nuevo" }),
      })
    );
    expect(tx.patient.update).toHaveBeenCalled();
    expect(result).toEqual({ id: 10, active: true });
  });

  it("toggleActive: retorna null si no encuentra paciente", async () => {
    prismaMock.patient.findUnique.mockResolvedValueOnce(null);

    const result = await patientRepository.toggleActive(5);

    expect(result).toBeNull();
    expect(prismaMock.patient.update).not.toHaveBeenCalled();
  });

  it("toggleActive: invierte active cuando existe paciente", async () => {
    prismaMock.patient.findUnique.mockResolvedValueOnce({ active: true });
    prismaMock.patient.update.mockResolvedValueOnce({ id: 5, active: false });

    const result = await patientRepository.toggleActive(5);

    expect(prismaMock.patient.update).toHaveBeenCalledWith({
      where: { id: 5 },
      data: { active: false },
    });
    expect(result).toEqual({ id: 5, active: false });
  });
});
