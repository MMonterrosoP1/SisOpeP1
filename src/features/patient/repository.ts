import { prisma } from "@/lib/prisma";
import { PatientFilters, PatientListItem, PatientWithRelations } from "./types";
import { Prisma } from "@/generated/prisma/client";

export const patientRepository = {
  async findAll(filters: PatientFilters, pagination: { skip: number; take: number }) {
    const where: Prisma.PatientWhereInput = {};
    
    if (filters.active !== undefined) {
      where.active = filters.active;
    }
    
    if (filters.companyId) where.companyId = filters.companyId;
    if (filters.workplaceId) where.workplaceId = filters.workplaceId;
    
    if (filters.search) {
      where.OR = [
        { givenNames: { contains: filters.search } },
        { familyNames: { contains: filters.search } },
        { identityDocument: { contains: filters.search } },
      ];
    }

    const [data, totalCount] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: [{ familyNames: "asc" }, { givenNames: "asc" }],
        include: {
          company: { select: { name: true } },
          workplace: { select: { name: true } },
        },
      }),
      prisma.patient.count({ where }),
    ]);

    const items: PatientListItem[] = data.map((p) => ({
      id: p.id,
      givenNames: p.givenNames,
      familyNames: p.familyNames,
      identityDocument: p.identityDocument,
      documentType: p.documentType,
      birthDate: p.birthDate,
      sex: p.sex,
      active: p.active,
      companyName: p.company?.name,
      workplaceName: p.workplace?.name,
    }));

    return { items, totalCount };
  },

  async findById(id: number): Promise<PatientWithRelations | null> {
    return prisma.patient.findUnique({
      where: { id },
      include: {
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
      where: { identityDocument },
    });
  },

  async create(data: any) {
    const { emergencyContacts, ...patientData } = data;
    
    return prisma.patient.create({
      data: {
        ...patientData,
        emergencyContacts: emergencyContacts?.length > 0 ? {
          create: emergencyContacts,
        } : undefined,
      },
      include: {
        company: true,
        emergencyContacts: true,
      },
    });
  },

  async update(id: number, data: any) {
    const { emergencyContacts, ...patientData } = data;
    
    return prisma.$transaction(async (tx) => {
      // Very basic emergency contacts sync: delete all and recreate
      if (emergencyContacts) {
        await tx.emergencyContact.deleteMany({
          where: { patientId: id },
        });
      }

      return tx.patient.update({
        where: { id },
        data: {
          ...patientData,
          emergencyContacts: emergencyContacts ? {
            create: emergencyContacts.map((c: any) => ({
              fullName: c.fullName,
              phone: c.phone,
              relationshipTypeId: c.relationshipTypeId,
              isPrimary: c.isPrimary,
            })),
          } : undefined,
        },
        include: {
          company: true,
          emergencyContacts: true,
        },
      });
    });
  },

  async toggleActive(id: number) {
    const patient = await prisma.patient.findUnique({ where: { id } });
    if (!patient) return null;
    
    return prisma.patient.update({
      where: { id },
      data: { active: !patient.active },
    });
  },
};
