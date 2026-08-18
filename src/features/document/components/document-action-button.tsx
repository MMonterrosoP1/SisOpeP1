"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { generateDocumentAction } from "../actions";
import { FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DocumentTemplateType } from "../types";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface DocumentActionButtonProps {
  encounterId: number;
  documentTypeCode: DocumentTemplateType;
  label?: string;
  initialPdfUrl?: string | null;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

export function DocumentActionButton({
  encounterId,
  documentTypeCode,
  label = "Documento",
  initialPdfUrl,
  className,
  variant = "outline",
  size = "sm",
}: DocumentActionButtonProps) {
  const router = useRouter();
  const [hasDocument, setHasDocument] = useState<boolean>(!!initialPdfUrl);
  const [isGenerating, setIsGenerating] = useState(false);

  const proxyUrl = `/api/encounters/${encounterId}/documents/${documentTypeCode}`;

  const handleAction = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (hasDocument) {
      window.open(proxyUrl, "_blank");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await generateDocumentAction({ encounterId, documentTypeCode });
      
      if (response.success && response.data?.pdfUrl) {
        setHasDocument(true);
        toast.success(`${label} generado exitosamente`);
        router.refresh();
        window.open(proxyUrl, "_blank");
      } else if (!response.success) {
        toast.error(response.error || `Error al generar ${label}`);
      } else {
        toast.error("No se obtuvo respuesta válida");
      }
    } catch (error) {
      toast.error(`Ocurrió un error inesperado al generar ${label}`);
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleAction}
      disabled={isGenerating}
      title={hasDocument ? `Ver ${label}` : `Generar ${label}`}
    >
      {isGenerating ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <FileText className={`w-4 h-4 ${size !== 'icon' ? 'mr-2' : ''} ${hasDocument ? 'text-primary' : ''}`} />
      )}
      {size !== 'icon' && (hasDocument ? `Ver ${label}` : label)}
    </Button>
  );
}

export function DocumentActionMenuItem({
  encounterId,
  documentTypeCode,
  label = "Documento",
  initialPdfUrl,
  className,
}: Omit<DocumentActionButtonProps, 'variant' | 'size'>) {
  const router = useRouter();
  const [hasDocument, setHasDocument] = useState<boolean>(!!initialPdfUrl);
  const [isGenerating, setIsGenerating] = useState(false);

  const proxyUrl = `/api/encounters/${encounterId}/documents/${documentTypeCode}`;

  const handleAction = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasDocument) {
      window.open(proxyUrl, "_blank");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await generateDocumentAction({ encounterId, documentTypeCode });
      
      if (response.success && response.data?.pdfUrl) {
        setHasDocument(true);
        toast.success(`${label} generado exitosamente`);
        router.refresh();
        window.open(proxyUrl, "_blank");
      } else if (!response.success) {
        toast.error(response.error || `Error al generar ${label}`);
      } else {
        toast.error("No se obtuvo respuesta válida");
      }
    } catch (error) {
      toast.error(`Ocurrió un error inesperado al generar ${label}`);
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DropdownMenuItem
      className={className}
      onClick={handleAction}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <FileText className={`w-4 h-4 mr-2 ${hasDocument ? 'text-primary' : 'text-muted-foreground'}`} />
      )}
      <span>{hasDocument ? `Ver ${label}` : `Generar ${label}`}</span>
    </DropdownMenuItem>
  );
}
