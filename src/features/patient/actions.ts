"use server";

import { safeParseAction } from "@/shared/utils/zod-helpers";
import { createPatientSchema, updatePatientSchema } from "./schemas";
import { patientService } from "./service";
import { withAuth } from "@/shared/auth/auth-guard";
import { handleActionError } from "@/shared/errors/app-error";
import { ActionResponse } from "@/shared/schemas/action-response";

export async function createPatient(data: unknown): Promise<ActionResponse<any>> {
  try {
    const session = await withAuth(["ADMIN", "DOCTOR"], async (s) => s);

    const parseResult = safeParseAction(createPatientSchema, data);
    if (!parseResult.success) return parseResult;

    const created = await patientService.create(parseResult.data, session.user.id);
    return { success: true, data: created };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updatePatient(id: number, data: unknown): Promise<ActionResponse<any>> {
  try {
    const session = await withAuth(["ADMIN", "DOCTOR"], async (s) => s);

    const parseResult = safeParseAction(updatePatientSchema, data);
    if (!parseResult.success) return parseResult;

    const updated = await patientService.update(id, parseResult.data, session.user.id);
    return { success: true, data: updated };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function togglePatientActive(id: number): Promise<ActionResponse<any>> {
  try {
    const session = await withAuth(["ADMIN", "DOCTOR"], async (s) => s);

    const updated = await patientService.toggleActive(id, session.user.id);
    return { success: true, data: updated };
  } catch (error) {
    return handleActionError(error);
  }
}
