import { beforeEach, describe, expect, it, vi } from "vitest";

const { withAuthMock, safeParseActionMock, generateDocumentMock, handleActionErrorMock } = vi.hoisted(() => ({
  withAuthMock: vi.fn(),
  safeParseActionMock: vi.fn(),
  generateDocumentMock: vi.fn(),
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
  documentService: {
    generateDocument: generateDocumentMock,
  },
}));

vi.mock("@/shared/errors/app-error", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/errors/app-error")>();
  return {
    ...actual,
    handleActionError: handleActionErrorMock,
  };
});

import { generateDocumentAction } from "./actions";

describe("document actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    withAuthMock.mockImplementation(async (_roles, handler) => handler({ user: { id: "user-1" } }));
    handleActionErrorMock.mockReturnValue({ success: false, error: "handled" });
  });

  it("generateDocumentAction: returns success when parse and service succeed", async () => {
    safeParseActionMock.mockReturnValueOnce({
      success: true,
      data: { encounterId: 10, documentTypeCode: "MEDICAL_CERTIFICATE" },
    });
    generateDocumentMock.mockResolvedValueOnce({ id: 300, pdfUrl: "x" });

    const result = await generateDocumentAction({ any: "payload" });

    expect(withAuthMock).toHaveBeenCalledWith(["ADMIN", "DOCTOR"], expect.any(Function));
    expect(generateDocumentMock).toHaveBeenCalledWith(10, "user-1", "MEDICAL_CERTIFICATE");
    expect(result).toEqual({ success: true, data: { id: 300, pdfUrl: "x" } });
  });

  it("generateDocumentAction: returns parse error when validation fails", async () => {
    safeParseActionMock.mockReturnValueOnce({
      success: false,
      error: "Validación fallida",
      fieldErrors: { encounterId: ["required"] },
    });

    const result = await generateDocumentAction({});

    expect(generateDocumentMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      error: "Validación fallida",
      fieldErrors: { encounterId: ["required"] },
    });
  });

  it("generateDocumentAction: delegates unexpected errors to handler", async () => {
    withAuthMock.mockRejectedValueOnce(new Error("boom"));

    const result = await generateDocumentAction({});

    expect(handleActionErrorMock).toHaveBeenCalled();
    expect(result).toEqual({ success: false, error: "handled" });
  });
});