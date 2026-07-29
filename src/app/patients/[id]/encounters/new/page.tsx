import { getPatientById } from "@/features/patient/queries";
import { getCatalogs } from "@/features/catalog/queries";
import { getLatestEncounterByPatient } from "@/features/encounter/queries";
import { mapEncounterToFormDefaults } from "@/features/encounter/domain/encounter-snapshot";
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
    habitCatalog,
    allergyCategory,
    latestEncounter,
  ] = await Promise.all([
    getCatalogs("encounterType"),
    getCatalogs("allergenCatalog"),
    getCatalogs("diseaseType"),
    getCatalogs("surgicalProcedure"),
    getCatalogs("occupationalExposure"),
    getCatalogs("workDisability"),
    getCatalogs("referralLevel"),
    getCatalogs("medicalAptitude"),
    getCatalogs("habitCatalog"),
    getCatalogs("allergyCategory"),
    getLatestEncounterByPatient(patientId),
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
    habitCatalog,
    allergyCategory,
  };

  const previousDefaults = latestEncounter ? mapEncounterToFormDefaults(latestEncounter, patientId) : undefined;
  const isFollowUp = !!latestEncounter;
  const previousEncounterDate = latestEncounter?.createdAt?.toISOString();

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Link href={`/patients/${patientId}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{isFollowUp ? "Reconsulta:" : "Nueva Consulta:"} {patient.givenNames} {patient.familyNames}</h1>
          <p className="text-muted-foreground text-sm">Registre los datos de la evaluación médica del paciente.</p>
        </div>
      </div>

      <EncounterForm 
        patientId={patientId} 
        patientSex={patient.sex as any} 
        catalogs={catalogs}
        previousDefaults={previousDefaults}
        isFollowUp={isFollowUp}
        previousEncounterDate={previousEncounterDate}
        patientSummary={{
          fullName: `${patient.givenNames} ${patient.familyNames}`,
          age: (() => {
            const today = new Date();
            const birth = new Date(patient.birthDate);
            let age = today.getFullYear() - birth.getFullYear();
            const m = today.getMonth() - birth.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
              age--;
            }
            return age >= 0 ? age : 0;
          })(),
          identityDocument: patient.identityDocument,
          phone: patient.phone,
          jobPosition: patient.jobPosition?.name,
          workplace: patient.workplace?.name,
        }}
      />
    </div>
  );
}
