import { prisma } from "@/lib/prisma";

export const documentRepository = {
  async getDocumentTypeIdByCode(code: string) {
    const docType = await prisma.documentTypeCatalog.findUnique({
      where: { code },
    });
    return docType?.id;
  },

  async findByEncounterAndType(encounterId: number, documentTypeCode: string) {
    const typeId = await this.getDocumentTypeIdByCode(documentTypeCode);
    if (!typeId) return null;
    return prisma.document.findUnique({
      where: { 
        encounterId_documentTypeId: {
          encounterId,
          documentTypeId: typeId
        }
      },
    });
  },

  async findByEncounterWithRelations(encounterId: number) {
    return prisma.encounter.findUnique({
      where: { id: encounterId },
      include: {
        patient: {
          include: {
            person: true,
            workplace: true,
            jobPosition: true,
          }
        },
        practitioner: { include: { person: true } },
        medicalAptitude: true,
        suspensionHour: true,
        diagnoses: {
          include: {
            icd10Code: true
          }
        },
        documents: {
          include: {
            documentType: true
          }
        },
      }
    });
  },

  async findByEncounterIdsAndType(encounterIds: number[], documentTypeCode: string) {
    const typeId = await this.getDocumentTypeIdByCode(documentTypeCode);
    if (!typeId) return [];

    return prisma.document.findMany({
      where: {
        encounterId: {
          in: encounterIds
        },
        documentTypeId: typeId,
      },
      select: {
        encounterId: true,
        id: true,
        pdfUrl: true,
      }
    });
  },

  async create(encounterId: number, patientId: number, practitionerId: string, documentTypeCode: string) {
    const typeId = await this.getDocumentTypeIdByCode(documentTypeCode);
    if (!typeId) throw new Error(`Document type ${documentTypeCode} not found`);

    return prisma.document.create({
      data: {
        encounterId,
        patientId,
        documentTypeId: typeId,
        issuedByUserId: practitionerId,
        issuedAt: new Date(),
      },
    });
  },

  async updatePdfUrl(id: number, pdfUrl: string) {
    return prisma.document.update({
      where: { id },
      data: { pdfUrl },
    });
  },

  async findAll(
    filters: { search?: string; type?: string; },
    pagination: { skip: number; take: number }
  ) {
    const whereClause: any = {};

    if (filters.type) {
      whereClause.documentType = { code: filters.type };
    }

    if (filters.search) {
      whereClause.patient = {
        person: {
          OR: [
            { identityDocument: { contains: filters.search } },
            { givenNames: { contains: filters.search } },
            { familyNames: { contains: filters.search } },
          ],
        },
      };
    }

    const [items, totalCount] = await Promise.all([
      prisma.document.findMany({
        where: whereClause,
        include: {
          patient: {
            include: {
              person: true,
            },
          },
          documentType: true,
          encounter: true,
          issuedBy: true,
        },
        orderBy: { issuedAt: "desc" },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.document.count({ where: whereClause }),
    ]);

    return { items, totalCount };
  },
};
