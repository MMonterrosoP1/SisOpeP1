import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    auditLog: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

import { auditRepository } from "./audit.repository";

describe("auditRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("create: delegates to prisma.auditLog.create", async () => {
    prismaMock.auditLog.create.mockResolvedValueOnce({ id: 1 });
    const data = {
      userId: "u1",
      action: "CREATE",
      entityType: "patient",
      entityId: "10",
    };

    await auditRepository.create(data as never);

    expect(prismaMock.auditLog.create).toHaveBeenCalledWith({ data });
  });

  it("findByEntity: applies entity filters and sort", async () => {
    prismaMock.auditLog.findMany.mockResolvedValueOnce([]);

    await auditRepository.findByEntity("patient", "10");

    expect(prismaMock.auditLog.findMany).toHaveBeenCalledWith({
      where: { entityType: "patient", entityId: "10" },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true, image: true } } },
    });
  });

  it("findByUser: applies range when provided", async () => {
    prismaMock.auditLog.findMany.mockResolvedValueOnce([]);
    const from = new Date("2026-01-01T00:00:00.000Z");
    const to = new Date("2026-01-31T23:59:59.000Z");

    await auditRepository.findByUser("u1", { from, to });

    expect(prismaMock.auditLog.findMany).toHaveBeenCalledWith({
      where: {
        userId: "u1",
        createdAt: { gte: from, lte: to },
      },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true, image: true } } },
    });
  });

  it("findByUser: omits range when not provided", async () => {
    prismaMock.auditLog.findMany.mockResolvedValueOnce([]);

    await auditRepository.findByUser("u1");

    expect(prismaMock.auditLog.findMany).toHaveBeenCalledWith({
      where: { userId: "u1" },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true, image: true } } },
    });
  });
});