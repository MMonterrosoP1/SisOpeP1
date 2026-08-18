"use server";

import { safeParseAction } from "@/shared/utils/zod-helpers";
import { createPatientSchema, updatePatientSchema } from "./schemas";
import { patientService } from "./service";
import { withAuth } from "@/shared/auth/auth-guard";
import { handleActionError } from "@/shared/errors/app-error";
import { ActionResponse } from "@/shared/schemas/action-response";
import { revalidateTag } from "next/cache";

export async function createPatient(data: unknown): Promise<ActionResponse<unknown>> {
  try {
    const session = await withAuth(["ADMIN", "DOCTOR"], async (s) => s);

    const parseResult = safeParseAction(createPatientSchema, data);
    if (!parseResult.success) return parseResult;

    const created = await patientService.create(parseResult.data, { id: session.user.id, email: session.user.email });
    revalidateTag("patients", "max");
    revalidateTag("patients-search", "max");
    return { success: true, data: created };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updatePatient(id: number, data: unknown): Promise<ActionResponse<unknown>> {
  try {
    const session = await withAuth(["ADMIN", "DOCTOR"], async (s) => s);

    const parseResult = safeParseAction(updatePatientSchema, data);
    if (!parseResult.success) return parseResult;

    const updated = await patientService.update(id, parseResult.data, { id: session.user.id, email: session.user.email });
    revalidateTag("patients", "max");
    revalidateTag("patients-search", "max");
    revalidateTag(`patient-${id}`, "max");
    return { success: true, data: updated };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function togglePatientActive(id: number): Promise<ActionResponse<unknown>> {
  try {
    const session = await withAuth(["ADMIN", "DOCTOR"], async (s) => s);

    const updated = await patientService.toggleActive(id, { id: session.user.id, email: session.user.email });
    revalidateTag("patients", "max");
    revalidateTag("patients-search", "max");
    revalidateTag(`patient-${id}`, "max");
    return { success: true, data: updated };
  } catch (error) {
    return handleActionError(error);
  }
}
