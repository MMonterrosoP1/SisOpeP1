import { Skeleton } from "@/components/ui/skeleton";

export default function PatientsLoading() {
  return (
    <div className="flex flex-col space-y-6 p-8 w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-[300px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
        
        <div className="rounded-md border">
          <div className="h-12 border-b bg-muted/50 px-4 flex items-center gap-4">
             <Skeleton className="h-4 w-24" />
             <Skeleton className="h-4 w-32" />
             <Skeleton className="h-4 w-40" />
          </div>
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4 w-full">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-between px-2">
          <Skeleton className="h-4 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </div>
    </div>
  );
}
