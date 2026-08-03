import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@/generated/prisma/client";

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

  it("findAll: no agrega filtros opcionales cuando vienen vacíos", async () => {
    prismaMock.patient.findMany.mockResolvedValueOnce([]);
    prismaMock.patient.count.mockResolvedValueOnce(0);

    const result = await patientRepository.findAll({}, { skip: 5, take: 10 });

    expect(prismaMock.patient.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
        skip: 5,
        take: 10,
      })
    );
    expect(prismaMock.patient.count).toHaveBeenCalledWith({ where: {} });
    expect(result).toEqual({ items: [], totalCount: 0 });
  });

  it("findAll: aplica active false explícito", async () => {
    prismaMock.patient.findMany.mockResolvedValueOnce([]);
    prismaMock.patient.count.mockResolvedValueOnce(0);

    await patientRepository.findAll({ active: false }, { skip: 0, take: 5 });

    expect(prismaMock.patient.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { active: false },
      })
    );
    expect(prismaMock.patient.count).toHaveBeenCalledWith({ where: { active: false } });
  });

  it("findById: retorna paciente cuando existe", async () => {
    const row = { id: 7, person: { id: 11 } };
    prismaMock.patient.findUnique.mockResolvedValueOnce(row);

    const result = await patientRepository.findById(7);

    expect(prismaMock.patient.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 7 },
      })
    );
    expect(result).toBe(row);
  });

  it("findById: retorna null cuando no existe", async () => {
    prismaMock.patient.findUnique.mockResolvedValueOnce(null);

    const result = await patientRepository.findById(404);

    expect(result).toBeNull();
  });

  it("findByDocument: retorna paciente cuando encuentra coincidencia", async () => {
    const row = { id: 5, person: { identityDocument: "1234567890123" } };
    prismaMock.patient.findFirst.mockResolvedValueOnce(row);

    const result = await patientRepository.findByDocument("1234567890123");

    expect(prismaMock.patient.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { person: { identityDocument: "1234567890123" } },
      })
    );
    expect(result).toBe(row);
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

  it("create: actualiza person cuando ya existe", async () => {
    const tx = {
      person: {
        findUnique: vi.fn().mockResolvedValueOnce({ id: 66 }),
        create: vi.fn(),
        update: vi.fn().mockResolvedValueOnce({ id: 66 }),
      },
      patient: {
        create: vi.fn().mockResolvedValueOnce({ id: 101, person: { id: 66 } }),
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

    expect(tx.person.create).not.toHaveBeenCalled();
    expect(tx.person.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 66 },
        data: expect.objectContaining({
          givenNames: "Ana",
          familyNames: "Lopez",
          documentType: "DPI",
        }),
      })
    );
    expect(result).toEqual({ id: 101, person: { id: 66 } });
  });

  it("create: traduce Prisma P2002 a ConflictError", async () => {
    const duplicateError = new Prisma.PrismaClientKnownRequestError(
      "Unique constraint failed",
      { code: "P2002", clientVersion: "test" }
    );
    prismaMock.$transaction.mockRejectedValueOnce(duplicateError);

    await expect(
      patientRepository.create({ identityDocument: "1234567890123" } as never)
    ).rejects.toMatchObject({
      code: "CONFLICT",
      statusCode: 409,
    });
  });

  it("create: relanza errores no-P2002", async () => {
    const dbError = new Error("database connection lost");
    prismaMock.$transaction.mockRejectedValueOnce(dbError);

    await expect(
      patientRepository.create({ identityDocument: "1234567890123" } as never)
    ).rejects.toBe(dbError);
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

  it("update: no elimina contactos ni actualiza persona cuando no aplica", async () => {
    const tx = {
      emergencyContact: {
        deleteMany: vi.fn(),
      },
      patient: {
        findUnique: vi.fn().mockResolvedValueOnce({ id: 10, personId: 40 }),
        update: vi.fn().mockResolvedValueOnce({ id: 10, active: true }),
      },
      person: {
        update: vi.fn(),
      },
    };

    prismaMock.$transaction.mockImplementationOnce(async (callback) => callback(tx));

    const result = await patientRepository.update(10, {
      companyId: 999,
    } as never);

    expect(tx.emergencyContact.deleteMany).not.toHaveBeenCalled();
    expect(tx.person.update).not.toHaveBeenCalled();
    expect(tx.patient.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 10 },
        data: expect.objectContaining({ companyId: 999 }),
      })
    );
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
