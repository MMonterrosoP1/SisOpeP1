"use client";

import { useState, useEffect, useTransition, useActionState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Loader2, AlertCircle, FileText, CheckCircle2 } from "lucide-react";

import { generateDocumentAction } from "@/features/document/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function NewCertificateModal() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Step 1: Patient Search
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<any[]>([]);
  const [isSearching, startSearching] = useTransition();
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

  // Step 2: Encounters
  const [encounters, setEncounters] = useState<any[]>([]);
  const [isLoadingEncounters, startLoadingEncounters] = useTransition();
  const [selectedEncounterId, setSelectedEncounterId] = useState<string>("");
  const [documentTypeCode, setDocumentTypeCode] = useState<string>("MEDICAL_CERTIFICATE");

  // Step 3: Generation
  const [generateState, generateFormAction, isGenerating] = useActionState(
    async (_prev: any) => {
      if (!selectedEncounterId || !documentTypeCode) {
        return { success: false, error: "Selección incompleta" };
      }
      return await generateDocumentAction({
        encounterId: parseInt(selectedEncounterId),
        documentTypeCode,
      });
    },
    null
  );

  useEffect(() => {
    if (!generateState) return;
    if (generateState.success) {
      toast.success("Constancia generada exitosamente");
      setOpen(false);
      router.refresh();
    } else if (generateState.error) {
      toast.error(generateState.error || "Ocurrió un error al generar la constancia");
    }
  }, [generateState, router]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setPatients([]);
      setSelectedPatient(null);
      setEncounters([]);
      setSelectedEncounterId("");
      setDocumentTypeCode("MEDICAL_CERTIFICATE");
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length >= 2) {
        startSearching(async () => {
          const req = await fetch(`/api/search/patients?q=${encodeURIComponent(searchQuery)}`);
          const res = await req.json();
          if (res.success) {
            setPatients(res.data);
          }
        });
      } else {
        setPatients([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Fetch encounters when patient selected
  useEffect(() => {
    if (selectedPatient) {
      startLoadingEncounters(async () => {
        const res = await fetch(`/api/encounters/recent?patientId=${selectedPatient.id}`).then(r => r.json());
        if (res.success) {
          setEncounters(res.data);
        }
      });
    }
  }, [selectedPatient]);



  const selectedEncounter = encounters.find(e => e.id.toString() === selectedEncounterId);
  const existingDocument = selectedEncounter?.documents?.find((d: any) => d.documentType.code === documentTypeCode);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground hover:bg-primary/80 h-8 gap-1.5 px-3 text-sm font-medium transition-all outline-none">
        <Plus className="w-4 h-4 mr-2" />
        Nueva Constancia
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generar Nueva Constancia</DialogTitle>
          <DialogDescription>
            Busca al paciente y selecciona la consulta para generar la constancia.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          {/* Step 1: Patient Selection */}
          <div className="space-y-2">
            <Label>1. Buscar Paciente</Label>
            {!selectedPatient ? (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Escribe el nombre o DPI..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                {patients.length > 0 && (
                  <div className="border rounded-md mt-2 max-h-[150px] overflow-y-auto">
                    {patients.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPatient(p)}
                        className="p-2 hover:bg-muted cursor-pointer flex flex-col text-sm border-b last:border-0"
                      >
                        <span className="font-medium">{p.givenNames} {p.familyNames}</span>
                        <span className="text-xs text-muted-foreground">DPI: {p.identityDocument}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{selectedPatient.givenNames} {selectedPatient.familyNames}</span>
                  <span className="text-xs text-muted-foreground">DPI: {selectedPatient.identityDocument}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedPatient(null)}>
                  Cambiar
                </Button>
              </div>
            )}
          </div>

          {/* Step 2: Encounter & Type Selection */}
          {selectedPatient && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
              <div className="space-y-2">
                <Label>2. Tipo de Constancia</Label>
                <Select value={documentTypeCode} onValueChange={(value) => value && setDocumentTypeCode(value)}>
                  <SelectTrigger>
                    <SelectValue>
                      {documentTypeCode === 'MEDICAL_CERTIFICATE' ? 'Constancia Médica' :
                        documentTypeCode === 'ILLNESS_CERTIFICATE' ? 'Constancia de Enfermedad' :
                          'Selecciona el tipo'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEDICAL_CERTIFICATE">Constancia Médica</SelectItem>
                    <SelectItem value="ILLNESS_CERTIFICATE">Constancia de Enfermedad</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>3. Seleccionar Consulta</Label>
                {isLoadingEncounters ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground p-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Cargando consultas...
                  </div>
                ) : encounters.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-3 border rounded-md bg-muted/50 text-center">
                    Este paciente no tiene consultas registradas.
                  </div>
                ) : (
                  <Select value={selectedEncounterId} onValueChange={(value) => value && setSelectedEncounterId(value)}>
                    <SelectTrigger>
                      <SelectValue>
                        {selectedEncounterId
                          ? (() => {
                            const enc = encounters.find(e => e.id.toString() === selectedEncounterId);
                            return enc
                              ? `${new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short" }).format(new Date(enc.createdAt))} - ${enc.encounterType?.name}`
                              : 'Selecciona una consulta reciente';
                          })()
                          : 'Selecciona una consulta reciente'
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {encounters.map((enc) => (
                        <SelectItem key={enc.id} value={enc.id.toString()}>
                          {new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short" }).format(new Date(enc.createdAt))} - {enc.encounterType?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Validation and Action */}
          {selectedEncounterId && selectedEncounter && (
            <div className="animate-in fade-in slide-in-from-top-4 mt-2">
              {existingDocument ? (
                <div className="p-4 border rounded-md bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 flex flex-col gap-3">
                  <div className="flex items-center gap-2 font-medium">
                    <AlertCircle className="w-5 h-5" />
                    Esta consulta ya tiene una constancia generada.
                  </div>
                  <p className="text-sm">
                    Ya existe un documento de tipo {documentTypeCode === 'MEDICAL_CERTIFICATE' ? 'Médica' : 'Enfermedad'} para esta fecha.
                  </p>
                  <div className="flex justify-end gap-2 mt-1">
                    <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                      Cancelar
                    </Button>
                    <Button nativeButton={false} size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" render={<a href={`/api/encounters/${existingDocument.encounterId}/documents/${existingDocument.documentType.code}`} target="_blank" rel="noreferrer" />}>
                      <FileText className="w-4 h-4 mr-2" />
                      Ver Constancia
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 border rounded-md bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex flex-col gap-3">
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-5 h-5" />
                    Todo listo para generar
                  </div>
                  <p className="text-sm">
                    {documentTypeCode === 'ILLNESS_CERTIFICATE'
                      ? 'Los días de reposo se tomarán de los datos clínicos registrados en la consulta.'
                      : 'Se generará la constancia de asistencia para esta consulta.'}
                  </p>
                  <form action={generateFormAction} className="flex justify-end mt-1">
                    <Button
                      type="submit"
                      disabled={isGenerating}
                      className="w-full sm:w-auto"
                    >
                      {isGenerating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Generar Constancia
                    </Button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
