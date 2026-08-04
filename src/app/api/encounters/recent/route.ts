import { NextRequest, NextResponse } from "next/server";
import { getEncounters } from "@/features/encounter/queries";
import { withAuth } from "@/shared/auth/auth-guard";
import { AppError } from "@/shared/errors/app-error";

export async function GET(request: NextRequest) {
  try {
    const session = await withAuth(["ADMIN", "DOCTOR"], async (s) => s);
    const searchParams = request.nextUrl.searchParams;
    const patientId = searchParams.get("patientId");
    
    if (!patientId || isNaN(Number(patientId))) {
      return NextResponse.json({ success: false, error: "Valid patientId is required" }, { status: 400 });
    }

    const filters: any = { patientId: Number(patientId) };
    if (session.user.role === "DOCTOR") {
      filters.practitionerId = session.user.id;
    }

    const result = await getEncounters(filters, { page: 1, pageSize: 15 });
    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
