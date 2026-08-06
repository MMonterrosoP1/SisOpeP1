import { z } from "zod";
import { UserRoleSchema, SexSchema } from "@/shared/schemas/enums";

export const createUserSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  role: UserRoleSchema,
  // Doctor specific fields
  sex: SexSchema.optional(),
  preamble: z.string().optional(),
  givenNames: z.string().optional(),
  familyNames: z.string().optional(),
}).refine(data => {
  if (data.role === "DOCTOR") {
    return !!data.sex && !!data.givenNames && !!data.familyNames;
  }
  return true;
}, {
  message: "Los doctores requieren especificar nombre, apellidos y sexo",
  path: ["role"], // This path can be adjusted depending on UI handling
});

export const updateDoctorInfoSchema = z.object({
  userId: z.string().min(1, "El ID de usuario es obligatorio"),
  sex: SexSchema,
  preamble: z.string().optional(),
  givenNames: z.string().min(1, "Los nombres son obligatorios"),
  familyNames: z.string().min(1, "Los apellidos son obligatorios"),
});

export const setRoleSchema = z.object({
  userId: z.string().min(1, "El ID de usuario es obligatorio"),
  role: UserRoleSchema,
});

export const banUserSchema = z.object({
  userId: z.string().min(1, "El ID de usuario es obligatorio"),
  banReason: z.string().optional(),
  banExpiresIn: z.number().optional(), // en segundos
});

export const setPasswordSchema = z.object({
  userId: z.string().min(1, "El ID de usuario es obligatorio"),
  newPassword: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});
