import { medicalCertificateRepository } from "./repository";
import { encounterRepository } from "../encounter/repository";
import { auditService } from "@/shared/audit/audit.service";
import { ConflictError, NotFoundError } from "@/shared/errors/app-error";

export const medicalCertificateService = {
  async generateCertificate(encounterId: number, userId: string) {
    const encounter = await encounterRepository.findById(encounterId);
    if (!encounter) {
      throw new NotFoundError("Consulta no encontrada", "encounter", encounterId);
    }

    const existingCert = await medicalCertificateRepository.findByEncounter(encounterId);
    if (existingCert) {
      throw new ConflictError("Ya existe un certificado médico para esta consulta");
    }

    const certificate = await medicalCertificateRepository.create(
      encounterId, 
      encounter.patientId, 
      userId
    );

    await auditService.log({
      userId,
      action: "EXPORT",
      entityType: "medicalCertificate",
      entityId: certificate.id,
      newData: certificate,
    });

    return certificate;
  },

  async generatePdf(certificateId: number) {
    // Implement jsPDF generation logic here in the future
    // For now, return a placeholder and update the DB
    const placeholderUrl = `/api/certificates/${certificateId}.pdf`;
    
    await medicalCertificateRepository.updatePdfUrl(certificateId, placeholderUrl);
    
    return { pdfUrl: placeholderUrl };
  },
};
