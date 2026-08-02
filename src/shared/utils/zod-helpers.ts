import { z } from "zod";

export function formatZodError(error: z.ZodError<unknown>): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  
  error.issues.forEach((err) => {
    const path = err.path.join(".");
    if (!fieldErrors[path]) {
      fieldErrors[path] = [];
    }
    fieldErrors[path].push(err.message);
  });

  return fieldErrors;
}

export function safeParseAction<T>(
  schema: z.Schema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string; fieldErrors: Record<string, string[]> } {
  const result = schema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      error: "Validación fallida. Por favor revisa los campos requeridos.",
      fieldErrors: formatZodError(result.error),
    };
  }
  return { success: true, data: result.data };
}

export const idParamSchema = z.coerce.number().int().positive();
export const cuidSchema = z.string().cuid();
export const dateRangeSchema = z
  .object({
    from: z.coerce.date(),
    to: z.coerce.date(),
  })
  .refine((data) => data.from <= data.to, {
    message: "The 'from' date must be before or equal to the 'to' date",
    path: ["from"],
  });
