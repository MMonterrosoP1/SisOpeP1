import { encounterRepository } from "./repository";
import { patientRepository } from "../patient/repository";
import { auditService } from "@/shared/audit/audit.service";
import { NotFoundError, ValidationError } from "@/shared/errors/app-error";
import { calculateBmi, classifyBmi } from "./domain/bmi-calculator";
import { CreateEncounterInput } from "./schemas";

export const encounterService = {
  async create(data: CreateEncounterInput, user: { id: string; email: string }) {
    const patient = await patientRepository.findById(data.patientId);
    if (!patient) {
      throw new NotFoundError("Patient not found", "patient", data.patientId);
    }
    if (!patient.active) {
      throw new ValidationError("Cannot create encounter for inactive patient");
    }

    if (data.pregnancyStatus && data.pregnancyStatus !== "NOT_APPLICABLE") {
      if (patient.person?.sex !== "FEMALE") {
        throw new ValidationError("Pregnancy status is only applicable to female patients");
      }
    }

    if (data.gynecologicalHistory && patient.person?.sex !== "FEMALE") {
      throw new ValidationError("Gynecological history is only applicable to female patients");
    }

    let anthropometryToSave = data.anthropometry;
    if (anthropometryToSave?.weight && anthropometryToSave?.height) {
      const bmi = calculateBmi(anthropometryToSave.weight, anthropometryToSave.height);
      const bmiCategory = classifyBmi(bmi);
      anthropometryToSave = {
        ...anthropometryToSave,
        bmi,
        bmiCategory,
      };
      data.anthropometry = anthropometryToSave;
    }

    const previousTypeEncounters = await encounterRepository.findAll(
      { patientId: data.patientId, encounterTypeId: data.encounterTypeId },
      { skip: 0, take: 1 }
    );
    data.isFirstVisit = previousTypeEncounters.totalCount === 0;

    data.practitionerId = user.id;

    const created = await encounterRepository.create({
      ...data,
      createdBy: user.email,
      updatedBy: user.email,
    });

    await auditService.log({
      userId: user.id,
      action: "CREATE",
      entityType: "encounter",
      entityId: created.id,
      newData: created,
    });

    return created;
  },

  async getDetail(id: number) {
    const encounter = await encounterRepository.findById(id);
    if (!encounter) {
      throw new NotFoundError("Encounter not found", "encounter", id);
    }
    return encounter;
  },
};
