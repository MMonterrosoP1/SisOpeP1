"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function CollapsibleSection({
  title,
  defaultExpanded = false,
  hasError = false,
  children,
}: {
  title: string;
  defaultExpanded?: boolean;
  hasError?: boolean;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded || hasError);

  // Auto-expand when errors appear (useEffect to avoid render side-effect)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (hasError) setExpanded(true);
  }, [hasError]);

  return (
    <Card className={`overflow-hidden ${hasError ? "ring-1 ring-destructive" : ""}`}>
      <div
        className="flex items-center justify-between p-6 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <CardTitle className={`text-lg ${hasError ? "text-destructive" : ""}`}>{title}</CardTitle>
        <Button variant="ghost" size="icon" type="button">
          {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </Button>
      </div>
      {expanded && <CardContent className="pt-0">{children}</CardContent>}
    </Card>
  );
}
