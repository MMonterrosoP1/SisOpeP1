import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { withAuth } from "@/shared/auth/auth-guard";
import { getDocumentByEncounterAndType } from "@/features/document/queries";
import { AppError } from "@/shared/errors/app-error";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ encounterId: string; documentTypeCode: string }> }
) {
  try {
    // 1. Verify Authentication
    await withAuth(["ADMIN", "DOCTOR"], async (s) => s);

    const { encounterId, documentTypeCode } = await params;
    const encounterIdNumber = parseInt(encounterId, 10);

    if (isNaN(encounterIdNumber) || !documentTypeCode) {
      return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
    }

    // 2. Fetch certificate URL from DB
    const documentRecord = await getDocumentByEncounterAndType(encounterIdNumber, documentTypeCode);

    if (!documentRecord || !documentRecord.pdfUrl) {
      return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });
    }

    // 3. Fetch blob from Vercel (private access)
    const { stream, headers } = await get(documentRecord.pdfUrl, { access: 'private' }) as any;

    if (!stream) {
      return NextResponse.json({ error: "Documento inaccesible" }, { status: 404 });
    }

    // 4. Return proxy response
    const newHeaders = new Headers(headers);
    newHeaders.set("Content-Type", "application/pdf");
    
    return new Response(stream, {
      headers: newHeaders,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    console.error("Error fetching private document blob:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
