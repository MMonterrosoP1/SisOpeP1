import { getDocuments } from "@/features/document/queries";
import { CertificatesTable } from "@/features/document/components/certificates-table";

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
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Constancias</h1>
        <p className="text-muted-foreground">Administra y genera las constancias médicas y de enfermedad.</p>
      </div>
      <CertificatesTable data={data} meta={meta} />
    </div>
  );
}
