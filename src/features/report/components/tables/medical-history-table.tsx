import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MedicalHistorySummary } from "../../types";
import { Badge } from "@/components/ui/badge";

interface MedicalHistoryTableProps {
  data: MedicalHistorySummary[];
}

export function MedicalHistoryTable({ data }: MedicalHistoryTableProps) {
  // Solo los top 15 para no hacer la tabla enorme
  const displayData = data.slice(0, 15);

  return (
    <Card className="col-span-1 border-0 shadow-none sm:border sm:shadow-sm">
      <CardHeader>
        <CardTitle>Antecedentes Médicos</CardTitle>
        <CardDescription>Antecedentes más comunes registrados en pacientes (Top 15)</CardDescription>
      </CardHeader>
      <CardContent>
        {displayData.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-muted-foreground text-sm">
            No hay antecedentes registrados
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">CIE-10</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Pacientes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData.map((item, i) => (
                  <TableRow key={`${item.icd10Code}-${i}`}>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">{item.icd10Code}</Badge>
                    </TableCell>
                    <TableCell className="font-medium text-sm">{item.description}</TableCell>
                    <TableCell className="text-right font-bold">{item.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
