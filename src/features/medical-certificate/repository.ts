import { prisma } from "@/lib/prisma";

export const medicalCertificateRepository = {
  async findByEncounter(encounterId: number) {
    return prisma.medicalCertificate.findUnique({
      where: { encounterId },
    });
  },

  async create(encounterId: number, patientId: number, practitionerId: string) {
    return prisma.medicalCertificate.create({
      data: {
        encounterId,
        patientId,
        issuedByUserId: practitionerId,
        issuedAt: new Date(),
      },
    });
  },

  async updatePdfUrl(id: number, pdfUrl: string) {
    return prisma.medicalCertificate.update({
      where: { id },
      data: { pdfUrl },
    });
  },
};
