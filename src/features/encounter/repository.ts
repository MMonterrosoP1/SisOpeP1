import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export const encounterRepository = {
  async findAll(filters: any, pagination: { skip: number; take: number }) {
    const where: Prisma.EncounterWhereInput = {};
    if (filters.patientId) where.patientId = filters.patientId;
    if (filters.practitionerId) where.practitionerId = filters.practitionerId;
    if (filters.encounterTypeId) where.encounterTypeId = filters.encounterTypeId;

    const [data, totalCount] = await Promise.all([
      prisma.encounter.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: "desc" },
        include: {
          patient: { select: { givenNames: true, familyNames: true, identityDocument: true } },
          practitioner: { select: { name: true, email: true } },
          encounterType: { select: { name: true } },
          diagnoses: {
            where: { isPrimary: true },
            include: { icd10Code: true },
          },
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
        patient: true,
        practitioner: { select: { id: true, name: true, email: true } },
        encounterType: true,
        referralLevel: true,
        medicalAptitude: true,
        vitalSign: true,
        anthropometry: true,
        diagnoses: { include: { icd10Code: true, diseaseType: true } },
        allergies: { include: { allergenCatalog: true } },
        habits: { include: { habitCatalog: true } },  
        exercises: true,
        medicalHistoryEntries: { include: { icd10Code: true } },
        surgicalHistoryEntries: { include: { surgicalProcedure: true } },
        traumaHistoryEntries: { include: { icd10Code: true } },
        familyHistoryEntries: { include: { icd10Code: true } },
        occupationalExposureEntries: { include: { occupationalExposure: true } },
        workDisabilityEntries: { include: { workDisability: true } },
      },
    });
  },

  async create(data: any) {
    const {
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
      ...encounterData
    } = data;

    return prisma.encounter.create({
      data: {
        ...encounterData,
        vitalSign: vitalSign ? { create: vitalSign } : undefined,
        anthropometry: anthropometry ? { create: anthropometry } : undefined,
        diagnoses: diagnoses?.length ? { create: diagnoses } : undefined,
        allergies: allergies?.length ? { create: allergies } : undefined,
        habits: habits?.length ? { create: habits } : undefined,
        exercises: exercises?.length ? { create: exercises } : undefined,
        medicalHistoryEntries: medicalHistory?.length ? { create: medicalHistory } : undefined,
        surgicalHistoryEntries: surgicalHistory?.length ? { create: surgicalHistory } : undefined,
        traumaHistoryEntries: traumaHistory?.length ? { create: traumaHistory } : undefined,
        familyHistoryEntries: familyHistory?.length ? { create: familyHistory } : undefined,
        occupationalExposureEntries: occupationalExposures?.length ? { create: occupationalExposures } : undefined,
        workDisabilityEntries: workDisabilities?.length ? { create: workDisabilities } : undefined,
      },
      include: {
        diagnoses: true,
      },
    });
  },
};
