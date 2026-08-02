"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center space-y-4">
      <div className="bg-destructive/10 p-4 rounded-full">
        <AlertTriangle className="w-12 h-12 text-destructive" />
      </div>
      <div className="space-y-2 max-w-md">
        <h2 className="text-2xl font-bold tracking-tight">Ocurrió un error inesperado</h2>
        <p className="text-muted-foreground text-sm">
          {error.message || "Lo sentimos, hemos encontrado un problema al procesar tu solicitud."}
        </p>
      </div>
      <div className="pt-4 flex gap-4">
        <Button onClick={() => reset()} variant="default">
          Intentar de nuevo
        </Button>
        <Button onClick={() => window.location.href = '/'} variant="outline">
          Volver al inicio
        </Button>
      </div>
    </div>
  );
}
