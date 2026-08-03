import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { withAuthMock, getEncountersByPatientMock, handleActionErrorMock } = vi.hoisted(() => ({
  withAuthMock: vi.fn(),
  getEncountersByPatientMock: vi.fn(),
  handleActionErrorMock: vi.fn(),
}));

vi.mock("@/shared/auth/auth-guard", () => ({
  withAuth: withAuthMock,
}));

vi.mock("@/features/encounter/queries", () => ({
  getEncountersByPatient: getEncountersByPatientMock,
}));

vi.mock("@/shared/errors/app-error", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/errors/app-error")>();
  return {
    ...actual,
    handleActionError: handleActionErrorMock,
  };
});

import { GET } from "./route";

describe("GET /api/encounters/recent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    withAuthMock.mockImplementation(async (_roles, handler) => handler({ user: { id: "user-1" } }));
    handleActionErrorMock.mockReturnValue({ success: false, error: "handled" });
  });

  it("returns 400 when patientId is missing", async () => {
    const request = new NextRequest("http://localhost/api/encounters/recent");

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ success: false, error: "Valid patientId is required" });
    expect(getEncountersByPatientMock).not.toHaveBeenCalled();
  });

  it("returns 400 when patientId is invalid", async () => {
    const request = new NextRequest("http://localhost/api/encounters/recent?patientId=abc");

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ success: false, error: "Valid patientId is required" });
    expect(getEncountersByPatientMock).not.toHaveBeenCalled();
  });

  it("returns success response with encounter data", async () => {
    getEncountersByPatientMock.mockResolvedValueOnce({ data: [{ id: 1 }, { id: 2 }] });
    const request = new NextRequest("http://localhost/api/encounters/recent?patientId=9");

    const response = await GET(request);
    const body = await response.json();

    expect(withAuthMock).toHaveBeenCalledWith(["ADMIN", "DOCTOR"], expect.any(Function));
    expect(getEncountersByPatientMock).toHaveBeenCalledWith(9, { page: 1, pageSize: 15 });
    expect(response.status).toBe(200);
    expect(body).toEqual({ success: true, data: [{ id: 1 }, { id: 2 }] });
  });

  it("maps unexpected errors with handleActionError", async () => {
    withAuthMock.mockRejectedValueOnce(new Error("boom"));
    const request = new NextRequest("http://localhost/api/encounters/recent?patientId=9");

    const response = await GET(request);
    const body = await response.json();

    expect(handleActionErrorMock).toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(body).toEqual({ success: false, error: "handled" });
  });
});