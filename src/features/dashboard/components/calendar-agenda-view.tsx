"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { PendingFollowUp } from "../types";
import { useState } from "react";
import { format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface CalendarAgendaViewProps {
  followUps: PendingFollowUp[];
}

export function CalendarAgendaView({ followUps }: CalendarAgendaViewProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Helper to ensure the UTC date from DB is treated as the same local date (avoids offset bugs)
  const getLocalDate = (d: Date | string) => {
    const dateObj = new Date(d);
    return new Date(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate());
  };

  const selectedFollowUps = followUps.filter((f) =>
    date && isSameDay(getLocalDate(f.followUpDate), date)
  );

  return (
    <Card className="flex flex-col h-full border-0 shadow-none sm:border sm:shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle>Seguimientos pendientes</CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:px-6 sm:pb-6 flex flex-col gap-6">
        <div className="flex justify-center border-b pb-4 sm:border-0 sm:pb-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            locale={es}
            className="rounded-md w-full max-w-[300px]"
            modifiers={{
              hasFollowUp: followUps.map(f => getLocalDate(f.followUpDate))
            }}
            modifiersClassNames={{
              hasFollowUp: "relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-orange-500 after:rounded-full"
            }}
          />
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <h4 className="font-semibold text-sm border-b pb-2">
            Seguimientos para el {date ? format(date, "d 'de' MMMM, yyyy", { locale: es }) : "..."}
          </h4>

          <div className="flex-1 space-y-4 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
            {selectedFollowUps.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No hay seguimientos programados para este día.
              </p>
            ) : (
              selectedFollowUps.map((followUp) => {
                const initials = followUp.patientName
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase();

                return (
                  <div key={followUp.id} className="flex flex-row items-center gap-4">
                    <Avatar className="size-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <Link
                          prefetch={false}
                          href={`/patients/${followUp.patientId}`}
                          className="font-medium text-sm hover:underline truncate"
                        >
                          {followUp.encounterTypeName}
                        </Link>
                        <Badge variant="outline" className="text-[10px] text-green-600 border-green-200 bg-green-50">
                          Active
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground truncate">
                        {followUp.patientName}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
