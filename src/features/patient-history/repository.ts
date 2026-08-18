import { prisma } from "@/lib/prisma";
import { UpsertPatientHistoryInput } from "./schemas";
import { Prisma } from "@/generated/prisma/client";

export const patientHistoryRepository = {
  async findByPatientId(patientId: number) {
    const [
      medicalHistory,
      surgicalHistory,
      traumaHistory,
      familyHistory,
      allergies,
      habits,
      exercises,
    ] = await Promise.all([
      prisma.patientMedicalHistory.findMany({
        where: { patientId, active: true },
        include: { icd10Code: true },
      }),
      prisma.patientSurgicalHistory.findMany({
        where: { patientId, active: true },
        include: { surgicalProcedure: true },
      }),
      prisma.patientTraumaHistory.findMany({
        where: { patientId, active: true },
        include: { icd10Code: true },
      }),
      prisma.patientFamilyHistory.findMany({
        where: { patientId, active: true },
        include: { icd10Code: true },
      }),
      prisma.patientAllergy.findMany({
        where: { patientId, active: true },
        include: { allergenCatalog: true },
      }),
      prisma.patientHabit.findMany({
        where: { patientId, active: true },
        include: { habitCatalog: true },
      }),
      prisma.patientExercise.findMany({
        where: { patientId, active: true },
        include: { exerciseCatalog: true },
      }),
    ]);

    return {
      medicalHistory,
      surgicalHistory,
      traumaHistory,
      familyHistory,
      allergies,
      habits,
      exercises,
    };
  },

  async upsert(patientId: number, data: UpsertPatientHistoryInput, meta: { userId: string }) {
    return prisma.$transaction(async (tx) => {
      // 1. Medical History
      const existingMedical = await tx.patientMedicalHistory.findMany({ where: { patientId, active: true } });
      const newMedicalIds = data.medicalHistory?.map(m => m.icd10CodeId!) || [];
      for (const m of (data.medicalHistory || [])) {
        const existing = existingMedical.find(e => e.icd10CodeId === m.icd10CodeId);
        if (existing) {
          await tx.patientMedicalHistory.update({
            where: { id: existing.id },
            data: { observations: m.observations, updatedBy: meta.userId }
          });
        } else {
          await tx.patientMedicalHistory.create({
            data: { patientId, icd10CodeId: m.icd10CodeId!, observations: m.observations, active: true, createdBy: meta.userId, updatedBy: meta.userId }
          });
        }
      }
      const toDeleteMedical = existingMedical.filter(e => !newMedicalIds.includes(e.icd10CodeId));
      for (const e of toDeleteMedical) {
        await tx.patientMedicalHistory.update({ where: { id: e.id }, data: { active: false, updatedBy: meta.userId } });
      }

      // 2. Surgical History
      const existingSurgical = await tx.patientSurgicalHistory.findMany({ where: { patientId, active: true } });
      const newSurgicalIds = data.surgicalHistory?.map(s => s.surgicalProcedureId) || [];
      for (const s of (data.surgicalHistory || [])) {
        const existing = existingSurgical.find(e => e.surgicalProcedureId === s.surgicalProcedureId);
        if (existing) {
          await tx.patientSurgicalHistory.update({
            where: { id: existing.id },
            data: { observations: s.observations, updatedBy: meta.userId }
          });
        } else {
          await tx.patientSurgicalHistory.create({
            data: { patientId, surgicalProcedureId: s.surgicalProcedureId, observations: s.observations, active: true, createdBy: meta.userId, updatedBy: meta.userId }
          });
        }
      }
      const toDeleteSurgical = existingSurgical.filter(e => !newSurgicalIds.includes(e.surgicalProcedureId));
      for (const e of toDeleteSurgical) {
        await tx.patientSurgicalHistory.update({ where: { id: e.id }, data: { active: false, updatedBy: meta.userId } });
      }

      // 3. Trauma History
      const existingTrauma = await tx.patientTraumaHistory.findMany({ where: { patientId, active: true } });
      const newTraumaIds = data.traumaHistory?.map(t => t.icd10CodeId!) || [];
      for (const t of (data.traumaHistory || [])) {
        const existing = existingTrauma.find(e => e.icd10CodeId === t.icd10CodeId);
        if (existing) {
          await tx.patientTraumaHistory.update({
            where: { id: existing.id },
            data: { observations: t.observations, updatedBy: meta.userId }
          });
        } else {
          await tx.patientTraumaHistory.create({
            data: { patientId, icd10CodeId: t.icd10CodeId!, observations: t.observations, active: true, createdBy: meta.userId, updatedBy: meta.userId }
          });
        }
      }
      const toDeleteTrauma = existingTrauma.filter(e => !newTraumaIds.includes(e.icd10CodeId));
      for (const e of toDeleteTrauma) {
        await tx.patientTraumaHistory.update({ where: { id: e.id }, data: { active: false, updatedBy: meta.userId } });
      }

      // 4. Family History
      const existingFamily = await tx.patientFamilyHistory.findMany({ where: { patientId, active: true } });
      const newFamilyIds = data.familyHistory?.map(f => f.icd10CodeId!) || [];
      for (const f of (data.familyHistory || [])) {
        const existing = existingFamily.find(e => e.icd10CodeId === f.icd10CodeId);
        if (existing) {
          await tx.patientFamilyHistory.update({
            where: { id: existing.id },
            data: { observations: f.observations, updatedBy: meta.userId }
          });
        } else {
          await tx.patientFamilyHistory.create({
            data: { patientId, icd10CodeId: f.icd10CodeId!, observations: f.observations, active: true, createdBy: meta.userId, updatedBy: meta.userId }
          });
        }
      }
      const toDeleteFamily = existingFamily.filter(e => !newFamilyIds.includes(e.icd10CodeId));
      for (const e of toDeleteFamily) {
        await tx.patientFamilyHistory.update({ where: { id: e.id }, data: { active: false, updatedBy: meta.userId } });
      }

      // 5. Allergies
      const existingAllergies = await tx.patientAllergy.findMany({ where: { patientId, active: true } });
      const newAllergyIds = data.allergies?.map(a => a.allergenCatalogId) || [];
      for (const a of (data.allergies || [])) {
        const existing = existingAllergies.find(e => e.allergenCatalogId === a.allergenCatalogId);
        if (existing) {
          await tx.patientAllergy.update({
            where: { id: existing.id },
            data: { detail: a.detail, updatedBy: meta.userId }
          });
        } else {
          await tx.patientAllergy.create({
            data: { patientId, allergenCatalogId: a.allergenCatalogId, detail: a.detail, active: true, createdBy: meta.userId, updatedBy: meta.userId }
          });
        }
      }
      const toDeleteAllergies = existingAllergies.filter(e => !newAllergyIds.includes(e.allergenCatalogId));
      for (const e of toDeleteAllergies) {
        await tx.patientAllergy.update({ where: { id: e.id }, data: { active: false, updatedBy: meta.userId } });
      }

      // 6. Habits
      const existingHabits = await tx.patientHabit.findMany({ where: { patientId, active: true } });
      const newHabitIds = data.habits?.map(h => h.habitCatalogId) || [];
      for (const h of (data.habits || [])) {
        const existing = existingHabits.find(e => e.habitCatalogId === h.habitCatalogId);
        if (existing) {
          await tx.patientHabit.update({
            where: { id: existing.id },
            data: { duration: h.duration, quantity: h.quantity, frequency: h.frequency as any, observations: h.observations, updatedBy: meta.userId }
          });
        } else {
          await tx.patientHabit.create({
            data: { patientId, habitCatalogId: h.habitCatalogId, duration: h.duration, quantity: h.quantity, frequency: h.frequency as any, observations: h.observations, active: true, createdBy: meta.userId, updatedBy: meta.userId }
          });
        }
      }
      const toDeleteHabits = existingHabits.filter(e => !newHabitIds.includes(e.habitCatalogId));
      for (const e of toDeleteHabits) {
        await tx.patientHabit.update({ where: { id: e.id }, data: { active: false, updatedBy: meta.userId } });
      }

      // 7. Exercises
      const existingExercises = await tx.patientExercise.findMany({ where: { patientId, active: true } });
      const newExerciseIds = data.exercises?.map(e => e.exerciseCatalogId) || [];
      for (const e of (data.exercises || [])) {
        const existing = existingExercises.find(ex => ex.exerciseCatalogId === e.exerciseCatalogId);
        if (existing) {
          await tx.patientExercise.update({
            where: { id: existing.id },
            data: { timesPerWeek: e.timesPerWeek, updatedBy: meta.userId }
          });
        } else {
          await tx.patientExercise.create({
            data: { patientId, exerciseCatalogId: e.exerciseCatalogId, timesPerWeek: e.timesPerWeek, active: true, createdBy: meta.userId, updatedBy: meta.userId }
          });
        }
      }
      const toDeleteExercises = existingExercises.filter(ex => !newExerciseIds.includes(ex.exerciseCatalogId));
      for (const e of toDeleteExercises) {
        await tx.patientExercise.update({ where: { id: e.id }, data: { active: false, updatedBy: meta.userId } });
      }

      return true;
    });
  },
};
