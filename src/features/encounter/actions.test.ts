import { beforeEach, describe, expect, it, vi } from "vitest";

const { withAuthMock, safeParseActionMock, createMock, handleActionErrorMock, revalidateTagMock } = vi.hoisted(() => ({
  withAuthMock: vi.fn(),
  safeParseActionMock: vi.fn(),
  createMock: vi.fn(),
  handleActionErrorMock: vi.fn(),
  revalidateTagMock: vi.fn(),
}));

vi.mock("@/shared/auth/auth-guard", () => ({
  withAuth: withAuthMock,
}));

vi.mock("next/cache", () => ({
  revalidateTag: revalidateTagMock,
}));

vi.mock("@/shared/utils/zod-helpers", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/utils/zod-helpers")>();
  return {
    ...actual,
    safeParseAction: safeParseActionMock,
  };
});

vi.mock("./service", () => ({
  encounterService: {
    create: createMock,
  },
}));

vi.mock("@/shared/errors/app-error", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/errors/app-error")>();
  return {
    ...actual,
    handleActionError: handleActionErrorMock,
  };
});

import { createEncounter } from "./actions";

describe("encounter actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    withAuthMock.mockImplementation(async (_roles, handler) => handler({ user: { id: "user-1", email: "test@example.com" } }));
    handleActionErrorMock.mockReturnValue({ success: false, error: "handled" });
  });

  it("createEncounter: returns success when parse and service succeed", async () => {
    safeParseActionMock.mockReturnValueOnce({ success: true, data: { patientId: 1 } });
    createMock.mockResolvedValueOnce({ id: 50 });

    const result = await createEncounter({ any: "payload" });

    expect(withAuthMock).toHaveBeenCalledWith(["ADMIN", "DOCTOR"], expect.any(Function));
    expect(revalidateTagMock).toHaveBeenCalledWith("encounters");
    expect(revalidateTagMock).toHaveBeenCalledWith("patient-1");
    expect(createMock).toHaveBeenCalledWith({ patientId: 1 }, { id: "user-1", email: "test@example.com" });
    expect(result).toEqual({ success: true, data: { id: 50 } });
  });

  it("createEncounter: returns parse error when validation fails", async () => {
    safeParseActionMock.mockReturnValueOnce({
      success: false,
      error: "Validación fallida",
      fieldErrors: { diagnoses: ["required"] },
    });

    const result = await createEncounter({});

    expect(createMock).not.toHaveBeenCalled();
    expect(revalidateTagMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      error: "Validación fallida",
      fieldErrors: { diagnoses: ["required"] },
    });
  });

  it("createEncounter: delegates unexpected errors to handler", async () => {
    withAuthMock.mockRejectedValueOnce(new Error("boom"));

    const result = await createEncounter({});

    expect(handleActionErrorMock).toHaveBeenCalled();
    expect(result).toEqual({ success: false, error: "handled" });
  });
});