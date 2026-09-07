import { encounterRepository } from "./repository";
import { patientRepository } from "../patient/repository";
import { patientHistoryRepository } from "../patient-history/repository";
import { auditService } from "@/shared/audit/audit.service";
import { NotFoundError, ValidationError } from "@/shared/errors/app-error";
import { calculateBmi, classifyBmi } from "./domain/bmi-calculator";
import { CreateEncounterInput, UpdateEncounterInput } from "./schemas";
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

    let emailStatus: "success" | "error" | "none" = "none";
    let emailErrorMessage: string | undefined = undefined;

    if (patient.person?.email) {
      const practitionerName = `${practitioner.givenNames} ${practitioner.familyNames}`;
      const patientName = `${patient.person.givenNames} ${patient.person.familyNames}`;
      
      try {
        const fullEncounter = await encounterRepository.findById(created.id);
        const { emailService } = await import("@/lib/email");
        await emailService.sendAppointmentEmail(
          patient.person.email,
          { date: created.createdAt, practitionerName, patientName },
          fullEncounter || created
        );
        emailStatus = "success";
      } catch (error: any) {
        console.error("Error al enviar el correo:", error);
        emailStatus = "error";
        emailErrorMessage = error.message || "Error desconocido al enviar el correo";
      }
    }

    return { ...created, emailStatus, emailErrorMessage };
  },

  async getDetail(id: number) {
    const encounter = await encounterRepository.findById(id);
    if (!encounter) {
      throw new NotFoundError("Consulta no encontrada", "encounter", id);
    }
    return encounter;
  },

  async update(data: UpdateEncounterInput, user: { id: string; email: string }) {
    const existing = await encounterRepository.findById(data.id);
    if (!existing) {
      throw new NotFoundError("Consulta no encontrada", "encounter", data.id);
    }

    const patient = await patientRepository.findById(data.patientId);
    if (!patient) {
      throw new NotFoundError("Paciente no encontrado", "patient", data.patientId);
    }
    if (!patient.active) {
      throw new ValidationError("No se puede actualizar una consulta de un paciente inactivo");
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

    const updated = await encounterRepository.update(data.id, {
      ...encounterData,
      updatedBy: user.email,
    });

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
      } as any,
      { userId: user.email }
    );

    await auditService.log({
      userId: user.id,
      action: "UPDATE",
      entityType: "encounter",
      entityId: updated!.id,
      previousData: existing,
      newData: updated,
    });

    return updated;
  },
};
