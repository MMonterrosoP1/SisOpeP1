import { getPatientById } from "@/features/patient/queries";
import { getCatalogs } from "@/features/catalog/queries";
import { EncounterForm } from "@/features/encounter/components/encounter-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export default async function NewEncounterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const patientId = Number(resolvedParams.id);
  if (isNaN(patientId)) notFound();

  const patient = await getPatientById(patientId);
  if (!patient || !patient.active) notFound();

  const [
    encounterType,
    allergenCatalog,
    diseaseType,
    surgicalProcedure,
    occupationalExposure,
    workDisability,
    referralLevel,
    medicalAptitude,
  ] = await Promise.all([
    getCatalogs("encounterType"),
    getCatalogs("allergenCatalog"),
    getCatalogs("diseaseType"),
    getCatalogs("surgicalProcedure"),
    getCatalogs("occupationalExposure"),
    getCatalogs("workDisability"),
    getCatalogs("referralLevel"),
    getCatalogs("medicalAptitude"),
  ]);

  const catalogs = {
    encounterType,
    allergenCatalog,
    diseaseType,
    surgicalProcedure,
    occupationalExposure,
    workDisability,
    referralLevel,
    medicalAptitude,
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Link href={`/patients/${patientId}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Nueva Consulta: {patient.givenNames} {patient.familyNames}</h1>
          <p className="text-muted-foreground text-sm">Registre los datos de la evaluación médica del paciente.</p>
        </div>
      </div>

      <EncounterForm patientId={patientId} patientSex={patient.sex} catalogs={catalogs} />
    </div>
  );
}
