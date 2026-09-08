import { NextRequest, NextResponse } from "next/server";
import { sftpGet } from "@/lib/sftp";
import { withAuth } from "@/shared/auth/auth-guard";
import { getDocumentByEncounterAndType } from "@/features/document/queries";
import { AppError } from "@/shared/errors/app-error";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ encounterId: string; documentTypeCode: string }> }
) {
  try {
    // 1. Verify Authentication
    const session = await withAuth(["ADMIN", "DOCTOR"], async (s) => s);

    const { encounterId, documentTypeCode } = await params;
    const encounterIdNumber = parseInt(encounterId, 10);

    if (isNaN(encounterIdNumber) || !documentTypeCode) {
      return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
    }

    // 1.5. Verifica la existencia de la consulta (opcional, pero útil si se quiere dar 404 antes)
    const encounter = await prisma.encounter.findUnique({
      where: { id: encounterIdNumber },
      select: { id: true }
    });
    if (!encounter) {
      return NextResponse.json({ error: "Consulta no encontrada" }, { status: 404 });
    }

    // 2. Fetch certificate URL from DB
    const documentRecord = await getDocumentByEncounterAndType(encounterIdNumber, documentTypeCode);

    if (!documentRecord || !documentRecord.pdfUrl) {
      return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });
    }

    // 3. Fetch from SFTP
    let stream: ReadableStream;
    try {
      stream = await sftpGet(documentRecord.pdfUrl);
    } catch (err: any) {
      if (err.message === "File not found on SFTP server" || err.code === 2) {
        return NextResponse.json({ error: "Documento inaccesible" }, { status: 404 });
      }
      throw err;
    }

    // 4. Return proxy response
    return new Response(stream, {
      headers: {
        "Content-Type": "application/pdf",
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    console.error("Error fetching private document blob:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
