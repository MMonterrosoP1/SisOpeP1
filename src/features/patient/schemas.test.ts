import { describe, expect, it } from "vitest";
import { createPatientSchema, updatePatientSchema } from "@/features/patient/schemas";

const validCreatePayload = {
  givenNames: "Ana Maria",
  familyNames: "Lopez Perez",
  documentType: "DPI",
  identityDocument: "1234567890123",
  birthDate: "1990-05-15",
  sex: "FEMALE",
  phone: "5555-1111",
  email: "ana@example.com",
  maritalStatusId: 1,
  companyId: 2,
  workplaceId: 3,
  workAreaId: 4,
  jobPositionId: 5,
  bloodTypeId: 6,
  emergencyContacts: [
    {
      fullName: "Juan Lopez",
      phone: "5555-2222",
      relationshipTypeId: 10,
      isPrimary: true,
    },
  ],
} as const;

describe("createPatientSchema", () => {
  it("rechaza DPI cuando no tiene 13 dígitos", () => {
    const result = createPatientSchema.safeParse({
      ...validCreatePayload,
      identityDocument: "123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.join(".") === "identityDocument");
      expect(issue?.message).toBe("El DPI debe tener exactamente 13 dígitos numéricos");
    }
  });

  it("marca campos requeridos vacíos", () => {
    const result = createPatientSchema.safeParse({
      ...validCreatePayload,
      givenNames: "",
      familyNames: "",
      identityDocument: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
      expect(messages).toEqual(
        expect.arrayContaining([
          { path: "givenNames", message: "Los nombres son obligatorios" },
          { path: "familyNames", message: "Los apellidos son obligatorios" },
          { path: "identityDocument", message: "El documento de identidad es obligatorio" },
        ])
      );
    }
  });

  it("rechaza fecha de nacimiento futura", () => {
    const future = new Date();
    future.setDate(future.getDate() + 2);

    const result = createPatientSchema.safeParse({
      ...validCreatePayload,
      birthDate: future.toISOString(),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.join(".") === "birthDate");
      expect(issue?.message).toBe("La fecha de nacimiento no puede estar en el futuro");
    }
  });

  it("acepta un payload completo válido", () => {
    const result = createPatientSchema.safeParse(validCreatePayload);

    expect(result.success).toBe(true);
  });
});

describe("updatePatientSchema", () => {
  it("permite payload parcial", () => {
    const result = updatePatientSchema.safeParse({
      givenNames: "Nuevo Nombre",
    });

    expect(result.success).toBe(true);
  });

  it("rechaza DPI inválido cuando documentType es DPI", () => {
    const result = updatePatientSchema.safeParse({
      documentType: "DPI",
      identityDocument: "ABC",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.join(".") === "identityDocument");
      expect(issue?.message).toBe("El DPI debe tener exactamente 13 dígitos numéricos");
    }
  });

  it("acepta active opcional", () => {
    const result = updatePatientSchema.safeParse({
      active: false,
    });

    expect(result.success).toBe(true);
  });
});
