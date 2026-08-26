"use server";

import { revalidateTag, revalidatePath } from "next/cache";

import { safeParseAction } from "@/shared/utils/zod-helpers";
import { generateDocumentSchema } from "./schemas";
import { documentService } from "./service";
import { withAuth } from "@/shared/auth/auth-guard";
import { handleActionError } from "@/shared/errors/app-error";
import { ActionResponse } from "@/shared/schemas/action-response";

export async function generateDocumentAction(data: unknown): Promise<ActionResponse<any>> {
  try {
    const session = await withAuth(["ADMIN", "DOCTOR"], async (s) => s);

    const parseResult = safeParseAction(generateDocumentSchema, data);
    if (!parseResult.success) return parseResult;

    const documentRecord = await documentService.generateDocument(
      parseResult.data.encounterId,
      session.user.id,
      parseResult.data.documentTypeCode
    );

    // Invalidar caché de documentos, la consulta específica y el perfil del paciente
    revalidateTag("documents", "max");
    revalidateTag(`encounter-${parseResult.data.encounterId}`, "max");
    revalidateTag(`patient-${documentRecord.patientId}`, "max");
    revalidateTag("encounters", "max");
    revalidatePath("/certificates");

    return { success: true, data: documentRecord };
  } catch (error) {
    return handleActionError(error);
  }
}
