"use server";

import { revalidateTag } from "next/cache";
import { withAuth } from "@/shared/auth/auth-guard";
import { reportRepository } from "./repository";
import { workforceSnapshotSchema } from "./schemas";

export async function upsertWorkforceSnapshotAction(formData: FormData) {
  try {
    const session = await withAuth(["ADMIN", "DOCTOR", "VIEWER"], async (s) => s);

      const data = {
        workplaceId: Number(formData.get("workplaceId")),
        year: Number(formData.get("year")),
        month: Number(formData.get("month")),
        totalWorkers: Number(formData.get("totalWorkers")),
        maleWorkers: Number(formData.get("maleWorkers") || 0),
        femaleWorkers: Number(formData.get("femaleWorkers") || 0),
        scheduledDays: Number(formData.get("scheduledDays") || 22),
        observations: formData.get("observations")?.toString() || null,
      };

      const validatedData = workforceSnapshotSchema.parse(data);

      await reportRepository.upsertWorkforceSnapshot(validatedData, session.user.id);
      
      revalidateTag("workforce", "max");
      revalidateTag("reports", "max");

      return { success: true };
    } catch (error: any) {
      console.error("Failed to upsert workforce snapshot:", error);
      return { success: false, error: error.message || "Error al guardar los datos de fuerza laboral" };
    }
}
