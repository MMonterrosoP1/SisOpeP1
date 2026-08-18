"use server";

import { withAuth } from "@/shared/auth/auth-guard";
import { ActionResponse } from "@/shared/schemas/action-response";
import { patientHistoryService } from "./service";
import { upsertPatientHistorySchema } from "./schemas";
import { revalidateTag } from "next/cache";

export async function upsertPatientHistoryAction(data: unknown): Promise<ActionResponse<boolean>> {
  try {
    const session = await withAuth(["ADMIN", "DOCTOR"], async (s) => s);
    const parsedData = upsertPatientHistorySchema.parse(data);
    
    await patientHistoryService.upsert(parsedData.patientId, parsedData, { id: session.user.id, email: session.user.email });
    
    revalidateTag(`patient-history-${parsedData.patientId}`, "max");
    revalidateTag(`patient-${parsedData.patientId}`, "max");
    revalidateTag("patients", "max");
    revalidateTag("encounters", "max");
    
    return { success: true, data: true };
  } catch (error) {
    console.error("[UPSERT_PATIENT_HISTORY_ERROR]", error);
    return { success: false, error: "Ocurrió un error al guardar los antecedentes" };
  }
}
