import { prisma } from "@/lib/prisma";
import { PatientCreateInput, PatientFilters, PatientListItem, PatientUpdateInput, PatientWithRelations } from "./types";
import { Prisma } from "@/generated/prisma/client";
import { ConflictError } from "@/shared/errors/app-error";

export const patientRepository = {
  async findAll(filters: PatientFilters, pagination: { skip: number; take: number }) {
    const where: Prisma.PatientWhereInput = {};
    
    if (filters.active !== undefined) {
      where.active = filters.active;
    }
    
    if (filters.companyId) where.companyId = filters.companyId;
    if (filters.workplaceId) where.workplaceId = filters.workplaceId;
    if (filters.workAreaId) where.workAreaId = filters.workAreaId;
    if (filters.jobPositionId) where.jobPositionId = filters.jobPositionId;
    
    if (filters.search) {
      where.OR = [
        { person: { givenNames: { contains: filters.search } } },
        { person: { familyNames: { contains: filters.search } } },
        { person: { identityDocument: { contains: filters.search } } },
      ];
    }

    const [data, totalCount] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: [{ person: { familyNames: "asc" } }, { person: { givenNames: "asc" } }],
        include: {
          person: true,
          company: { select: { name: true, acronym: true } },
          workplace: { select: { name: true } },
          workArea: { select: { name: true } },
          jobPosition: { select: { name: true } },
        },
      }),
      prisma.patient.count({ where }),
    ]);

    const items: PatientListItem[] = data.map((p) => ({
      id: p.id,
      givenNames: p.person.givenNames,
      familyNames: p.person.familyNames,
      identityDocument: p.person.identityDocument,
      documentType: p.person.documentType,
      birthDate: p.person.birthDate,
      sex: p.person.sex,
      active: p.active,
      phone: p.person.phone,
      companyName: p.company?.name,
      companyAcronym: p.company?.acronym,
      workplaceName: p.workplace?.name,
      workAreaName: p.workArea?.name,
      jobPositionName: p.jobPosition?.name,
    }));

    return { items, totalCount };
  },

  async findById(id: number): Promise<PatientWithRelations | null> {
    return prisma.patient.findUnique({
      where: { id },
      include: {
        person: true,
        company: true,
        workplace: true,
        workArea: true,
        jobPosition: true,
        maritalStatus: true,
        bloodType: true,
        emergencyContacts: {
          include: {
            relationshipType: true,
          },
        },
      },
    });
  },

  async findByDocument(identityDocument: string) {
    return prisma.patient.findFirst({
      where: { person: { identityDocument } },
      include: { person: true }
    });
  },

  async create(data: PatientCreateInput) {
    const { emergencyContacts, givenNames, familyNames, documentType, identityDocument, birthDate, sex, phone, ...patientData } = data;

    try {
      return await prisma.$transaction(async (tx) => {
        // Find or create person
        let person = await tx.person.findUnique({
          where: { identityDocument }
        });

        if (!person) {
          person = await tx.person.create({
            data: { givenNames, familyNames, documentType, identityDocument, birthDate, sex, phone }
          });
        } else {
          person = await tx.person.update({
            where: { id: person.id },
            data: { givenNames, familyNames, documentType, birthDate, sex, phone }
          });
        }

        return tx.patient.create({
          data: {
            ...patientData,
            personId: person.id,
            emergencyContacts: Array.isArray(emergencyContacts) && emergencyContacts.length > 0 ? {
              create: emergencyContacts,
            } : undefined,
          },
          include: {
            person: true,
            company: true,
            emergencyContacts: true,
          },
        });
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError
        && error.code === "P2002"
      ) {
        throw new ConflictError(`El paciente con documento ${data.identityDocument} ya existe`, {
          identityDocument: ["Ya existe un paciente registrado con este documento"],
        });
      }
      throw error;
    }
  },

  async update(id: number, data: PatientUpdateInput) {
    const { emergencyContacts, givenNames, familyNames, documentType, identityDocument, birthDate, sex, phone, ...patientData } = data;
    
    return prisma.$transaction(async (tx) => {
      // Very basic emergency contacts sync: delete all and recreate
      if (emergencyContacts) {
        await tx.emergencyContact.deleteMany({
          where: { patientId: id },
        });
      }

      const patient = await tx.patient.findUnique({ where: { id } });
      if (!patient) throw new Error("Patient not found");

      // Update person
      const personDataToUpdate: any = {};
      if (givenNames !== undefined) personDataToUpdate.givenNames = givenNames;
      if (familyNames !== undefined) personDataToUpdate.familyNames = familyNames;
      if (documentType !== undefined) personDataToUpdate.documentType = documentType;
      if (identityDocument !== undefined) personDataToUpdate.identityDocument = identityDocument;
      if (birthDate !== undefined) personDataToUpdate.birthDate = birthDate;
      if (sex !== undefined) personDataToUpdate.sex = sex;
      if (phone !== undefined) personDataToUpdate.phone = phone;

      if (Object.keys(personDataToUpdate).length > 0) {
        await tx.person.update({
          where: { id: patient.personId },
          data: personDataToUpdate
        });
      }

      return tx.patient.update({
        where: { id },
        data: {
          ...patientData,
          emergencyContacts: emergencyContacts ? {
            create: emergencyContacts.map((c) => ({
              fullName: c.fullName,
              phone: c.phone,
              relationshipTypeId: c.relationshipTypeId,
              isPrimary: c.isPrimary,
            })),
          } : undefined,
        },
        include: {
          person: true,
          company: true,
          emergencyContacts: true,
        },
      });
    });
  },

  async toggleActive(id: number) {
    const patient = await prisma.patient.findUnique({
      where: { id },
      select: { active: true },
    });
    if (!patient) return null;
    
    return prisma.patient.update({
      where: { id },
      data: { active: !patient.active },
    });
  },
};
