import nodemailer from "nodemailer";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { templateRegistry } from "@/features/document/templates";

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

export const emailService = {
  async sendAppointmentEmail(
    to: string,
    encounterDetails: { date: Date; practitionerName: string; patientName: string },
    encounterDataForPdf?: any // Raw encounter data from DB
  ) {
    if (!to) return;

    let attachments: any[] = [];

    // Si pasamos los datos del encounter y tiene diagnósticos, generamos la constancia de enfermedad
    if (encounterDataForPdf && encounterDataForPdf.diagnoses && encounterDataForPdf.diagnoses.length > 0) {
      try {
        const template = templateRegistry["ILLNESS_CERTIFICATE"];
        if (template) {
          const certificateData = template.mapData(encounterDataForPdf);
          const pdfBuffer = await renderToBuffer(
            React.createElement(template.component, { data: certificateData }) as any
          );

          attachments.push({
            filename: `constancia-enfermedad-${encounterDetails.date.toISOString().split("T")[0]}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          });
        }
      } catch (error) {
        console.error("Error generating PDF for email attachment:", error);
      }
    }

    let diagnosisHtml = "";
    if (encounterDataForPdf?.diagnoses && encounterDataForPdf.diagnoses.length > 0) {
      const diagList = encounterDataForPdf.diagnoses.map((d: any) => {
        const code = d.icd10Code?.code ? `[${d.icd10Code.code}] ` : "";
        const name = d.icd10Code?.description || "Diagnóstico registrado";
        return `<li>${code}${name}</li>`;
      }).join("");
      diagnosisHtml = `
        <div style="margin-top: 20px;">
          <h3 style="color: #4b5563; font-size: 16px; margin-bottom: 8px;">Diagnósticos</h3>
          <ul style="margin-top: 0; padding-left: 20px; color: #374151; line-height: 1.5;">
            ${diagList}
          </ul>
        </div>
      `;
    }

    let symptomatologyHtml = "";
    if (encounterDataForPdf?.symptomatology) {
      symptomatologyHtml = `
        <div style="margin-top: 20px;">
          <h3 style="color: #4b5563; font-size: 16px; margin-bottom: 8px;">Motivo de Consulta</h3>
          <p style="margin-top: 0; color: #374151; line-height: 1.5;">${encounterDataForPdf.symptomatology}</p>
        </div>
      `;
    }

    let planHtml = "";
    const observations = [];
    if (encounterDataForPdf?.internalObservation) observations.push(`<strong>Observaciones:</strong> ${encounterDataForPdf.internalObservation}`);
    if (encounterDataForPdf?.employerObservation) observations.push(`<strong>Nota para patrono:</strong> ${encounterDataForPdf.employerObservation}`);

    if (observations.length > 0) {
      planHtml = `
        <div style="margin-top: 20px;">
          <h3 style="color: #4b5563; font-size: 16px; margin-bottom: 8px;">Plan y Observaciones Finales</h3>
          <ul style="margin-top: 0; padding-left: 20px; color: #374151; line-height: 1.5;">
            ${observations.map(o => `<li style="margin-bottom: 5px;">${o}</li>`).join("")}
          </ul>
        </div>
      `;
    }

    const htmlContent = `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
        <h2 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; margin-top: 0;">Resumen de tu Consulta Médica</h2>
        <p style="color: #374151; font-size: 16px;">Hola <strong>${encounterDetails.patientName}</strong>,</p>
        <p style="color: #374151; font-size: 16px;">Este es un resumen de tu visita en nuestra clínica.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 25px 0;">
          <p style="margin: 5px 0; color: #374151; font-size: 15px;"><strong>Fecha:</strong> ${encounterDetails.date.toLocaleDateString("es-GT", { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p style="margin: 5px 0; color: #374151; font-size: 15px;"><strong>Médico:</strong> ${encounterDetails.practitionerName}</p>
        </div>

        ${symptomatologyHtml}
        ${diagnosisHtml}
        ${planHtml}

        ${attachments.length > 0 ? `<p style="margin: 0; font-weight: 500;"> Adjunto a este correo encontrarás tu constancia de enfermedad.</p>` : ""}
        
        <div style="margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            Saludos cordiales,<br>
            <strong style="color: #4b5563;">Clínica Médica</strong>
          </p>
        </div>
      </div>
    `;

    try {
      const info = await transporter.sendMail({
        from: `"Clínica Médica" <${process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@clinica.com"}>`,
        to,
        subject: "Confirmación de Cita Médica",
        html: htmlContent,
        attachments,
      });
      console.log("Message sent: %s", info.messageId);
      return info;
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  },
};
