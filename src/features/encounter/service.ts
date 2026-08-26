import { encounterRepository } from "./repository";
import { patientRepository } from "../patient/repository";
import { patientHistoryRepository } from "../patient-history/repository";
import { auditService } from "@/shared/audit/audit.service";
import { NotFoundError, ValidationError } from "@/shared/errors/app-error";
import { calculateBmi, classifyBmi } from "./domain/bmi-calculator";
import { CreateEncounterInput } from "./schemas";
import { prisma } from "@/lib/prisma";

export const encounterService = {
  async create(data: CreateEncounterInput, user: { id: string; email: string }) {
    const patient = await patientRepository.findById(data.patientId);
    if (!patient) {
      throw new NotFoundError("Paciente no encontrado", "patient", data.patientId);
    }
    if (!patient.active) {
      throw new ValidationError("No se puede crear una consulta para un paciente inactivo");
    }

    if (data.pregnancyStatus && data.pregnancyStatus !== "NOT_APPLICABLE") {
      if (patient.person?.sex !== "FEMALE") {
        throw new ValidationError("El estado de embarazo solo es aplicable a pacientes femeninas");
      }
    }

    if (data.gynecologicalHistory && patient.person?.sex !== "FEMALE") {
      throw new ValidationError("La historia ginecológica solo es aplicable a pacientes femeninas");
    }

    let anthropometryToSave = data.anthropometry;
    
    if (anthropometryToSave?.height && anthropometryToSave.height < 3) {
      // Normalize meters to centimeters
      anthropometryToSave.height = anthropometryToSave.height * 100;
    }
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

    data.isFirstVisit = previousTypeEncounters.totalCount === 0;

    const practitioner = await prisma.practitioner.findUnique({
      where: { userId: user.id }
    });
    
    if (!practitioner) {
      throw new ValidationError("El usuario actual no tiene un perfil de médico asociado");
    }

    data.practitionerId = practitioner.id;

    // Remove history arrays from data before passing to repository
    const {
      allergies,
      habits,
      exercises,
      medicalHistory,
      surgicalHistory,
      traumaHistory,
      familyHistory,
      ...encounterData
    } = data;

    const created = await encounterRepository.create({
      ...encounterData,
      createdBy: user.email,
      updatedBy: user.email,
    });

    // Upsert patient history
    await patientHistoryRepository.upsert(
      data.patientId,
      {
        allergies,
        habits,
        exercises,
        medicalHistory,
        surgicalHistory,
        traumaHistory,
        familyHistory,
      } as any, // Cast because we accept z.any() from the form for now
      { userId: user.email }
    );

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
      throw new NotFoundError("Consulta no encontrada", "encounter", id);
    }
    return encounter;
  },
};
