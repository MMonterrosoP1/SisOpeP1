import { Skeleton } from "@/components/ui/skeleton";

export default function EncountersLoading() {
  return (
    <div className="flex flex-col space-y-6 p-8 w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid gap-6 mt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col space-y-3 p-6 border rounded-xl shadow-sm">
            <div className="flex justify-between items-start">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <Skeleton className="h-4 w-1/4" />
            <div className="pt-4 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
