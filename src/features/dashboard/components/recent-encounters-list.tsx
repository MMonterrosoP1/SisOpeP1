"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Activity } from "lucide-react";
import { RecentEncounterItem } from "../types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";

interface RecentEncountersListProps {
  encounters: RecentEncounterItem[];
}

export function RecentEncountersList({ encounters }: RecentEncountersListProps) {
  return (
    <Card className="flex flex-col h-full border-0 shadow-none sm:border sm:shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle>Consultas Recientes</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 p-0 sm:px-6 sm:pb-6">
        {encounters.length === 0 ? (
          <div className="flex-1 flex items-center justify-center border-2 border-dashed rounded-md p-6">
            <p className="text-sm text-muted-foreground">No hay consultas registradas</p>
          </div>
        ) : (
          <div className="flex-1 space-y-4 overflow-y-auto pr-2 max-h-[380px] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
            {encounters.map((encounter) => (
              <div key={encounter.id} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between py-2 border-b last:border-0 group">
                <div className="flex flex-col">
                  <Link 
                    href={`/patients/${encounter.patientId}/encounters/${encounter.id}`}
                    target="_blank"
                    className="font-medium text-sm hover:underline"
                  >
                    {encounter.patientName}
                  </Link>
                  <span className="text-xs flex items-center gap-1.5 text-muted-foreground mt-1">
                    <Activity className="h-3 w-3" />
                    {encounter.encounterTypeName}
                  </span>
                </div>
                
                <div className="flex flex-col items-end gap-1 shrink-0 mt-2 sm:mt-0">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(encounter.date), "dd MMM yyyy, HH:mm", { locale: es })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
