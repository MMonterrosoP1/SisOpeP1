import { describe, expect, it, vi } from "vitest";

const { authMock, getHandlerMock, postHandlerMock } = vi.hoisted(() => ({
  authMock: { name: "auth-instance" },
  getHandlerMock: vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 })),
  postHandlerMock: vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 })),
}));

vi.mock("@/lib/auth", () => ({
  auth: authMock,
}));

vi.mock("better-auth/next-js", () => ({
  toNextJsHandler: vi.fn(() => ({
    GET: getHandlerMock,
    POST: postHandlerMock,
  })),
}));

import { GET, POST } from "./route";

describe("auth catch-all route wiring", () => {
  it("binds Better Auth handlers and forwards GET/POST", async () => {
    const { toNextJsHandler } = await import("better-auth/next-js");
    expect(toNextJsHandler).toHaveBeenCalledWith(authMock);

    const getResponse = await GET(new Request("http://localhost/api/auth/session"));
    const postResponse = await POST(new Request("http://localhost/api/auth/sign-in", { method: "POST" }));

    expect(getHandlerMock).toHaveBeenCalledTimes(1);
    expect(postHandlerMock).toHaveBeenCalledTimes(1);
    expect(getResponse.status).toBe(200);
    expect(postResponse.status).toBe(200);
  });
});