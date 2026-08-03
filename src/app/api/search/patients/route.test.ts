import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { withAuthMock, searchPatientsMock, handleActionErrorMock } = vi.hoisted(() => ({
  withAuthMock: vi.fn(),
  searchPatientsMock: vi.fn(),
  handleActionErrorMock: vi.fn(),
}));

vi.mock("@/shared/auth/auth-guard", () => ({
  withAuth: withAuthMock,
}));

vi.mock("@/features/patient/queries", () => ({
  searchPatients: searchPatientsMock,
}));

vi.mock("@/shared/errors/app-error", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/errors/app-error")>();
  return {
    ...actual,
    handleActionError: handleActionErrorMock,
  };
});

import { GET } from "./route";

describe("GET /api/search/patients", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    withAuthMock.mockImplementation(async (_roles, handler) => handler({ user: { id: "user-1" } }));
    handleActionErrorMock.mockReturnValue({ success: false, error: "handled" });
  });

  it("returns search results with query", async () => {
    searchPatientsMock.mockResolvedValueOnce([{ id: 1, label: "Ana" }]);
    const request = new NextRequest("http://localhost/api/search/patients?q=ana");

    const response = await GET(request);
    const body = await response.json();

    expect(withAuthMock).toHaveBeenCalledWith(["ADMIN", "DOCTOR"], expect.any(Function));
    expect(searchPatientsMock).toHaveBeenCalledWith("ana");
    expect(response.status).toBe(200);
    expect(body).toEqual({ success: true, data: [{ id: 1, label: "Ana" }] });
  });

  it("uses empty query by default", async () => {
    searchPatientsMock.mockResolvedValueOnce([]);
    const request = new NextRequest("http://localhost/api/search/patients");

    const response = await GET(request);
    const body = await response.json();

    expect(searchPatientsMock).toHaveBeenCalledWith("");
    expect(response.status).toBe(200);
    expect(body).toEqual({ success: true, data: [] });
  });

  it("maps unexpected errors with handleActionError", async () => {
    searchPatientsMock.mockRejectedValueOnce(new Error("boom"));
    const request = new NextRequest("http://localhost/api/search/patients?q=ana");

    const response = await GET(request);
    const body = await response.json();

    expect(handleActionErrorMock).toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(body).toEqual({ success: false, error: "handled" });
  });
});