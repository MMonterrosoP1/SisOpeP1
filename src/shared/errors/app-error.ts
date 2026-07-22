import { ActionResponse } from "../schemas/action-response";

export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public fieldErrors?: Record<string, string[]>) {
    super(message, "VALIDATION_ERROR", 400);
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
  constructor(message: string) {
    super(message, "CONFLICT", 409);
    this.name = "ConflictError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Access denied") {
    super(message, "FORBIDDEN", 403);
    this.name = "ForbiddenError";
  }
}

export function handleActionError(error: unknown): ActionResponse<any> {
  console.error("[Action Error]", error);

  if (error instanceof ValidationError) {
    return {
      success: false,
      error: error.message,
      fieldErrors: error.fieldErrors,
    };
  }

  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: false,
    error: "An unexpected error occurred. Please try again later.",
  };
}
