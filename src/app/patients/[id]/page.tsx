import { getPatientById } from "@/features/patient/queries";
import { Button, Card, Chip } from "@heroui/react";
import Link from "next/link";
import { ArrowLeft, Edit2 } from "lucide-react";
import { notFound } from "next/navigation";

export default async function PatientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const patientId = Number(params.id);
  if (isNaN(patientId)) notFound();

  const patient = await getPatientById(patientId);

  if (!patient) notFound();

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/patients">
            <Button isIconOnly variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              {patient.givenNames} {patient.familyNames}
              <Chip color={patient.active ? "success" : "danger"} variant="soft" size="sm">
                {patient.active ? "Activo" : "Inactivo"}
              </Chip>
            </h1>
            <p className="text-default-500 text-sm">Expediente Médico y Datos Generales</p>
          </div>
        </div>
        <Link href={`/patients/${patient.id}/edit`}>
          <Button variant="primary">
            <Edit2 className="w-4 h-4 mr-2" />
            Editar Paciente
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border border-default-200 shadow-sm flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Datos Personales</h2>
          <hr className="border-default-200" />
          <dl className="grid grid-cols-2 gap-y-4">
            <div>
              <dt className="text-sm text-default-500">Documento</dt>
              <dd className="font-medium">{patient.documentType}: {patient.identityDocument}</dd>
            </div>
            <div>
              <dt className="text-sm text-default-500">Fecha de Nacimiento</dt>
              <dd className="font-medium">{patient.birthDate ? new Date(patient.birthDate).toLocaleDateString() : "-"}</dd>
            </div>
            <div>
              <dt className="text-sm text-default-500">Sexo</dt>
              <dd className="font-medium">{patient.sex === "MALE" ? "Masculino" : "Femenino"}</dd>
            </div>
            <div>
              <dt className="text-sm text-default-500">Teléfono</dt>
              <dd className="font-medium">{patient.phone || "-"}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-sm text-default-500">Correo Electrónico</dt>
              <dd className="font-medium">{(patient as any).email || "-"}</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-6 border border-default-200 shadow-sm flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Datos Laborales</h2>
          <hr className="border-default-200" />
          <dl className="grid grid-cols-2 gap-y-4">
            <div>
              <dt className="text-sm text-default-500">Empresa</dt>
              <dd className="font-medium">{patient.company?.name || "-"}</dd>
            </div>
            <div>
              <dt className="text-sm text-default-500">Sede</dt>
              <dd className="font-medium">{patient.workplace?.name || "-"}</dd>
            </div>
            <div>
              <dt className="text-sm text-default-500">Área de Trabajo</dt>
              <dd className="font-medium">{patient.workArea?.name || "-"}</dd>
            </div>
            <div>
              <dt className="text-sm text-default-500">Puesto</dt>
              <dd className="font-medium">{patient.jobPosition?.name || "-"}</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-6 border border-default-200 shadow-sm flex flex-col gap-4 md:col-span-2">
          <h2 className="text-lg font-semibold">Contactos de Emergencia</h2>
          <hr className="border-default-200" />
          {patient.emergencyContacts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patient.emergencyContacts.map((contact) => (
                <div key={contact.id} className="p-3 bg-default-50 rounded-lg border border-default-100 flex flex-col">
                  <span className="font-medium flex items-center gap-2">
                    {contact.fullName}
                    {contact.isPrimary && <Chip size="sm" color="success" variant="soft">Principal</Chip>}
                  </span>
                  <span className="text-sm text-default-500">{contact.phone}</span>
                  {contact.relationshipType && (
                    <span className="text-xs text-default-400 mt-1">{contact.relationshipType.name}</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-default-500 text-sm">No hay contactos de emergencia registrados.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
