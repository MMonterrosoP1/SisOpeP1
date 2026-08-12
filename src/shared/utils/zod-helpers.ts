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

export const idParamSchema = z.coerce.number({
  message: "El ID es requerido y debe ser un número",
}).int("El ID debe ser un número entero").positive("El ID debe ser positivo");
export const cuidSchema = z.string({
  message: "El ID es requerido y debe ser texto",
}).cuid("ID inválido");
export const dateRangeSchema = z
  .object({
    from: z.coerce.date({ message: "La fecha inicial es inválida o requerida" }),
    to: z.coerce.date({ message: "La fecha final es inválida o requerida" }),
  })
  .refine((data) => data.from <= data.to, {
    message: "La fecha inicial debe ser anterior o igual a la fecha final",
    path: ["from"],
  });
