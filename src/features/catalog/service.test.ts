import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConflictError, NotFoundError } from "@/shared/errors/app-error";

const { getCatalogRepoMock, auditLogMock } = vi.hoisted(() => ({
  getCatalogRepoMock: vi.fn(),
  auditLogMock: vi.fn(),
}));

vi.mock("./repository", () => ({
  getCatalogRepo: getCatalogRepoMock,
}));



vi.mock("@/shared/audit/audit.service", () => ({
  auditService: {
    log: auditLogMock,
  },
}));

import { catalogService } from "./service";

function buildRepo(overrides?: Partial<Record<string, ReturnType<typeof vi.fn>>>) {
  return {
    findByName: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    ...overrides,
  };
}

describe("catalogService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("create: throws NotFoundError for unknown repo", async () => {
    getCatalogRepoMock.mockReturnValueOnce(undefined);

    await expect(catalogService.create("company", { name: "ABC" }, { id: "u1", email: "test@example.com" })).rejects.toBeInstanceOf(NotFoundError);
  });

  it("create: uppercases name and throws ConflictError when duplicated", async () => {
    const repo = buildRepo();
    repo.findByName.mockResolvedValueOnce({ id: 1 });
    getCatalogRepoMock.mockReturnValueOnce(repo);

    await expect(catalogService.create("company", { name: "empresa" }, { id: "u1", email: "test@example.com" })).rejects.toBeInstanceOf(ConflictError);
    expect(repo.findByName).toHaveBeenCalledWith("EMPRESA");
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("create: creates item, audits and revalidates", async () => {
    const repo = buildRepo();
    repo.findByName.mockResolvedValueOnce(null);
    repo.create.mockResolvedValueOnce({ id: 10, name: "EMPRESA" });
    getCatalogRepoMock.mockReturnValueOnce(repo);

    const result = await catalogService.create("company", { name: "empresa" }, { id: "u1", email: "test@example.com" });

    expect(result).toEqual({ id: 10, name: "EMPRESA" });
    expect(repo.create).toHaveBeenCalledWith({ name: "EMPRESA", createdBy: "test@example.com", updatedBy: "test@example.com" });
    expect(auditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "u1",
        action: "CREATE",
        entityType: "company",
        entityId: 10,
      })
    );
  });

  it("update: throws NotFoundError when item does not exist", async () => {
    const repo = buildRepo();
    repo.findById.mockResolvedValueOnce(null);
    getCatalogRepoMock.mockReturnValueOnce(repo);

    await expect(catalogService.update("company", 5, { name: "NUEVO" }, { id: "u1", email: "test@example.com" })).rejects.toBeInstanceOf(NotFoundError);
  });

  it("update: checks duplicate name only when changed", async () => {
    const repo = buildRepo();
    repo.findById.mockResolvedValueOnce({ id: 5, name: "OLD" });
    repo.findByName.mockResolvedValueOnce({ id: 6, name: "NEW" });
    getCatalogRepoMock.mockReturnValueOnce(repo);

    await expect(catalogService.update("company", 5, { name: "new" }, { id: "u1", email: "test@example.com" })).rejects.toBeInstanceOf(ConflictError);
    expect(repo.findByName).toHaveBeenCalledWith("NEW");
  });

  it("update: updates, audits and revalidates", async () => {
    const repo = buildRepo();
    repo.findById.mockResolvedValueOnce({ id: 5, name: "OLD", active: true });
    repo.findByName.mockResolvedValueOnce(null);
    repo.update.mockResolvedValueOnce({ id: 5, name: "NEW", active: true });
    getCatalogRepoMock.mockReturnValueOnce(repo);

    const result = await catalogService.update("company", 5, { name: "new" }, { id: "u1", email: "test@example.com" });

    expect(result).toEqual({ id: 5, name: "NEW", active: true });
    expect(repo.update).toHaveBeenCalledWith(5, { name: "NEW", updatedBy: "test@example.com" });
  });

  it("toggleActive: throws ConflictError for catalogs without active field", async () => {
    const repo = buildRepo();
    repo.findById.mockResolvedValueOnce({ id: 5, name: "X" });
    getCatalogRepoMock.mockReturnValueOnce(repo);

    await expect(catalogService.toggleActive("company", 5, { id: "u1", email: "test@example.com" })).rejects.toBeInstanceOf(ConflictError);
  });

  it("toggleActive: toggles active, audits and revalidates", async () => {
    const repo = buildRepo();
    repo.findById.mockResolvedValueOnce({ id: 5, name: "X", active: true });
    repo.update.mockResolvedValueOnce({ id: 5, name: "X", active: false });
    getCatalogRepoMock.mockReturnValueOnce(repo);

    const result = await catalogService.toggleActive("company", 5, { id: "u1", email: "test@example.com" });

    expect(result).toEqual({ id: 5, name: "X", active: false });
    expect(repo.update).toHaveBeenCalledWith(5, { active: false, updatedBy: "test@example.com" });
    expect(auditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "UPDATE",
        entityType: "company",
        entityId: 5,
        description: "Toggled active status to false",
      })
    );
  });
});