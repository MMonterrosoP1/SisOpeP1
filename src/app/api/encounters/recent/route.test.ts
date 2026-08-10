import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { withAuthMock, getEncountersMock } = vi.hoisted(() => ({
  withAuthMock: vi.fn(),
  getEncountersMock: vi.fn(),
}));

vi.mock("@/shared/auth/auth-guard", () => ({
  withAuth: withAuthMock,
}));

vi.mock("@/features/encounter/queries", () => ({
  getEncounters: getEncountersMock,
}));

import { GET } from "./route";

describe("GET /api/encounters/recent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    withAuthMock.mockImplementation(async (_roles, handler) => handler({ user: { id: "user-1", email: "test@test.com" } }));
  });

  it("returns 400 when patientId is missing", async () => {
    const request = new NextRequest("http://localhost/api/encounters/recent");

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ success: false, error: "Valid patientId is required" });
    expect(getEncountersMock).not.toHaveBeenCalled();
  });

  it("returns 400 when patientId is invalid", async () => {
    const request = new NextRequest("http://localhost/api/encounters/recent?patientId=abc");

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ success: false, error: "Valid patientId is required" });
    expect(getEncountersMock).not.toHaveBeenCalled();
  });

  it("returns success response with encounter data", async () => {
    getEncountersMock.mockResolvedValueOnce({ data: [{ id: 1 }, { id: 2 }] });
    const request = new NextRequest("http://localhost/api/encounters/recent?patientId=9");

    const response = await GET(request);
    const body = await response.json();

    expect(withAuthMock).toHaveBeenCalledWith(["ADMIN", "DOCTOR"], expect.any(Function));
    expect(getEncountersMock).toHaveBeenCalledWith({ patientId: 9 }, { page: 1, pageSize: 15 });
    expect(response.status).toBe(200);
    expect(body).toEqual({ success: true, data: [{ id: 1 }, { id: 2 }] });
  });

  it("returns 500 for unexpected errors", async () => {
    withAuthMock.mockRejectedValueOnce(new Error("boom"));
    const request = new NextRequest("http://localhost/api/encounters/recent?patientId=9");

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: "Internal Server Error" });
  });
});