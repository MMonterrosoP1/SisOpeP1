import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
      const practitioner = await prisma.practitioner.findUnique({ where: { userId: session.user.id } });
      if (practitioner) {
        filters.practitionerId = practitioner.id;
      } else {
        // If they are a doctor but have no practitioner profile, they shouldn't see anything
        filters.practitionerId = -1;
      }
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
