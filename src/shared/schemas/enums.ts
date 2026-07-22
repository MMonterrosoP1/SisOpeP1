import { z } from "zod";

export const UserRoleSchema = z.enum(["ADMIN", "DOCTOR", "VIEWER"]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const SexSchema = z.enum(["MALE", "FEMALE"]);
export type Sex = z.infer<typeof SexSchema>;

export const DocumentTypeSchema = z.enum(["DPI", "PASSPORT", "OTHER"]);
export type DocumentType = z.infer<typeof DocumentTypeSchema>;

export const PregnancyStatusSchema = z.enum([
  "PREGNANT",
  "POSTPARTUM",
  "NOT_PREGNANT",
  "NOT_APPLICABLE",
]);
export type PregnancyStatus = z.infer<typeof PregnancyStatusSchema>;

export const BmiCategorySchema = z.enum([
  "UNDERWEIGHT",
  "NORMAL",
  "OVERWEIGHT",
  "OBESE_I",
  "OBESE_II",
  "OBESE_III",
]);
export type BmiCategory = z.infer<typeof BmiCategorySchema>;

export const HabitFrequencySchema = z.enum(["DAILY", "WEEKLY"]);
export type HabitFrequency = z.infer<typeof HabitFrequencySchema>;

export const AuditActionSchema = z.enum([
  "CREATE",
  "UPDATE",
  "DELETE",
  "LOGIN",
  "LOGOUT",
  "EXPORT",
]);
export type AuditAction = z.infer<typeof AuditActionSchema>;
