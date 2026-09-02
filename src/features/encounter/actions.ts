"use server";

import { safeParseAction } from "@/shared/utils/zod-helpers";
import { createEncounterSchema, updateEncounterSchema } from "./schemas";
import { encounterService } from "./service";
import { withAuth } from "@/shared/auth/auth-guard";
import { handleActionError } from "@/shared/errors/app-error";
import { ActionResponse } from "@/shared/schemas/action-response";
import { updateTag } from "next/cache";

export async function createEncounter(data: unknown): Promise<ActionResponse<unknown>> {
  try {
    const session = await withAuth(["ADMIN", "DOCTOR"], async (s) => s);

    const parseResult = safeParseAction(createEncounterSchema, data);
    if (!parseResult.success) return parseResult;

    const created = await encounterService.create(parseResult.data, { id: session.user.id, email: session.user.email });
    
    // Invalidar caché: consultas, paciente específico y lista de pacientes
    // (el dashboard usa los mismos tags "encounters" y "patients")
    updateTag("encounters");
    updateTag(`patient-${parseResult.data.patientId}`);
    updateTag("patients");
    
    return { success: true, data: created };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateEncounter(data: unknown): Promise<ActionResponse<unknown>> {
  try {
    const session = await withAuth(["ADMIN", "DOCTOR"], async (s) => s);

    const parseResult = safeParseAction(updateEncounterSchema, data);
    if (!parseResult.success) return parseResult;

    const updated = await encounterService.update(parseResult.data, { id: session.user.id, email: session.user.email });
    
    updateTag("encounters");
    updateTag(`encounter-${parseResult.data.id}`);
    updateTag(`patient-${parseResult.data.patientId}`);
    updateTag("patients");
    
    return { success: true, data: updated };
  } catch (error) {
    return handleActionError(error);
  }
}
