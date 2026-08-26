import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DiseasePrevalence } from "../../types";

interface DiseasePrevalenceListProps {
  title: string;
  description: string;
  data: DiseasePrevalence[];
  colorClass?: string;
  maxItems?: number;
}

export function DiseasePrevalenceList({ 
  title, 
  description, 
  data, 
  colorClass = "bg-primary",
  maxItems = 5
}: DiseasePrevalenceListProps) {
  
  const displayData = data.slice(0, maxItems);
  const maxCount = Math.max(...displayData.map(d => d.count), 1);

  return (
    <Card className="col-span-1 border shadow-sm flex flex-col h-full">
      <CardHeader className="pb-4">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {displayData.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-muted-foreground text-sm">
            No hay diagnósticos registrados
          </div>
        ) : (
          <div className="space-y-4">
            {displayData.map((item, index) => {
              const percentage = Math.round((item.count / maxCount) * 100);
              return (
                <div key={`${item.icd10Code}-${index}`} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium truncate pr-4" title={item.description}>
                      {item.description}
                    </span>
                    <span className="font-bold text-muted-foreground tabular-nums">{item.count}</span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`absolute inset-y-0 left-0 ${colorClass} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
