import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReferralSummary } from "../../types";

interface ReferralsTableProps {
  data: ReferralSummary[];
}

export function ReferralsTable({ data }: ReferralsTableProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="col-span-1 border-0 shadow-none sm:border sm:shadow-sm">
      <CardHeader>
        <CardTitle>Referidos al IGSS</CardTitle>
        <CardDescription>Pacientes referidos por nivel de atención</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-muted-foreground text-sm">
            No hay pacientes referidos al IGSS
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-2xl font-bold flex items-center gap-2">
              {total} <span className="text-sm font-normal text-muted-foreground">pacientes referidos en total</span>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nivel de Atención (IGSS)</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => (
                    <TableRow key={item.referralLevelName}>
                      <TableCell className="font-medium">{item.referralLevelName}</TableCell>
                      <TableCell className="text-right font-bold">{item.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
