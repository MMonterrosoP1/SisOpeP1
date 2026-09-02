
import { getCatalogRepo } from "./repository";
import { CatalogType } from "./types";
import { auditService } from "@/shared/audit/audit.service";
import { ConflictError, NotFoundError } from "@/shared/errors/app-error";

export const catalogService = {
  async create(type: CatalogType, data: Record<string, any>, user: { id: string; email: string }) {
    const repo = getCatalogRepo(type);
    if (!repo) throw new NotFoundError(`Catalog type ${type} not found`);

    if (data.name) {
      data.name = data.name.toUpperCase();
      const existing = await repo.findByName(data.name);
      if (existing) {
        throw new ConflictError(`El elemento con nombre ${data.name} ya existe en el catálogo`, {
          name: ["Ya existe un elemento con este nombre"],
        });
      }
    }

    const insertData: any = { ...data, createdBy: user.email, updatedBy: user.email };

    const created = await repo.create(insertData);

    await auditService.log({
      userId: user.id,
      action: "CREATE",
      entityType: type,
      entityId: created.id,
      newData: created,
    });

    return created;
  },

  async update(type: CatalogType, id: number, data: Record<string, any>, user: { id: string; email: string }) {
    const repo = getCatalogRepo(type);
    if (!repo) throw new NotFoundError(`Catalog type ${type} not found`);

    const existingItem = await repo.findById(id);
    if (!existingItem) {
      throw new NotFoundError(`No se encontró el elemento con ID ${id} en ${type}`);
    }

    if (data.name && data.name.toUpperCase() !== existingItem.name.toUpperCase()) {
      data.name = data.name.toUpperCase();
      const existingName = await repo.findByName(data.name);
      if (existingName) {
        throw new ConflictError(`El elemento con nombre ${data.name} ya existe en el catálogo`, {
          name: ["Ya existe un elemento con este nombre"],
        });
      }
    }

    const updateData: any = { ...data, updatedBy: user.email };

    const updated = await repo.update(id, updateData);

    await auditService.log({
      userId: user.id,
      action: "UPDATE",
      entityType: type,
      entityId: id,
      previousData: existingItem,
      newData: updated,
    });

    return updated;
  },

  async toggleActive(type: CatalogType, id: number, user: { id: string; email: string }) {
    const repo = getCatalogRepo(type);
    if (!repo) throw new NotFoundError(`Catalog type ${type} not found`);

    const existingItem = await repo.findById(id);
    if (!existingItem) {
      throw new NotFoundError(`No se encontró el elemento con ID ${id} en ${type}`);
    }

    if (!('active' in existingItem)) {
      throw new ConflictError(`El tipo de catálogo ${type} no admite borrado lógico (soft delete)`);
    }

    const updateData = { active: !existingItem.active, updatedBy: user.email };

    const updated = await repo.update(id, updateData);

    await auditService.log({
      userId: user.id,
      action: "UPDATE",
      entityType: type,
      entityId: id,
      previousData: existingItem,
      newData: updated,
      description: `Toggled active status to ${updated.active}`,
    });

    return updated;
  },
};
