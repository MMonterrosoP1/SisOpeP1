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
      const searchTerms = filters.search.trim().split(/\s+/);
      where.patient = {
        person: {
          AND: searchTerms.map(term => ({
            OR: [
              { identityDocument: { contains: term } },
              { givenNames: { contains: term } },
              { familyNames: { contains: term } },
            ]
          }))
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
          practitioner: { select: { givenNames: true, familyNames: true, user: { select: { email: true, name: true } } } },
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
        practitioner: { select: { id: true, givenNames: true, familyNames: true, user: { select: { email: true, name: true } } } },
        encounterType: true,
        referralLevel: true,
        medicalAptitude: true,
        vitalSign: true,
        anthropometry: true,
        diagnoses: { include: { icd10Code: true, diseaseType: true } },
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
        practitioner: { select: { id: true, givenNames: true, familyNames: true, user: { select: { email: true, name: true } } } },
        encounterType: true,
        referralLevel: true,
        medicalAptitude: true,
        vitalSign: true,
        anthropometry: true,
        diagnoses: { include: { icd10Code: true, diseaseType: true } },
        occupationalExposureEntries: { include: { occupationalExposure: true } },
        workDisabilityEntries: { include: { workDisability: true } },
        documents: { include: { documentType: true } },
      },
    });
  },

  async create(data: CreateEncounterInput & { createdBy?: string; updatedBy?: string }) {
    const {
      practitionerId,
      vitalSign,
      anthropometry,
      diagnoses,
      occupationalExposures,
      workDisabilities,
      createdBy,
      updatedBy,
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
        createdBy,
        updatedBy,
        vitalSign: vitalSign ? { create: vitalSign } : undefined,
        anthropometry: anthropometry ? { create: anthropometry } : undefined,
        diagnoses: diagnosisCreates ? { create: diagnosisCreates } : undefined,
        occupationalExposureEntries: occupationalExposureCreates ? { create: occupationalExposureCreates } : undefined,
        workDisabilityEntries: workDisabilityCreates ? { create: workDisabilityCreates } : undefined,
      },
      include: {
        diagnoses: true,
      },
    });
  },
};
