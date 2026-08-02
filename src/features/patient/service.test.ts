import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConflictError, NotFoundError } from "@/shared/errors/app-error";

const { repositoryMock, auditServiceMock } = vi.hoisted(() => ({
  repositoryMock: {
    findByDocument: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    toggleActive: vi.fn(),
  },
  auditServiceMock: {
    log: vi.fn(),
  },
}));

vi.mock("./repository", () => ({
  patientRepository: repositoryMock,
}));

vi.mock("@/shared/audit/audit.service", () => ({
  auditService: auditServiceMock,
}));

import { patientService } from "./service";

describe("patientService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("create: lanza ConflictError si ya existe documento", async () => {
    repositoryMock.findByDocument.mockResolvedValueOnce({ id: 10 });

    await expect(
      patientService.create({ identityDocument: "1234567890123" } as never, "user-1")
    ).rejects.toBeInstanceOf(ConflictError);

    expect(repositoryMock.create).not.toHaveBeenCalled();
    expect(auditServiceMock.log).not.toHaveBeenCalled();
  });

  it("create: crea paciente y registra auditoría", async () => {
    const created = { id: 21, active: true };
    repositoryMock.findByDocument.mockResolvedValueOnce(null);
    repositoryMock.create.mockResolvedValueOnce(created);

    const result = await patientService.create({ identityDocument: "1234567890123" } as never, "user-1");

    expect(result).toBe(created);
    expect(auditServiceMock.log).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        action: "CREATE",
        entityType: "patient",
        entityId: 21,
        newData: created,
      })
    );
  });

  it("update: lanza NotFoundError si el paciente no existe", async () => {
    repositoryMock.findById.mockResolvedValueOnce(null);

    await expect(patientService.update(999, {}, "user-1")).rejects.toBeInstanceOf(NotFoundError);

    expect(repositoryMock.update).not.toHaveBeenCalled();
    expect(auditServiceMock.log).not.toHaveBeenCalled();
  });

  it("update: lanza ConflictError cuando cambia a documento ya existente", async () => {
    repositoryMock.findById.mockResolvedValueOnce({ person: { identityDocument: "111" } });
    repositoryMock.findByDocument.mockResolvedValueOnce({ id: 88 });

    await expect(
      patientService.update(10, { identityDocument: "222" } as never, "user-1")
    ).rejects.toBeInstanceOf(ConflictError);

    expect(repositoryMock.update).not.toHaveBeenCalled();
    expect(auditServiceMock.log).not.toHaveBeenCalled();
  });

  it("update: actualiza y audita cuando el cambio es válido", async () => {
    const previous = { id: 10, person: { identityDocument: "111" } };
    const updated = { id: 10, active: true };

    repositoryMock.findById.mockResolvedValueOnce(previous);
    repositoryMock.findByDocument.mockResolvedValueOnce(null);
    repositoryMock.update.mockResolvedValueOnce(updated);

    const result = await patientService.update(10, { identityDocument: "222" } as never, "user-1");

    expect(result).toBe(updated);
    expect(auditServiceMock.log).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        action: "UPDATE",
        entityType: "patient",
        entityId: 10,
        previousData: previous,
        newData: updated,
      })
    );
  });

  it("toggleActive: lanza NotFoundError si no existe", async () => {
    repositoryMock.findById.mockResolvedValueOnce(null);

    await expect(patientService.toggleActive(10, "user-1")).rejects.toBeInstanceOf(NotFoundError);

    expect(repositoryMock.toggleActive).not.toHaveBeenCalled();
  });

  it("toggleActive: alterna estado y registra auditoría", async () => {
    const previous = { id: 10, active: true };
    const updated = { id: 10, active: false };

    repositoryMock.findById.mockResolvedValueOnce(previous);
    repositoryMock.toggleActive.mockResolvedValueOnce(updated);

    const result = await patientService.toggleActive(10, "user-1");

    expect(result).toBe(updated);
    expect(auditServiceMock.log).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        action: "UPDATE",
        entityType: "patient",
        entityId: 10,
        previousData: previous,
        newData: updated,
        description: "Toggled active status to false",
      })
    );
  });
});
