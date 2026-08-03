import { beforeEach, describe, expect, it, vi } from "vitest";
import { UnauthorizedError } from "@/shared/errors/app-error";

const { getSessionMock, headersMock } = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
  headersMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: getSessionMock,
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: headersMock,
}));

import { getAuthSession, requireActiveUser, requireRole, withAuth } from "./auth-guard";

describe("auth-guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    headersMock.mockResolvedValue(new Headers({ "x-test": "1" }));
  });

  it("getAuthSession returns the session when authenticated", async () => {
    const session = { user: { id: "u1", role: "ADMIN", active: true, banned: false } };
    getSessionMock.mockResolvedValueOnce(session);

    const result = await getAuthSession();

    expect(result).toBe(session);
    expect(getSessionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.any(Headers),
      })
    );
  });

  it("getAuthSession throws UnauthorizedError when session is missing", async () => {
    getSessionMock.mockResolvedValueOnce(null);

    await expect(getAuthSession()).rejects.toBeInstanceOf(UnauthorizedError);
    await expect(getAuthSession()).rejects.toMatchObject({ message: "Not authenticated" });
  });

  it("requireActiveUser throws for banned users", async () => {
    getSessionMock.mockResolvedValueOnce({ user: { id: "u1", role: "DOCTOR", banned: true, active: true } });

    await expect(requireActiveUser()).rejects.toMatchObject({ message: "User is banned" });
  });

  it("requireActiveUser throws for inactive users", async () => {
    getSessionMock.mockResolvedValueOnce({ user: { id: "u1", role: "DOCTOR", banned: false, active: false } });

    await expect(requireActiveUser()).rejects.toMatchObject({ message: "User is inactive" });
  });

  it("requireRole returns session for allowed role", async () => {
    const session = { user: { id: "u1", role: "DOCTOR", banned: false, active: true } };
    getSessionMock.mockResolvedValueOnce(session);

    const result = await requireRole("ADMIN", "DOCTOR");

    expect(result).toBe(session);
  });

  it("requireRole throws ForbiddenError for disallowed role", async () => {
    getSessionMock.mockResolvedValueOnce({ user: { id: "u1", role: "ASSISTANT", banned: false, active: true } });

    await expect(requireRole("ADMIN", "DOCTOR")).rejects.toMatchObject({ message: "Insufficient permissions" });
  });

  it("withAuth executes handler with authorized session", async () => {
    const session = { user: { id: "u1", role: "ADMIN", banned: false, active: true } };
    getSessionMock.mockResolvedValueOnce(session);
    const handler = vi.fn().mockResolvedValue({ ok: true });

    const result = await withAuth(["ADMIN"], handler);

    expect(handler).toHaveBeenCalledWith(session);
    expect(result).toEqual({ ok: true });
  });
});