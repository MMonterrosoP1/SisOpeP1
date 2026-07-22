import { patientRepository } from "./repository";
import { auditService } from "@/shared/audit/audit.service";
import { ConflictError, NotFoundError } from "@/shared/errors/app-error";

export const patientService = {
  async create(data: any, userId: string) {
    const existing = await patientRepository.findByDocument(data.identityDocument);
    if (existing) {
      throw new ConflictError(`A patient with document ${data.identityDocument} already exists`);
    }

    const created = await patientRepository.create(data);

    await auditService.log({
      userId,
      action: "CREATE",
      entityType: "patient",
      entityId: created.id,
      newData: created,
    });

    return created;
  },

  async update(id: number, data: any, userId: string) {
    const existingPatient = await patientRepository.findById(id);
    if (!existingPatient) {
      throw new NotFoundError("Patient not found", "patient", id);
    }

    if (data.identityDocument && data.identityDocument !== existingPatient.identityDocument) {
      const existing = await patientRepository.findByDocument(data.identityDocument);
      if (existing) {
        throw new ConflictError(`A patient with document ${data.identityDocument} already exists`);
      }
    }

    const updated = await patientRepository.update(id, data);

    await auditService.log({
      userId,
      action: "UPDATE",
      entityType: "patient",
      entityId: id,
      previousData: existingPatient,
      newData: updated,
    });

    return updated;
  },

  async toggleActive(id: number, userId: string) {
    const existingPatient = await patientRepository.findById(id);
    if (!existingPatient) {
      throw new NotFoundError("Patient not found", "patient", id);
    }

    const updated = await patientRepository.toggleActive(id);

    await auditService.log({
      userId,
      action: "UPDATE",
      entityType: "patient",
      entityId: id,
      previousData: existingPatient,
      newData: updated,
      description: `Toggled active status to ${updated?.active}`,
    });

    return updated;
  },
};
