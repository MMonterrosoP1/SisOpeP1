import { NotFoundError } from "@/shared/errors/app-error";
import { UpsertPatientHistoryInput } from "./schemas";
import { patientHistoryRepository } from "./repository";
import { prisma } from "@/lib/prisma";

export const patientHistoryService = {
  async getByPatientId(patientId: number) {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { id: true, active: true },
    });

    if (!patient || !patient.active) {
      throw new NotFoundError("Paciente no encontrado o inactivo");
    }

    return patientHistoryRepository.findByPatientId(patientId);
  },

  async upsert(patientId: number, data: UpsertPatientHistoryInput, user: { id: string, email: string }) {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { id: true, active: true },
    });

    if (!patient || !patient.active) {
      throw new NotFoundError("Paciente no encontrado o inactivo");
    }

    await patientHistoryRepository.upsert(patientId, data, { 
      userId: user.id
    });

    return { success: true };
  },
};
