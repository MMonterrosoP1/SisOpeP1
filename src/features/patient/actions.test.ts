import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  withAuthMock,
  safeParseActionMock,
  createMock,
  updateMock,
  toggleMock,
  updateTagMock,
  handleActionErrorMock,
} = vi.hoisted(() => ({
  withAuthMock: vi.fn(),
  safeParseActionMock: vi.fn(),
  createMock: vi.fn(),
  updateMock: vi.fn(),
  toggleMock: vi.fn(),
  updateTagMock: vi.fn(),
  handleActionErrorMock: vi.fn(),
}));

vi.mock("@/shared/auth/auth-guard", () => ({
  withAuth: withAuthMock,
}));

vi.mock("@/shared/utils/zod-helpers", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/utils/zod-helpers")>();
  return {
    ...actual,
    safeParseAction: safeParseActionMock,
  };
});

vi.mock("./service", () => ({
  patientService: {
    create: createMock,
    update: updateMock,
    toggleActive: toggleMock,
  },
}));

vi.mock("next/cache", () => ({
  updateTag: updateTagMock,
}));

vi.mock("@/shared/errors/app-error", () => ({
  handleActionError: handleActionErrorMock,
}));

import { createPatient, togglePatientActive, updatePatient } from "./actions";

describe("patient actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    withAuthMock.mockImplementation(async (_roles, handler) =>
      handler({ user: { id: "user-1", email: "test@example.com" } })
    );
    handleActionErrorMock.mockReturnValue({
      success: false,
      error: "handled",
    });
  });

  it("createPatient: retorna éxito y revalida ruta", async () => {
    safeParseActionMock.mockReturnValueOnce({ success: true, data: { identityDocument: "123" } });
    createMock.mockResolvedValueOnce({ id: 10 });

    const result = await createPatient({ any: "payload" });

    expect(withAuthMock).toHaveBeenCalledWith(["ADMIN", "DOCTOR"], expect.any(Function));
    expect(createMock).toHaveBeenCalledWith({ identityDocument: "123" }, { id: "user-1", email: "test@example.com" });
    expect(updateTagMock).toHaveBeenCalledWith("patients");
    expect(result).toEqual({ success: true, data: { id: 10 } });
  });

  it("createPatient: retorna parse error cuando la validación falla", async () => {
    safeParseActionMock.mockReturnValueOnce({
      success: false,
      error: "Validación fallida",
      fieldErrors: { identityDocument: ["inválido"] },
    });

    const result = await createPatient({});

    expect(createMock).not.toHaveBeenCalled();
    expect(updateTagMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      error: "Validación fallida",
      fieldErrors: { identityDocument: ["inválido"] },
    });
  });

  it("updatePatient: retorna éxito y revalida listado y detalle", async () => {
    safeParseActionMock.mockReturnValueOnce({ success: true, data: { givenNames: "Nuevo" } });
    updateMock.mockResolvedValueOnce({ id: 25 });

    const result = await updatePatient(25, { givenNames: "Nuevo" });

    expect(updateMock).toHaveBeenCalledWith(25, { givenNames: "Nuevo" }, { id: "user-1", email: "test@example.com" });
    expect(updateTagMock).toHaveBeenCalledWith("patients");
    expect(updateTagMock).toHaveBeenCalledWith("patient-25");
    expect(result).toEqual({ success: true, data: { id: 25 } });
  });

  it("togglePatientActive: retorna éxito y revalida listado", async () => {
    toggleMock.mockResolvedValueOnce({ id: 25, active: false });

    const result = await togglePatientActive(25);

    expect(toggleMock).toHaveBeenCalledWith(25, { id: "user-1", email: "test@example.com" });
    expect(updateTagMock).toHaveBeenCalledWith("patients");
    expect(updateTagMock).toHaveBeenCalledWith("patient-25");
    expect(result).toEqual({ success: true, data: { id: 25, active: false } });
  });

  it("createPatient: delega errores a handleActionError", async () => {
    withAuthMock.mockRejectedValueOnce(new Error("boom"));

    const result = await createPatient({});

    expect(handleActionErrorMock).toHaveBeenCalled();
    expect(result).toEqual({ success: false, error: "handled" });
  });
});
