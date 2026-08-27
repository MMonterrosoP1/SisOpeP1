import { getPatientById } from "@/features/patient/queries";
import { getCatalogs } from "@/features/catalog/queries";
import { getEncounterById } from "@/features/encounter/queries";
import { getPatientHistory } from "@/features/patient-history/queries";
import { mapEncounterToEditFormState } from "@/features/encounter/domain/encounter-snapshot";
import { EncounterForm } from "@/features/encounter/components/encounter-form";
import { BackButton } from "@/shared/components/back-button";
import { notFound } from "next/navigation";

export default async function EditEncounterPage({
  params,
}: {
  params: Promise<{ id: string; encounterId: string }>;
}) {
  const resolvedParams = await params;
  const patientId = Number(resolvedParams.id);
  const encounterId = Number(resolvedParams.encounterId);
  
  if (isNaN(patientId) || isNaN(encounterId)) notFound();

  const patient = await getPatientById(patientId);
  if (!patient) notFound();

  if (!patient.active) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <h2 className="text-2xl font-bold text-destructive">Paciente Inactivo</h2>
        <p className="text-muted-foreground text-center">No se pueden editar consultas para pacientes inactivos.<br />Por favor, active al paciente primero desde su perfil.</p>
        <BackButton />
      </div>
    );
  }

  const encounter = await getEncounterById(encounterId);
  if (!encounter) notFound();
  
  if (encounter.patientId !== patient.id) {
    notFound();
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
    habitCatalog,
    allergyCategory,
    suspensionHour,
    exerciseCatalog,
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
    getCatalogs("habitCatalog"),
    getCatalogs("allergyCategory"),
    getCatalogs("suspensionHour"),
    getCatalogs("exerciseCatalog"),
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
    habitCatalog,
    allergyCategory,
    suspensionHour,
    exerciseCatalog,
  };

  const initialData = mapEncounterToEditFormState(encounter as any, patientId);

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <BackButton />
        <div>
          <h1 className="text-2xl font-bold">Editando Consulta: {patient.person.givenNames} {patient.person.familyNames}</h1>
          <p className="text-muted-foreground text-sm">Modifique los datos de la evaluación médica de la consulta del {new Intl.DateTimeFormat('es-ES', {
                    day: '2-digit', month: 'long', year: 'numeric'
                  }).format(new Date(encounter.createdAt))}.</p>
        </div>
      </div>

      <EncounterForm 
        patientId={patientId} 
        patientSex={patient.person.sex as any} 
        catalogs={catalogs}
        patientHistory={patientHistory}
        mode="edit"
        encounterId={encounterId}
        initialData={initialData as any}
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
