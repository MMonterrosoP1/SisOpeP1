import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TopDiagnosis } from "../../types";
import { Badge } from "@/components/ui/badge";

interface TopDiagnosesTableProps {
  data: TopDiagnosis[];
  title?: string;
  description?: string;
  showSuspensions?: boolean;
}

export function TopDiagnosesTable({ 
  data, 
  title = "Top 10 Diagnósticos", 
  description = "Diagnósticos más frecuentes en el período",
  showSuspensions = false
}: TopDiagnosesTableProps) {
  
  return (
    <Card className="col-span-1 border-0 shadow-none sm:border sm:shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-muted-foreground text-sm">
            No hay registros de diagnósticos
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] text-center">#</TableHead>
                  <TableHead className="w-[80px]">CIE-10</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Casos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, i) => (
                  <TableRow key={item.icd10Code}>
                    <TableCell className="text-center font-medium">{item.rank}</TableCell>
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
