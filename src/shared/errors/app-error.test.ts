import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  AppError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
  handleActionError,
} from "./app-error";

describe("AppError hierarchy", () => {
  it("builds ValidationError with expected metadata", () => {
    const error = new ValidationError("Invalid input", { field: ["required"] });

    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.statusCode).toBe(400);
    expect(error.fieldErrors).toEqual({ field: ["required"] });
  });

  it("builds NotFoundError with entity metadata", () => {
    const error = new NotFoundError("Not found", "patient", 10);

    expect(error.code).toBe("NOT_FOUND");
    expect(error.statusCode).toBe(404);
    expect(error.entityType).toBe("patient");
    expect(error.entityId).toBe(10);
  });

  it("builds ConflictError, ForbiddenError and UnauthorizedError", () => {
    const conflict = new ConflictError("Already exists", { doc: ["duplicate"] });
    const forbidden = new ForbiddenError();
    const unauthorized = new UnauthorizedError();

    expect(conflict.code).toBe("CONFLICT");
    expect(conflict.statusCode).toBe(409);
    expect(forbidden.code).toBe("FORBIDDEN");
    expect(forbidden.statusCode).toBe(403);
    expect(forbidden.message).toBe("Acceso denegado");
    expect(unauthorized.code).toBe("UNAUTHORIZED");
    expect(unauthorized.statusCode).toBe(401);
    expect(unauthorized.message).toBe("No autenticado");
  });
});

describe("handleActionError", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  it("returns expected response shape for AppError", () => {
    const response = handleActionError(new ValidationError("Bad data", { name: ["required"] }));

    expect(response).toEqual({
      success: false,
      error: "Bad data",
      fieldErrors: { name: ["required"] },
    });
  });

  it("returns generic message for unknown errors", () => {
    const response = handleActionError(new Error("boom"));

    expect(response).toEqual({
      success: false,
      error: "Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde.",
    });
  });
});