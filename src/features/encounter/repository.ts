import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { EncounterFilters, CreateEncounterInput } from "./schemas";

export const encounterRepository = {
  async findAll(filters: EncounterFilters, pagination: { skip: number; take: number }) {
    const where: Prisma.EncounterWhereInput = {};
    if (filters.patientId) where.patientId = filters.patientId;
    if (filters.practitionerId) where.practitionerId = filters.practitionerId;
    if (filters.encounterTypeId) where.encounterTypeId = filters.encounterTypeId;
    if (filters.search) {
      where.patient = {
        person: {
          OR: [
            { identityDocument: { contains: filters.search } },
            { givenNames: { contains: filters.search } },
            { familyNames: { contains: filters.search } },
          ],
        },
      };
    }

    const [data, totalCount] = await Promise.all([
      prisma.encounter.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: "desc" },
        include: {
          patient: { select: { id: true, person: { select: { givenNames: true, familyNames: true, identityDocument: true } } } },
          practitioner: { select: { name: true, email: true } },
          encounterType: { select: { name: true } },
          diagnoses: {
            where: { isPrimary: true },
            include: { icd10Code: true },
          },
          documents: { include: { documentType: true } },
          medicalAptitude: { select: { name: true } },
        },
      }),
      prisma.encounter.count({ where }),
    ]);

    return { items: data, totalCount };
  },

  async findById(id: number) {
    return prisma.encounter.findUnique({
      where: { id },
      include: {
        patient: { include: { person: true } },
        practitioner: { select: { id: true, name: true, email: true } },
        encounterType: true,
        referralLevel: true,
        medicalAptitude: true,
        vitalSign: true,
        anthropometry: true,
        diagnoses: { include: { icd10Code: true, diseaseType: true } },
        allergies: { include: { allergenCatalog: true } },
        habits: { include: { habitCatalog: true } },  
        exercises: { include: { exerciseCatalog: true } },
        medicalHistoryEntries: { include: { icd10Code: true } },
        surgicalHistoryEntries: { include: { surgicalProcedure: true } },
        traumaHistoryEntries: { include: { icd10Code: true } },
        familyHistoryEntries: { include: { icd10Code: true } },
        occupationalExposureEntries: { include: { occupationalExposure: true } },
        workDisabilityEntries: { include: { workDisability: true } },
        documents: { include: { documentType: true } },
      },
    });
  },

  async findLatestByPatient(patientId: number) {
    return prisma.encounter.findFirst({
      where: { patientId },
      orderBy: { createdAt: "desc" },
      include: {
        patient: { include: { person: true } },
        practitioner: { select: { id: true, name: true, email: true } },
        encounterType: true,
        referralLevel: true,
        medicalAptitude: true,
        vitalSign: true,
        anthropometry: true,
        diagnoses: { include: { icd10Code: true, diseaseType: true } },
        allergies: { include: { allergenCatalog: true } },
        habits: { include: { habitCatalog: true } },  
        exercises: { include: { exerciseCatalog: true } },
        medicalHistoryEntries: { include: { icd10Code: true } },
        surgicalHistoryEntries: { include: { surgicalProcedure: true } },
        traumaHistoryEntries: { include: { icd10Code: true } },
        familyHistoryEntries: { include: { icd10Code: true } },
        occupationalExposureEntries: { include: { occupationalExposure: true } },
        workDisabilityEntries: { include: { workDisability: true } },
        documents: { include: { documentType: true } },
      },
    });
  },

  async create(data: CreateEncounterInput & { createdById?: string; updatedById?: string }) {
    const {
      practitionerId,
      vitalSign,
      anthropometry,
      diagnoses,
      allergies,
      habits,
      exercises,
      medicalHistory,
      surgicalHistory,
      traumaHistory,
      familyHistory,
      occupationalExposures,
      workDisabilities,
      createdById,
      updatedById,
      ...encounterData
    } = data;

    if (!practitionerId) {
      throw new Error("Missing practitionerId in encounter create payload");
    }

    const diagnosisCreates: Prisma.DiagnosisUncheckedCreateWithoutEncounterInput[] | undefined = diagnoses?.length
      ? diagnoses.map((diagnosis) => ({
          icd10CodeId: diagnosis.icd10CodeId,
          diseaseTypeId: diagnosis.diseaseTypeId ?? undefined,
          observations: diagnosis.observations ?? undefined,
          isPrimary: diagnosis.isPrimary,
        }))
      : undefined;

    const allergyCreates: Prisma.AllergyUncheckedCreateWithoutEncounterInput[] | undefined = allergies?.length
      ? allergies.map((allergy) => ({
          allergenCatalogId: allergy.allergenCatalogId,
          detail: allergy.detail ?? "",
        }))
      : undefined;

    const habitCreates: Prisma.HabitUncheckedCreateWithoutEncounterInput[] | undefined = habits?.length
      ? habits.map((habit) => ({
          habitCatalogId: habit.habitCatalogId,
          duration: habit.duration ?? undefined,
          quantity: habit.quantity ?? undefined,
          frequency: (habit.frequency as any) ?? undefined,
          observations: habit.observations ?? undefined,
        }))
      : undefined;

    const exerciseCreates: Prisma.ExerciseUncheckedCreateWithoutEncounterInput[] | undefined = exercises?.length
      ? exercises.map((exercise) => ({
          doesExercise: exercise.doesExercise,
          exerciseCatalogId: exercise.exerciseCatalogId ?? undefined,
          timesPerWeek: exercise.timesPerWeek ?? undefined,
        }))
      : undefined;

    const medicalHistoryCreates: Prisma.MedicalHistoryEntryUncheckedCreateWithoutEncounterInput[] | undefined = medicalHistory?.length
      ? medicalHistory
          .filter((entry) => entry.icd10CodeId !== null && entry.icd10CodeId !== undefined)
          .map((entry) => ({
            icd10CodeId: entry.icd10CodeId as number,
            observations: entry.observations ?? undefined,
          }))
      : undefined;

    const surgicalHistoryCreates: Prisma.SurgicalHistoryEntryUncheckedCreateWithoutEncounterInput[] | undefined = surgicalHistory?.length
      ? surgicalHistory.map((entry) => ({
          surgicalProcedureId: entry.surgicalProcedureId,
          observations: entry.observations ?? undefined,
        }))
      : undefined;

    const traumaHistoryCreates: Prisma.TraumaHistoryEntryUncheckedCreateWithoutEncounterInput[] | undefined = traumaHistory?.length
      ? traumaHistory
          .filter((entry) => entry.icd10CodeId !== null && entry.icd10CodeId !== undefined)
          .map((entry) => ({
            icd10CodeId: entry.icd10CodeId as number,
            observations: entry.observations ?? undefined,
          }))
      : undefined;

    const familyHistoryCreates: Prisma.FamilyHistoryEntryUncheckedCreateWithoutEncounterInput[] | undefined = familyHistory?.length
      ? familyHistory
          .filter((entry) => entry.icd10CodeId !== null && entry.icd10CodeId !== undefined)
          .map((entry) => ({
            icd10CodeId: entry.icd10CodeId as number,
            observations: entry.observations ?? undefined,
          }))
      : undefined;

    const occupationalExposureCreates: Prisma.OccupationalExposureEntryUncheckedCreateWithoutEncounterInput[] | undefined = occupationalExposures?.length
      ? occupationalExposures.map((entry) => ({
          occupationalExposureId: entry.occupationalExposureId,
          observations: entry.observations ?? undefined,
        }))
      : undefined;

    const workDisabilityCreates: Prisma.WorkDisabilityEntryUncheckedCreateWithoutEncounterInput[] | undefined = workDisabilities?.length
      ? workDisabilities.map((entry) => ({
          workDisabilityId: entry.workDisabilityId,
          observations: entry.observations ?? undefined,
        }))
      : undefined;

    return prisma.encounter.create({
      data: {
        ...encounterData,
        practitionerId,
        createdById,
        updatedById,
        vitalSign: vitalSign ? { create: vitalSign } : undefined,
        anthropometry: anthropometry ? { create: anthropometry } : undefined,
        diagnoses: diagnosisCreates ? { create: diagnosisCreates } : undefined,
        allergies: allergyCreates ? { create: allergyCreates } : undefined,
        habits: habitCreates ? { create: habitCreates } : undefined,
        exercises: exerciseCreates ? { create: exerciseCreates } : undefined,
        medicalHistoryEntries: medicalHistoryCreates ? { create: medicalHistoryCreates } : undefined,
        surgicalHistoryEntries: surgicalHistoryCreates ? { create: surgicalHistoryCreates } : undefined,
        traumaHistoryEntries: traumaHistoryCreates ? { create: traumaHistoryCreates } : undefined,
        familyHistoryEntries: familyHistoryCreates ? { create: familyHistoryCreates } : undefined,
        occupationalExposureEntries: occupationalExposureCreates ? { create: occupationalExposureCreates } : undefined,
        workDisabilityEntries: workDisabilityCreates ? { create: workDisabilityCreates } : undefined,
      },
      include: {
        diagnoses: true,
      },
    });
  },
};
