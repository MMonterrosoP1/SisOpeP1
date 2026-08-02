import { NextRequest, NextResponse } from "next/server";
import { searchPatients } from "@/features/patient/queries";
import { withAuth } from "@/shared/auth/auth-guard";
import { handleActionError } from "@/shared/errors/app-error";

export async function GET(request: NextRequest) {
  try {
    await withAuth(["ADMIN", "DOCTOR"], async (s) => s);
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    
    const results = await searchPatients(query);
    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    const actionError = handleActionError(error);
    return NextResponse.json(actionError, { status: 400 });
  }
}
