import { NextRequest, NextResponse } from "next/server";
import { getCatalogs } from "@/features/catalog/queries";
import { CatalogType } from "@/features/catalog/types";
import { withAuth } from "@/shared/auth/auth-guard";
import { AppError } from "@/shared/errors/app-error";

function normalizeCatalogName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ')           // múltiples espacios → uno
    .normalize('NFD')                // descomponer acentos
    .replace(/[\u0300-\u036f]/g, '') // remover diacríticos
    .toLowerCase();
}

function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) == a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

export async function GET(request: NextRequest) {
  try {
    await withAuth(["ADMIN", "DOCTOR"], async (s) => s);
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const type = searchParams.get("type") as CatalogType;
    
    if (!type) {
      return NextResponse.json({ success: false, error: "Type is required" }, { status: 400 });
    }

    const normalized = normalizeCatalogName(query);
    const allItems = await getCatalogs(type);
    
    const similar = allItems.filter((item: any) => {
      const itemNormalized = normalizeCatalogName(item.name);
      return (
        itemNormalized === normalized ||
        itemNormalized.includes(normalized) ||
        normalized.includes(itemNormalized) ||
        levenshteinDistance(itemNormalized, normalized) <= 2
      );
    });

    return NextResponse.json({ success: true, data: similar });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
