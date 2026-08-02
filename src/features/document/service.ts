import { documentRepository } from "./repository";
import { auditService } from "@/shared/audit/audit.service";
import { ConflictError, NotFoundError, ValidationError } from "@/shared/errors/app-error";
import { put } from "@vercel/blob";
import { renderToBuffer } from "@react-pdf/renderer";
import { templateRegistry } from "./templates";
import React from "react";
import { DocumentTemplateType } from "./types";

export const documentService = {
  async generateDocument(encounterId: number, userId: string, documentTypeCode: DocumentTemplateType) {
    // 1. Obtener la consulta con todas sus relaciones
    const encounter = await documentRepository.findByEncounterWithRelations(encounterId);
    if (!encounter) {
      throw new NotFoundError("Consulta no encontrada", "encounter", encounterId);
    }
    
    // Validación específica según el tipo
    if (documentTypeCode === "MEDICAL_CERTIFICATE" && !encounter.medicalAptitudeId) {
      throw new ValidationError("La consulta debe tener una aptitud médica definida para generar una constancia médica");
    }
    
    if (documentTypeCode === "ILLNESS_CERTIFICATE" && (!encounter.diagnoses || encounter.diagnoses.length === 0)) {
      throw new ValidationError("La consulta debe tener al menos un diagnóstico para generar una constancia de enfermedad");
    }

    // 2. Verificar que no exista ya un documento de este tipo
    const existingDoc = encounter.documents.find(d => d.documentType.code === documentTypeCode);
    if (existingDoc) {
      if (existingDoc.pdfUrl) {
        return existingDoc; // Ya existe y tiene PDF
      }
    } else {
      // Crear el registro de documento si no existe
      await documentRepository.create(
        encounterId, 
        encounter.patientId, 
        userId,
        documentTypeCode
      );
    }

    // Obtener el registro actual
    const documentRecord = await documentRepository.findByEncounterAndType(encounterId, documentTypeCode);
    if (!documentRecord) throw new Error(`No se pudo crear o recuperar el documento ${documentTypeCode}`);

    // 3. Preparar los datos y renderizar el PDF
    const template = templateRegistry[documentTypeCode];
    if (!template) throw new Error(`Template no encontrado para ${documentTypeCode}`);

    const certificateData = template.mapData(encounter);
    
    // Convertir el componente React a Buffer
    const pdfBuffer = await renderToBuffer(
      React.createElement(template.component, { data: certificateData }) as any
    );

    // 4. Subir el archivo a Vercel Blob
    const filename = `documentos/${encounter.patient.person.identityDocument}/${documentTypeCode}-${encounterId}-${Date.now()}.pdf`;
    const blob = await put(filename, pdfBuffer, {
      access: 'private',
      contentType: 'application/pdf',
    });

    // 5. Actualizar la base de datos con la URL
    const updatedDocument = await documentRepository.updatePdfUrl(
      documentRecord.id, 
      blob.url
    );

    // 6. Registro de auditoría
    await auditService.log({
      userId,
      action: "EXPORT",
      entityType: "document",
      entityId: documentRecord.id,
      newData: updatedDocument,
    });

    return updatedDocument;
  },
};
