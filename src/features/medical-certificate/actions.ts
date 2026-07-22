"use server";

import { safeParseAction } from "@/shared/utils/zod-helpers";
import { generateCertificateSchema } from "./schemas";
import { medicalCertificateService } from "./service";
import { withAuth } from "@/shared/auth/auth-guard";
import { handleActionError } from "@/shared/errors/app-error";
import { ActionResponse } from "@/shared/schemas/action-response";

export async function generateMedicalCertificate(data: unknown): Promise<ActionResponse<any>> {
  try {
    const session = await withAuth(["ADMIN", "DOCTOR"], async (s) => s);

    const parseResult = safeParseAction(generateCertificateSchema, data);
    if (!parseResult.success) return parseResult;

    const certificate = await medicalCertificateService.generateCertificate(
      parseResult.data.encounterId,
      session.user.id
    );

    return { success: true, data: certificate };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function generateCertificatePdf(certificateId: number): Promise<ActionResponse<{ pdfUrl: string }>> {
  try {
    await withAuth(["ADMIN", "DOCTOR"], async (s) => s);
    const result = await medicalCertificateService.generatePdf(certificateId);
    return { success: true, data: result };
  } catch (error) {
    return handleActionError(error);
  }
}
