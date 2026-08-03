import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { withAuthMock, searchIcd10Mock, handleActionErrorMock } = vi.hoisted(() => ({
  withAuthMock: vi.fn(),
  searchIcd10Mock: vi.fn(),
  handleActionErrorMock: vi.fn(),
}));

vi.mock("@/shared/auth/auth-guard", () => ({
  withAuth: withAuthMock,
}));

vi.mock("@/features/catalog/queries", () => ({
  searchIcd10: searchIcd10Mock,
}));

vi.mock("@/shared/errors/app-error", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/errors/app-error")>();
  return {
    ...actual,
    handleActionError: handleActionErrorMock,
  };
});

import { GET } from "./route";

describe("GET /api/search/icd10", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    withAuthMock.mockImplementation(async (_roles, handler) => handler({ user: { id: "user-1" } }));
    handleActionErrorMock.mockReturnValue({ success: false, error: "handled" });
  });

  it("returns search results with query", async () => {
    searchIcd10Mock.mockResolvedValueOnce([{ id: 1, code: "A00" }]);
    const request = new NextRequest("http://localhost/api/search/icd10?q=a0");

    const response = await GET(request);
    const body = await response.json();

    expect(withAuthMock).toHaveBeenCalledWith(["ADMIN", "DOCTOR"], expect.any(Function));
    expect(searchIcd10Mock).toHaveBeenCalledWith("a0");
    expect(response.status).toBe(200);
    expect(body).toEqual({ success: true, data: [{ id: 1, code: "A00" }] });
  });

  it("uses empty query by default", async () => {
    searchIcd10Mock.mockResolvedValueOnce([]);
    const request = new NextRequest("http://localhost/api/search/icd10");

    const response = await GET(request);
    const body = await response.json();

    expect(searchIcd10Mock).toHaveBeenCalledWith("");
    expect(response.status).toBe(200);
    expect(body).toEqual({ success: true, data: [] });
  });

  it("maps unexpected errors with handleActionError", async () => {
    searchIcd10Mock.mockRejectedValueOnce(new Error("boom"));
    const request = new NextRequest("http://localhost/api/search/icd10?q=a0");

    const response = await GET(request);
    const body = await response.json();

    expect(handleActionErrorMock).toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(body).toEqual({ success: false, error: "handled" });
  });
});