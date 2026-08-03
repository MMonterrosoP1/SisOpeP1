import { getDocuments } from "@/features/document/queries";
import { CertificatesTable } from "@/features/document/components/certificates-table";
import { CertificatesFilters } from "@/features/document/components/certificates-filters";
import { NewCertificateModal } from "@/features/document/components/new-certificate-modal";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CertificatesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CertificatesPage({ searchParams }: CertificatesPageProps) {
  const resolvedParams = await searchParams;
  const page = typeof resolvedParams.page === "string" ? parseInt(resolvedParams.page) : 1;
  const pageSize = typeof resolvedParams.pageSize === "string" ? parseInt(resolvedParams.pageSize) : 10;
  const search = typeof resolvedParams.search === "string" ? resolvedParams.search : undefined;
  const type = typeof resolvedParams.type === "string" ? resolvedParams.type : undefined;

  const { data, meta } = await getDocuments(
    { search, type },
    { page, pageSize }
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Constancias</h1>
          <p className="text-muted-foreground text-sm">Administra y genera las constancias médicas y de enfermedad.</p>
        </div>
        <NewCertificateModal />
      </div>

      <CertificatesFilters />

      <div className="bg-background rounded-lg border shadow-sm overflow-hidden">
        <CertificatesTable data={data} meta={meta} />

        <div className="flex justify-between items-center p-4 border-t">
          <span className="text-sm text-muted-foreground">
            Mostrando {data.length} de {meta.totalCount} resultados
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={`/certificates?page=${page - 1}`}>
                <Button variant="outline" size="sm">
                  Anterior
                </Button>
              </Link>
            )}
            {page < meta.totalPages && (
              <Link href={`/certificates?page=${page + 1}`}>
                <Button variant="outline" size="sm">
                  Siguiente
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
