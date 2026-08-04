import { z } from "zod";
import { UserRoleSchema } from "@/shared/schemas/enums";

export const createUserSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  role: UserRoleSchema,
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
