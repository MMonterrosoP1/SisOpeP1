import { revalidateTag } from "next/cache";
import { getCatalogRepo } from "./repository";
import { CatalogType } from "./types";
import { auditService } from "@/shared/audit/audit.service";
import { ConflictError, NotFoundError } from "@/shared/errors/app-error";

export const catalogService = {
  async create(type: CatalogType, data: any, userId: string) {
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

    const insertData = { ...data, createdById: userId, updatedById: userId };

    const created = await repo.create(insertData);

    await auditService.log({
      userId,
      action: "CREATE",
      entityType: type,
      entityId: created.id,
      newData: created,
    });

    revalidateTag(`catalog-${type}`, "max");

    return created;
  },

  async update(type: CatalogType, id: number, data: any, userId: string) {
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

    const updateData = { ...data, updatedById: userId };

    const updated = await repo.update(id, updateData);

    await auditService.log({
      userId,
      action: "UPDATE",
      entityType: type,
      entityId: id,
      previousData: existingItem,
      newData: updated,
    });

    revalidateTag(`catalog-${type}`, "max");
    revalidateTag(`catalog-${type}-${id}`, "max");

    return updated;
  },

  async toggleActive(type: CatalogType, id: number, userId: string) {
    const repo = getCatalogRepo(type);
    if (!repo) throw new NotFoundError(`Catalog type ${type} not found`);

    const existingItem = await repo.findById(id);
    if (!existingItem) {
      throw new NotFoundError(`No se encontró el elemento con ID ${id} en ${type}`);
    }

    if (!('active' in existingItem)) {
      throw new ConflictError(`El tipo de catálogo ${type} no admite borrado lógico (soft delete)`);
    }

    const updateData = { active: !existingItem.active, updatedById: userId };

    const updated = await repo.update(id, updateData);

    await auditService.log({
      userId,
      action: "UPDATE",
      entityType: type,
      entityId: id,
      previousData: existingItem,
      newData: updated,
      description: `Toggled active status to ${updated.active}`,
    });

    revalidateTag(`catalog-${type}`, "max");
    revalidateTag(`catalog-${type}-${id}`, "max");

    return updated;
  },
};
