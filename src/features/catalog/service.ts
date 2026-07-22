import { getCatalogRepo } from "./repository";
import { CatalogType } from "./types";
import { auditService } from "@/shared/audit/audit.service";
import { ConflictError, NotFoundError } from "@/shared/errors/app-error";

export const catalogService = {
  async create(type: CatalogType, data: any, userId: string) {
    const repo = getCatalogRepo(type);
    if (!repo) throw new NotFoundError(`Catalog type ${type} not found`);

    if (data.name) {
      const existing = await repo.findByName(data.name);
      if (existing) {
        throw new ConflictError(`Item with name ${data.name} already exists in ${type}`);
      }
    }

    const created = await repo.create(data);

    await auditService.log({
      userId,
      action: "CREATE",
      entityType: type,
      entityId: created.id,
      newData: created,
    });

    return created;
  },

  async update(type: CatalogType, id: number, data: any, userId: string) {
    const repo = getCatalogRepo(type);
    if (!repo) throw new NotFoundError(`Catalog type ${type} not found`);

    const existingItem = await repo.findById(id);
    if (!existingItem) {
      throw new NotFoundError(`Item with id ${id} not found in ${type}`);
    }

    if (data.name && data.name !== existingItem.name) {
      const existingName = await repo.findByName(data.name);
      if (existingName) {
        throw new ConflictError(`Item with name ${data.name} already exists in ${type}`);
      }
    }

    const updated = await repo.update(id, data);

    await auditService.log({
      userId,
      action: "UPDATE",
      entityType: type,
      entityId: id,
      previousData: existingItem,
      newData: updated,
    });

    return updated;
  },

  async toggleActive(type: CatalogType, id: number, userId: string) {
    const repo = getCatalogRepo(type);
    if (!repo) throw new NotFoundError(`Catalog type ${type} not found`);

    const existingItem = await repo.findById(id);
    if (!existingItem) {
      throw new NotFoundError(`Item with id ${id} not found in ${type}`);
    }

    if (existingItem.active === undefined) {
      throw new ConflictError(`Catalog type ${type} does not support soft delete`);
    }

    const updated = await repo.update(id, { active: !existingItem.active });

    await auditService.log({
      userId,
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
