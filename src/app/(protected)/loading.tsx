import { Loader2 } from "lucide-react";

export default function ProtectedLoading() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-muted-foreground">
      <Loader2 className="w-8 h-8 animate-spin mb-4" />
      <p>Cargando aplicación...</p>
    </div>
  );
}
