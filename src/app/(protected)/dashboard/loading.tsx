import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 bg-muted/20 min-h-[calc(100vh-theme(spacing.16))]">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      {/* Top Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="size-10 rounded-full" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        ))}
      </div>

      {/* Middle Row: Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="col-span-1 lg:col-span-2 rounded-xl border bg-card shadow-sm h-[400px] p-6 flex flex-col gap-4">
           <Skeleton className="h-6 w-48" />
           <Skeleton className="h-4 w-64" />
           <Skeleton className="h-full w-full mt-4" />
        </div>
        <div className="col-span-1 rounded-xl border bg-card shadow-sm h-[400px] p-6 flex flex-col gap-4">
           <Skeleton className="h-6 w-48" />
           <Skeleton className="h-4 w-64" />
           <div className="flex-1 flex items-center justify-center">
             <Skeleton className="size-48 rounded-full" />
           </div>
        </div>
      </div>

      {/* Bottom Row: Calendar, Notes, Top Diagnoses */}
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="col-span-1 rounded-xl border sm:shadow-sm h-[450px] p-6 flex flex-col gap-4 bg-card">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-full w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
