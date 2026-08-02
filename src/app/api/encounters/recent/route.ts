import { NextRequest, NextResponse } from "next/server";
import { getEncountersByPatient } from "@/features/encounter/queries";
import { withAuth } from "@/shared/auth/auth-guard";
import { handleActionError } from "@/shared/errors/app-error";

export async function GET(request: NextRequest) {
  try {
    await withAuth(["ADMIN", "DOCTOR"], async (s) => s);
    const searchParams = request.nextUrl.searchParams;
    const patientId = searchParams.get("patientId");
    
    if (!patientId || isNaN(Number(patientId))) {
      return NextResponse.json({ success: false, error: "Valid patientId is required" }, { status: 400 });
    }

    const result = await getEncountersByPatient(Number(patientId), { page: 1, pageSize: 15 });
    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    const actionError = handleActionError(error);
    return NextResponse.json(actionError, { status: 400 });
  }
}
