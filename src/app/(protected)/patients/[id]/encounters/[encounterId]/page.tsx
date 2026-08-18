import { getPatientById } from "@/features/patient/queries";
import { getEncounterById } from "@/features/encounter/queries";
import { getPatientHistory } from "@/features/patient-history/queries";
import { notFound } from "next/navigation";
import { EncounterDetailView } from "@/features/encounter/components/encounter-detail-view";

interface EncounterPageProps {
  params: Promise<{
    id: string;
    encounterId: string;
  }>;
}

export default async function EncounterDetailPage({ params }: EncounterPageProps) {

  const resolvedParams = await params;
  
  const patientId = parseInt(resolvedParams.id, 10);
  const encounterId = parseInt(resolvedParams.encounterId, 10);
  
  if (isNaN(patientId) || isNaN(encounterId)) {
    notFound();
  }

  const [patient, encounter, patientHistory] = await Promise.all([
    getPatientById(patientId),
    getEncounterById(encounterId),
    getPatientHistory(patientId),
  ]).catch(() => [null, null, null]);

  if (!patient || !encounter) {
    notFound();
  }

  // Verificar que el encounter pertenece al patient
  if (encounter.patientId !== patient.id) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <EncounterDetailView patient={patient} encounter={encounter} patientHistory={patientHistory} />
    </div>
  );
}
