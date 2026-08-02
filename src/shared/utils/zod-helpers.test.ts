import { describe, expect, it } from "vitest";
import { z } from "zod";
import { formatZodError, safeParseAction } from "@/shared/utils/zod-helpers";

const actionSchema = z.object({
  identityDocument: z.string().regex(/^\d{13}$/, "DPI inválido"),
  birthDate: z.coerce.date().refine((date) => date <= new Date(), "Fecha futura inválida"),
});

describe("formatZodError", () => {
  it("mapea correctamente path y mensajes", () => {
    const parsed = actionSchema.safeParse({
      identityDocument: "123",
      birthDate: "9999-01-01",
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const fieldErrors = formatZodError(parsed.error);
      expect(fieldErrors).toEqual({
        identityDocument: ["DPI inválido"],
        birthDate: ["Fecha futura inválida"],
      });
    }
  });
});

describe("safeParseAction", () => {
  it("retorna shape de éxito esperado", () => {
    const result = safeParseAction(actionSchema, {
      identityDocument: "1234567890123",
      birthDate: "1999-08-10",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.identityDocument).toBe("1234567890123");
      expect(result.data.birthDate).toBeInstanceOf(Date);
    }
  });

  it("retorna shape de error esperado", () => {
    const result = safeParseAction(actionSchema, {
      identityDocument: "abc",
      birthDate: "9999-01-01",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Validación fallida. Por favor revisa los campos requeridos.");
      expect(result.fieldErrors).toEqual({
        identityDocument: ["DPI inválido"],
        birthDate: ["Fecha futura inválida"],
      });
    }
  });
});
