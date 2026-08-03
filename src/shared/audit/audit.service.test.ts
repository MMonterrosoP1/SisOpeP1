import { beforeEach, describe, expect, it, vi } from "vitest";

const { auditCreateMock, headersMock, afterMock } = vi.hoisted(() => ({
  auditCreateMock: vi.fn(),
  headersMock: vi.fn(),
  afterMock: vi.fn((callback: () => Promise<void> | void) => callback()),
}));

vi.mock("./audit.repository", () => ({
  auditRepository: {
    create: auditCreateMock,
  },
}));

vi.mock("next/headers", () => ({
  headers: headersMock,
}));

vi.mock("next/server", () => ({
  after: afterMock,
}));

import { auditService } from "./audit.service";

describe("auditService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  it("log: persists audit data including headers", async () => {
    headersMock.mockResolvedValueOnce(
      new Headers({
        "x-forwarded-for": "10.0.0.1",
        "user-agent": "Vitest",
      })
    );
    auditCreateMock.mockResolvedValueOnce({ id: 1 });

    await auditService.log({
      userId: "u1",
      action: "CREATE",
      entityType: "patient",
      entityId: 10,
      previousData: { a: 1 },
      newData: { b: 2 },
      description: "test",
    });

    expect(afterMock).toHaveBeenCalled();
    expect(auditCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "u1",
        action: "CREATE",
        entityType: "patient",
        entityId: "10",
        previousData: { a: 1 },
        newData: { b: 2 },
        description: "test",
        ipAddress: "10.0.0.1",
        userAgent: "Vitest",
      })
    );
  });

  it("log: handles missing request context", async () => {
    headersMock.mockRejectedValueOnce(new Error("outside request"));
    auditCreateMock.mockResolvedValueOnce({ id: 1 });

    await auditService.log({
      userId: "u1",
      action: "UPDATE",
      entityType: "catalog",
      entityId: "x",
    });

    expect(console.warn).toHaveBeenCalledWith("[Audit Service] Could not retrieve headers");
    expect(auditCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ipAddress: null,
        userAgent: null,
      })
    );
  });

  it("log: swallows repository errors inside after callback", async () => {
    headersMock.mockResolvedValueOnce(new Headers());
    auditCreateMock.mockRejectedValueOnce(new Error("db down"));

    await auditService.log({
      userId: "u1",
      action: "DELETE",
      entityType: "document",
      entityId: 77,
    });

    expect(console.error).toHaveBeenCalledWith(
      "[Audit Service] Failed to create audit log:",
      expect.any(Error)
    );
  });
});