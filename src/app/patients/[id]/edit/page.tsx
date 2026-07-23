import { getCatalogs } from "@/features/catalog/queries";
import { getPatientById } from "@/features/patient/queries";
import { PatientForm } from "@/features/patient/components/patient-form";
import { Button } from "@heroui/react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export default async function EditPatientPage({
  params,
}: {
  params: { id: string };
}) {
  const patientId = Number(params.id);
  if (isNaN(patientId)) notFound();

  const [patient, company, workplace, workArea, jobPosition, maritalStatus, bloodType, relationshipType] = await Promise.all([
    getPatientById(patientId),
    getCatalogs("company"),
    getCatalogs("workplace"),
    getCatalogs("workArea"),
    getCatalogs("jobPosition"),
    getCatalogs("maritalStatus"),
    getCatalogs("bloodType"),
    getCatalogs("relationshipType"),
  ]);

  if (!patient) notFound();

  const catalogs = {
    company,
    workplace,
    workArea,
    jobPosition,
    maritalStatus,
    bloodType,
    relationshipType,
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Link href={`/patients/${patient.id}`}>
          <Button isIconOnly variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Editar Paciente</h1>
          <p className="text-default-500 text-sm">Actualizando datos de {patient.givenNames} {patient.familyNames}.</p>
        </div>
      </div>

      <PatientForm initialData={patient} catalogs={catalogs} />
    </div>
  );
}
