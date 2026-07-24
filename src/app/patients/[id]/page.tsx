import { getPatientById } from "@/features/patient/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Edit2 } from "lucide-react";
import { notFound } from "next/navigation";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const patientId = Number(resolvedParams.id);
  if (isNaN(patientId)) notFound();

  const patient = await getPatientById(patientId);

  if (!patient) notFound();

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/patients">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              {patient.givenNames} {patient.familyNames}
              <Badge variant={patient.active ? "default" : "destructive"}>
                {patient.active ? "Activo" : "Inactivo"}
              </Badge>
            </h1>
            <p className="text-muted-foreground text-sm">Expediente Médico y Datos Generales</p>
          </div>
        </div>
        <Link href={`/patients/${patient.id}/edit`}>
          <Button>
            <Edit2 className="w-4 h-4 mr-2" />
            Editar Paciente
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Datos Personales</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-y-4">
              <div>
                <dt className="text-sm text-muted-foreground">Documento</dt>
                <dd className="font-medium">
                  {patient.documentType}: {patient.identityDocument}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Fecha de Nacimiento</dt>
                <dd className="font-medium">
                  {patient.birthDate ? new Date(patient.birthDate).toLocaleDateString() : "-"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Sexo</dt>
                <dd className="font-medium">
                  {patient.sex === "MALE" ? "Masculino" : "Femenino"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Teléfono</dt>
                <dd className="font-medium">{patient.phone || "-"}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-sm text-muted-foreground">Correo Electrónico</dt>
                <dd className="font-medium">{(patient as any).email || "-"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Datos Laborales</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-y-4">
              <div>
                <dt className="text-sm text-muted-foreground">Empresa</dt>
                <dd className="font-medium">{patient.company?.name || "-"}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Sede</dt>
                <dd className="font-medium">{patient.workplace?.name || "-"}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Área de Trabajo</dt>
                <dd className="font-medium">{patient.workArea?.name || "-"}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Puesto</dt>
                <dd className="font-medium">{patient.jobPosition?.name || "-"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Contactos de Emergencia</CardTitle>
          </CardHeader>
          <CardContent>
            {patient.emergencyContacts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {patient.emergencyContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-3 bg-muted rounded-lg border flex flex-col"
                  >
                    <span className="font-medium flex items-center gap-2">
                      {contact.fullName}
                      {contact.isPrimary && (
                        <Badge variant="default" className="text-xs">
                          Principal
                        </Badge>
                      )}
                    </span>
                    <span className="text-sm text-muted-foreground">{contact.phone}</span>
                    {contact.relationshipType && (
                      <span className="text-xs text-muted-foreground mt-1">
                        {contact.relationshipType.name}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No hay contactos de emergencia registrados.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
