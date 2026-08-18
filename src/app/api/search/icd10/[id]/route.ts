import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/shared/auth/auth-guard";
import { AppError } from "@/shared/errors/app-error";

/**
 * GET /api/search/icd10/[id]
 * Resuelve un código ICD-10 por su ID.
 * Usado principalmente para mostrar el label de un diagnóstico precargado (reconsulta).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await withAuth(["ADMIN", "DOCTOR"], async (s) => s);
    const { id } = await params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const code = await prisma.icd10Code.findUnique({
      where: { id: numericId },
      select: { id: true, code: true, description: true },
    });

    if (!code) {
      return NextResponse.json({ error: "Código no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: code });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
