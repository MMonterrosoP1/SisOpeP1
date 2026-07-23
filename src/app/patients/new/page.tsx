import { getCatalogs } from "@/features/catalog/queries";
import { PatientForm } from "@/features/patient/components/patient-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewPatientPage() {
  const [company, workplace, workArea, jobPosition, maritalStatus, bloodType, relationshipType] = await Promise.all([
    getCatalogs("company"),
    getCatalogs("workplace"),
    getCatalogs("workArea"),
    getCatalogs("jobPosition"),
    getCatalogs("maritalStatus"),
    getCatalogs("bloodType"),
    getCatalogs("relationshipType"),
  ]);

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
        <Link href="/patients">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Nuevo Paciente</h1>
          <p className="text-muted-foreground text-sm">Registra un nuevo paciente en el sistema.</p>
        </div>
      </div>

      <PatientForm catalogs={catalogs} />
    </div>
  );
}
