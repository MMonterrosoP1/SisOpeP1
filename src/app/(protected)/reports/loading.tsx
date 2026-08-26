import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ReportsLoading() {
  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 bg-muted/20 min-h-[calc(100vh-theme(spacing.16))]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
        <div className="flex gap-2 w-full md:w-auto">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="flex flex-col h-[120px]">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-1/3 mb-2" />
              <Skeleton className="h-3 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-48" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[350px] w-full rounded-xl" />
          <Skeleton className="h-[350px] w-full rounded-xl" />
          <Skeleton className="h-[350px] w-full rounded-xl" />
          <Skeleton className="h-[350px] w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
