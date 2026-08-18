import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function PatientHistorySummary({ history, action }: { history: any; action?: React.ReactNode }) {
  if (!history) return null;

  const hasData =
    history.medicalHistory?.length > 0 ||
    history.surgicalHistory?.length > 0 ||
    history.traumaHistory?.length > 0 ||
    history.familyHistory?.length > 0 ||
    history.allergies?.length > 0 ||
    history.habits?.length > 0 ||
    history.exercises?.length > 0;

  if (!hasData) {
    return (
      <Card>
        <CardHeader className="flex flex-row justify-between items-start space-y-0">
          <CardTitle>Antecedentes Clínicos del Paciente</CardTitle>
          {action}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No hay antecedentes registrados para este paciente.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-start space-y-0">
        <CardTitle>Antecedentes Clínicos del Paciente</CardTitle>
        {action}
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.allergies?.length > 0 && (
          <div>
            <h4 className="font-semibold text-xs text-muted-foreground uppercase mb-1">Alergias</h4>
            <ul className="text-sm list-disc pl-4">
              {history.allergies.map((a: any, i: number) => (
                <li key={i}>{a.allergenCatalog?.name} {a.detail && <span className="text-muted-foreground">({a.detail})</span>}</li>
              ))}
            </ul>
          </div>
        )}

        {history.medicalHistory?.length > 0 && (
          <div>
            <h4 className="font-semibold text-xs text-muted-foreground uppercase mb-1">Médicos</h4>
            <ul className="text-sm list-disc pl-4">
              {history.medicalHistory.map((m: any, i: number) => (
                <li key={i}>{m.icd10Code?.description || m.icd10Code?.code} {m.observations && <span className="text-muted-foreground">({m.observations})</span>}</li>
              ))}
            </ul>
          </div>
        )}

        {history.surgicalHistory?.length > 0 && (
          <div>
            <h4 className="font-semibold text-xs text-muted-foreground uppercase mb-1">Quirúrgicos</h4>
            <ul className="text-sm list-disc pl-4">
              {history.surgicalHistory.map((s: any, i: number) => (
                <li key={i}>{s.surgicalProcedure?.name} {s.observations && <span className="text-muted-foreground">({s.observations})</span>}</li>
              ))}
            </ul>
          </div>
        )}

        {history.traumaHistory?.length > 0 && (
          <div>
            <h4 className="font-semibold text-xs text-muted-foreground uppercase mb-1">Traumáticos</h4>
            <ul className="text-sm list-disc pl-4">
              {history.traumaHistory.map((t: any, i: number) => (
                <li key={i}>{t.icd10Code?.description || t.icd10Code?.code} {t.observations && <span className="text-muted-foreground">({t.observations})</span>}</li>
              ))}
            </ul>
          </div>
        )}

        {history.familyHistory?.length > 0 && (
          <div>
            <h4 className="font-semibold text-xs text-muted-foreground uppercase mb-1">Familiares</h4>
            <ul className="text-sm list-disc pl-4">
              {history.familyHistory.map((f: any, i: number) => (
                <li key={i}>{f.icd10Code?.description || f.icd10Code?.code} {f.observations && <span className="text-muted-foreground">({f.observations})</span>}</li>
              ))}
            </ul>
          </div>
        )}

        {history.habits?.length > 0 && (
          <div>
            <h4 className="font-semibold text-xs text-muted-foreground uppercase mb-1">Hábitos</h4>
            <ul className="text-sm list-disc pl-4">
              {history.habits.map((h: any, i: number) => (
                <li key={i}>
                  {h.habitCatalog?.name}
                  {h.quantity && ` - Cantidad: ${h.quantity}`}
                  {h.frequency && ` (${{ DAILY: 'Diario', WEEKLY: 'Semanal', MONTHLY: 'Mensual', OCCASIONAL: 'Ocasional' }[h.frequency as string] || h.frequency})`}
                  {h.duration && ` - Duración: ${h.duration}`}
                </li>
              ))}
            </ul>
          </div>
        )}

        {history.exercises?.length > 0 && (
          <div>
            <h4 className="font-semibold text-xs text-muted-foreground uppercase mb-1">Ejercicio</h4>
            <ul className="text-sm list-disc pl-4">
              {history.exercises.map((e: any, i: number) => (
                <li key={i}>
                  {e.exerciseCatalog?.name}
                  {e.timesPerWeek && ` - ${e.timesPerWeek} veces por semana`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
