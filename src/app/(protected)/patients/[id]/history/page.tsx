import { getPatientById } from "@/features/patient/queries";
import { getCatalogs } from "@/features/catalog/queries";
import { getPatientHistory } from "@/features/patient-history/queries";
import { PatientHistoryForm } from "@/features/patient-history/components/patient-history-form";
import { BackButton } from "@/shared/components/back-button";
import { notFound } from "next/navigation";

export default async function EditPatientHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const patientId = Number(resolvedParams.id);
  if (isNaN(patientId)) notFound();

  const [patient, patientHistory, allergenCatalog, surgicalProcedure, habitCatalog, exerciseCatalog] = await Promise.all([
    getPatientById(patientId),
    getPatientHistory(patientId),
    getCatalogs("allergenCatalog"),
    getCatalogs("surgicalProcedure"),
    getCatalogs("habitCatalog"),
    getCatalogs("exerciseCatalog"),
  ]);

  if (!patient) notFound();

  const catalogs = {
    allergenCatalog,
    surgicalProcedure,
    habitCatalog,
    exerciseCatalog,
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <BackButton />
        <div>
          <h1 className="text-2xl font-bold">Actualizar Antecedentes Clínicos</h1>
          <p className="text-muted-foreground text-sm">
            {patient.person.givenNames} {patient.person.familyNames}
          </p>
        </div>
      </div>

      <PatientHistoryForm 
        patientId={patientId} 
        catalogs={catalogs} 
        initialData={patientHistory} 
      />
    </div>
  );
}
