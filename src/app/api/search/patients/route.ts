import { NextRequest, NextResponse } from "next/server";
import { searchPatients } from "@/features/patient/queries";
import { withAuth } from "@/shared/auth/auth-guard";
import { handleActionError, AppError } from "@/shared/errors/app-error";
import { rateLimit } from "@/shared/utils/rate-limiter";

export async function GET(request: NextRequest) {
  try {
    await withAuth(["ADMIN", "DOCTOR"], async (s) => s);
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    
    // Rate Limiting: Max 20 requests per minute per IP
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(`search-patients:${ip}`, 20, 60000)) {
      return NextResponse.json({ error: "Demasiadas peticiones. Intente más tarde." }, { status: 429 });
    }
    
    const results = await searchPatients(query);
    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
