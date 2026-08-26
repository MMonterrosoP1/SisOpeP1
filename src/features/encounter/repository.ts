import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { EncounterFilters, CreateEncounterInput, UpdateEncounterInput } from "./schemas";

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

  async update(id: number, data: UpdateEncounterInput & { updatedBy?: string }) {
    const {
      practitionerId,
      vitalSign,
      anthropometry,
      diagnoses,
      occupationalExposures,
      workDisabilities,
      updatedBy,
      ...encounterData
    } = data;

    // Quitar el patientId y id del encounterData para no intentar actualizarlos si Prisma se queja
    const { patientId, id: _id, ...safeEncounterData } = encounterData as any;

    return prisma.$transaction(async (tx) => {
      // 1. Update main encounter record
      await tx.encounter.update({
        where: { id },
        data: {
          ...safeEncounterData,
          updatedBy,
        }
      });

      // 2. Vital Sign
      if (vitalSign) {
        await tx.vitalSign.upsert({
          where: { encounterId: id },
          update: vitalSign,
          create: { ...vitalSign, encounterId: id }
        });
      } else {
        await tx.vitalSign.deleteMany({ where: { encounterId: id } });
      }

      // 3. Anthropometry
      if (anthropometry) {
        await tx.anthropometry.upsert({
          where: { encounterId: id },
          update: anthropometry,
          create: { ...anthropometry, encounterId: id }
        });
      } else {
        await tx.anthropometry.deleteMany({ where: { encounterId: id } });
      }

      // 4. Diagnoses (delete and recreate)
      await tx.diagnosis.deleteMany({ where: { encounterId: id } });
      if (diagnoses?.length) {
        await tx.diagnosis.createMany({
          data: diagnoses.map(d => ({
            encounterId: id,
            icd10CodeId: d.icd10CodeId as number, // We already filtered out nulls in schemas/actions
            diseaseTypeId: d.diseaseTypeId ?? undefined,
            observations: d.observations ?? undefined,
            isPrimary: d.isPrimary,
          }))
        });
      }

      // 5. Occupational Exposures (delete and recreate)
      await tx.occupationalExposureEntry.deleteMany({ where: { encounterId: id } });
      if (occupationalExposures?.length) {
        await tx.occupationalExposureEntry.createMany({
          data: occupationalExposures.map(e => ({
            encounterId: id,
            occupationalExposureId: e.occupationalExposureId,
            observations: e.observations ?? undefined,
          }))
        });
      }

      // 6. Work Disabilities (delete and recreate)
      await tx.workDisabilityEntry.deleteMany({ where: { encounterId: id } });
      if (workDisabilities?.length) {
        await tx.workDisabilityEntry.createMany({
          data: workDisabilities.map(w => ({
            encounterId: id,
            workDisabilityId: w.workDisabilityId,
            observations: w.observations ?? undefined,
          }))
        });
      }

      // 7. Return updated encounter with includes
      return tx.encounter.findUnique({
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
          occupationalExposureEntries: { include: { occupationalExposure: true } },
          workDisabilityEntries: { include: { workDisability: true } },
          documents: { include: { documentType: true } },
        },
      });
    });
  },
};
