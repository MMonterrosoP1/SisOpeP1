import { patientRepository } from "./repository";
import { auditService } from "@/shared/audit/audit.service";
import { ConflictError, NotFoundError } from "@/shared/errors/app-error";
import { PatientCreateInput, PatientUpdateInput } from "./types";

export const patientService = {
  async create(data: PatientCreateInput, userId: string) {
    const existing = await patientRepository.findByDocument(data.identityDocument);
    if (existing) {
      throw new ConflictError(`El paciente con documento ${data.identityDocument} ya existe`, {
        identityDocument: ["Ya existe un paciente registrado con este documento"],
      });
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

  async update(id: number, data: PatientUpdateInput, userId: string) {
    const existingPatient = await patientRepository.findById(id);
    if (!existingPatient) {
      throw new NotFoundError("Paciente no encontrado", "patient", id);
    }

    if (data.identityDocument && data.identityDocument !== existingPatient.identityDocument) {
      const existing = await patientRepository.findByDocument(data.identityDocument);
      if (existing) {
        throw new ConflictError(`El paciente con documento ${data.identityDocument} ya existe`, {
          identityDocument: ["Ya existe un paciente registrado con este documento"],
        });
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
      throw new NotFoundError("Paciente no encontrado", "patient", id);
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
