import { getPatientById } from "@/features/patient/queries";
import { getCatalogs } from "@/features/catalog/queries";
import { getLatestEncounterByPatient } from "@/features/encounter/queries";
import { getPatientHistory } from "@/features/patient-history/queries";
import { mapEncounterToFormDefaults } from "@/features/encounter/domain/encounter-snapshot";
import { EncounterForm } from "@/features/encounter/components/encounter-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { BackButton } from "@/shared/components/back-button";
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
  if (!patient) notFound();

  if (!patient.active) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <h2 className="text-2xl font-bold text-destructive">Paciente Inactivo</h2>
        <p className="text-muted-foreground text-center">No se pueden crear nuevas consultas para pacientes inactivos.<br />Por favor, active al paciente primero desde su perfil.</p>
        <BackButton />
      </div>
    );
  }

  const [
    encounterType,
    allergenCatalog,
    diseaseType,
    surgicalProcedure,
    occupationalExposure,
    workDisability,
    referralLevel,
    medicalAptitude,
    affectedSystem,
    habitCatalog,
    allergyCategory,
    suspensionHour,
    exerciseCatalog,
    latestEncounter,
    patientHistory,
  ] = await Promise.all([
    getCatalogs("encounterType"),
    getCatalogs("allergenCatalog"),
    getCatalogs("diseaseType"),
    getCatalogs("surgicalProcedure"),
    getCatalogs("occupationalExposure"),
    getCatalogs("workDisability"),
    getCatalogs("referralLevel"),
    getCatalogs("medicalAptitude"),
    getCatalogs("affectedSystem"),
    getCatalogs("habitCatalog"),
    getCatalogs("allergyCategory"),
    getCatalogs("suspensionHour"),
    getCatalogs("exerciseCatalog"),
    getLatestEncounterByPatient(patientId),
    getPatientHistory(patientId),
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
    affectedSystem,
    habitCatalog,
    allergyCategory,
    suspensionHour,
    exerciseCatalog,
  };

  const previousDefaults = latestEncounter ? mapEncounterToFormDefaults(latestEncounter, patientId) : undefined;
  const isFollowUp = !!latestEncounter;
  const previousEncounterDate = latestEncounter?.createdAt?.toISOString();

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <BackButton />
        <div>
          <h1 className="text-2xl font-bold">{isFollowUp ? "Reconsulta:" : "Nueva Consulta:"} {patient.person.givenNames} {patient.person.familyNames}</h1>
          <p className="text-muted-foreground text-sm">Registre los datos de la evaluación médica del paciente.</p>
        </div>
      </div>

      <EncounterForm 
        patientId={patientId} 
        patientSex={patient.person.sex as any} 
        catalogs={catalogs}
        previousDefaults={previousDefaults}
        patientHistory={patientHistory}
        isFollowUp={isFollowUp}
        previousEncounterDate={previousEncounterDate}
        patientSummary={{
          fullName: `${patient.person.givenNames} ${patient.person.familyNames}`,
          age: (() => {
            if (!patient.person.birthDate) return 0;
            const today = new Date();
            const birth = new Date(patient.person.birthDate);
            let age = today.getFullYear() - birth.getFullYear();
            const m = today.getMonth() - birth.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
              age--;
            }
            return age >= 0 ? age : 0;
          })(),
          identityDocument: patient.person.identityDocument ?? "",
          phone: patient.person.phone ?? "",
          jobPosition: patient.jobPosition?.name,
          workplace: patient.workplace?.name,
        }}
      />
    </div>
  );
}
