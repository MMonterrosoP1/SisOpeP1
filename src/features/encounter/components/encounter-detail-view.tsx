"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, Stethoscope, AlertTriangle, FileText, Activity, User, Briefcase, History, Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DocumentActionButton } from "@/features/document/components/document-action-button";

const pregnancyStatusEs: Record<string, string> = {
  NOT_APPLICABLE: "No Aplica",
  NOT_PREGNANT: "No Embarazada",
  PREGNANT: "Embarazada",
  POSTPARTUM: "Postparto",
};

const frequencyEs: Record<string, string> = {
  DAILY: "Diario",
  WEEKLY: "Semanal",
  MONTHLY: "Mensual",
  OCCASIONALLY: "Ocasional",
};

const bmiCategoryEs: Record<string, string> = {
  UNDERWEIGHT: "Bajo peso",
  NORMAL: "Normal",
  OVERWEIGHT: "Sobrepeso",
  OBESE_I: "Obesidad Tipo I",
  OBESE_II: "Obesidad Tipo II",
  OBESE_III: "Obesidad Tipo III",
};

const EmptyState = ({ message = "Sin registros" }: { message?: string }) => (
  <div className="text-sm text-muted-foreground italic py-2">{message}</div>
);

import { PatientHistorySummary } from "@/features/patient-history/components/patient-history-summary";

