import { ActionResponse } from "../schemas/action-response";

export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number,
    public fieldErrors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, fieldErrors?: Record<string, string[]>) {
    super(message, "VALIDATION_ERROR", 400, fieldErrors);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, public entityType?: string, public entityId?: string | number) {
    super(message, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string, fieldErrors?: Record<string, string[]>) {
    super(message, "CONFLICT", 409, fieldErrors);
    this.name = "ConflictError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Acceso denegado") {
    super(message, "FORBIDDEN", 403);
    this.name = "ForbiddenError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "No autenticado") {
    super(message, "UNAUTHORIZED", 401);
    this.name = "UnauthorizedError";
  }
}

export function handleActionError(error: unknown): ActionResponse<unknown> {
  console.error("[Action Error]", error);

  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      fieldErrors: error.fieldErrors,
    };
  }

  return {
    success: false,
    error: "Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde.",
  };
}