export function EncounterDetailView({ encounter, patient, patientHistory }: { encounter: any; patient: any; patientHistory?: any }) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-card p-6 rounded-xl border shadow-sm">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 -ml-2 text-muted-foreground hover:text-foreground"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Regresar
            </Button>
          </div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Consulta Médica
            {encounter.encounterType?.name && (
              <Badge variant="secondary" className="text-xs font-normal">
                {encounter.encounterType.name}
              </Badge>
            )}
          </h1>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              Paciente: <span className="font-medium text-foreground">{patient.person?.givenNames} {patient.person?.familyNames}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Activity className="h-4 w-4" />
              Fecha: <span className="font-medium text-foreground">{format(new Date(encounter.createdAt), "dd 'de' MMMM, yyyy - HH:mm", { locale: es })}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Stethoscope className="h-4 w-4" />
              Atendido por: <span className="font-medium text-foreground">{encounter.practitioner?.name}</span>
            </span>
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="default" onClick={() => router.push(`/patients/${patient.id}/encounters/${encounter.id}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar Consulta
          </Button>
          <DocumentActionButton
            encounterId={encounter.id}
            documentTypeCode="MEDICAL_CERTIFICATE"
            label="Constancia Médica"
            initialPdfUrl={encounter.documents?.find((d: any) => d.documentType.code === 'MEDICAL_CERTIFICATE')?.pdfUrl}
            size="default"
          />
          <DocumentActionButton
            encounterId={encounter.id}
            documentTypeCode="ILLNESS_CERTIFICATE"
            label="Constancia de Enfermedad"
            initialPdfUrl={encounter.documents?.find((d: any) => d.documentType.code === 'ILLNESS_CERTIFICATE')?.pdfUrl}
            size="default"
          />
        </div>
      </div>

      {/* 1. Motivo de Consulta */}

      <Card>
        <CardHeader className="pb-3 border-b mb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Datos Generales
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <h4 className="font-semibold text-sm mb-1 text-muted-foreground">Motivo de Consulta (Sintomatología)</h4>
            {encounter.symptomatology ? (
              <p className="text-sm whitespace-pre-wrap">{encounter.symptomatology}</p>
            ) : <EmptyState />}
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-1 text-muted-foreground">Historia de Enfermedad </h4>
            {encounter.illnessHistory ? (
              <p className="text-sm whitespace-pre-wrap">{encounter.illnessHistory}</p>
            ) : <EmptyState />}
          </div>
        </CardContent>
      </Card>

      <PatientHistorySummary history={patientHistory} />



      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left Column - Main Clinical Info */}
        <div className="xl:col-span-2 flex flex-col gap-6">

          <Card>
            <CardHeader className="pb-3 border-b mb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-primary" />
                Signos Vitales y Antropometría
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Signos Vitales */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Presión Arterial</span>
                  <span className="text-sm font-medium">
                    {encounter.vitalSign?.systolicBP || '--'} / {encounter.vitalSign?.diastolicBP || '--'} mmHg
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Frecuencia Cardíaca</span>
                  <span className="text-sm font-medium">{encounter.vitalSign?.heartRate || '--'} lpm</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Frec. Respiratoria</span>
                  <span className="text-sm font-medium">{encounter.vitalSign?.respiratoryRate || '--'} /min</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">SpO2</span>
                  <span className="text-sm font-medium">{encounter.vitalSign?.oxygenSaturation || '--'} %</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Temperatura</span>
                  <span className="text-sm font-medium">{encounter.vitalSign?.temperature || '--'} °C</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Glucosa</span>
                  <span className="text-sm font-medium">{encounter.vitalSign?.glucose || '--'} mg/dL</span>
                </div>

                {/* Antropometría */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Peso / Talla</span>
                  <span className="text-sm font-medium">
                    {encounter.anthropometry?.weight || '--'} lb / {encounter.anthropometry?.height || '--'} cm
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Circ. Abdominal</span>
                  <span className="text-sm font-medium">{encounter.anthropometry?.abdominalCircumference || '--'} cm</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">IMC Estimado</span>
                  <span className="text-sm font-medium">{encounter.anthropometry?.bmi ? encounter.anthropometry.bmi.toFixed(2) : '--'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Clasificación IMC</span>
                  <div>
                    {encounter.anthropometry?.bmiCategory ? (
                      <span className="text-sm font-medium">
                        {bmiCategoryEs[encounter.anthropometry.bmiCategory] || encounter.anthropometry.bmiCategory}
                      </span>
                    ) : (
                      <span className="text-sm font-medium">--</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b mb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Diagnósticos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {encounter.diagnoses && encounter.diagnoses.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código (CIE-10)</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Observaciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {encounter.diagnoses.map((d: any) => (
                      <TableRow key={d.id}>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-sm">{d.icd10Code?.code} - {d.icd10Code?.description}</span>
                            {d.isPrimary && <Badge className="w-fit text-[10px]" variant="default">Principal</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">{d.diseaseType?.name || '-'}</TableCell>
                        <TableCell className="text-xs">{d.observations || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : <EmptyState />}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b mb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" />
                Plan y Observaciones Finales
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold text-xs mb-1 text-muted-foreground">Aptitud Médica</h4>
                  {encounter.medicalAptitude ? <p className="text-sm font-medium">{encounter.medicalAptitude.name}</p> : <EmptyState />}
                </div>
                <div>
                  <h4 className="font-semibold text-xs mb-1 text-muted-foreground">Nivel de Referencia</h4>
                  {encounter.referralLevel ? <p className="text-sm font-medium">{encounter.referralLevel.name}</p> : <EmptyState />}
                </div>
                <div>
                  <h4 className="font-semibold text-xs mb-1 text-muted-foreground">Fecha de Seguimiento</h4>
                  {encounter.followUpDate ? <p className="text-sm">{format(new Date(encounter.followUpDate), "PPP", { locale: es })}</p> : <EmptyState />}
                </div>
                <div>
                  <h4 className="font-semibold text-xs mb-1 text-muted-foreground">Medicamentos Administrados</h4>
                  {encounter.medicationsAdministered ? <p className="text-sm">{encounter.medicationsAdministered}</p> : <EmptyState />}
                </div>
                <div>
                  <h4 className="font-semibold text-xs mb-1 text-muted-foreground">Horas de Suspensión (Descanso)</h4>
                  {encounter.suspensionHour ? <p className="text-sm">{encounter.suspensionHour.name}</p> : <EmptyState />}
                </div>
                <div>
                  <h4 className="font-semibold text-xs mb-1 text-muted-foreground">Horas de Sueño</h4>
                  {encounter.sleepHours ? <p className="text-sm">{encounter.sleepHours} horas</p> : <EmptyState />}
                </div>
              </div>
              <div className="mt-2 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-xs mb-1 text-muted-foreground">Observación Interna (Médico)</h4>
                  {encounter.internalObservation ? <p className="text-sm whitespace-pre-wrap">{encounter.internalObservation}</p> : <EmptyState />}
                </div>
                <div>
                  <h4 className="font-semibold text-xs mb-1 text-muted-foreground">Observación Patronal (Empresa)</h4>
                  {encounter.employerObservation ? <p className="text-sm whitespace-pre-wrap">{encounter.employerObservation}</p> : <EmptyState />}
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Column - Histories and Complementary */}
        <div className="flex flex-col gap-6">

          {patient.person?.sex === "FEMALE" && (
            <Card>
              <CardHeader className="pb-3 border-b mb-3">
                <CardTitle className="text-md">Ginecología</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Estado de Embarazo</span>
                  <span className="text-sm font-medium">{encounter.pregnancyStatus ? pregnancyStatusEs[encounter.pregnancyStatus] : pregnancyStatusEs.NOT_APPLICABLE}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Historia Ginecológica</span>
                  {encounter.gynecologicalHistory ? <p className="text-sm text-foreground">{encounter.gynecologicalHistory}</p> : <EmptyState />}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Se eliminaron los Antecedentes Personales y Alergias/Hábitos de aquí según Opción B */}

          <Card>
            <CardHeader className="pb-3 border-b mb-3">
              <CardTitle className="text-md flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> Área Laboral
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <span className="font-semibold text-xs block mb-1">Exposiciones Laborales</span>
                {encounter.occupationalExposureEntries?.length ? (
                  <ul className="list-disc list-inside text-sm flex flex-col gap-1 text-muted-foreground">
                    {encounter.occupationalExposureEntries.map((e: any) => (
                      <li key={e.id}><span className="text-foreground">{e.occupationalExposure?.name}</span> {e.observations && <span className="italic text-xs">({e.observations})</span>}</li>
                    ))}
                  </ul>
                ) : <EmptyState />}
              </div>

              <div>
                <span className="font-semibold text-xs block mb-1">Incapacidades Laborales</span>
                {encounter.workDisabilityEntries?.length ? (
                  <ul className="list-disc list-inside text-sm flex flex-col gap-1 text-muted-foreground">
                    {encounter.workDisabilityEntries.map((e: any) => (
                      <li key={e.id}><span className="text-foreground">{e.workDisability?.name}</span> {e.observations && <span className="italic text-xs">({e.observations})</span>}</li>
                    ))}
                  </ul>
                ) : <EmptyState />}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
