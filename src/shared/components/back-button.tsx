"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function BackButton({ className, variant = "outline", size = "icon" }: BackButtonProps) {
  const router = useRouter();

  return (
    <Button 
      type="button"
      variant={variant} 
      size={size} 
      className={className} 
      onClick={() => router.back()}
    >
      <ArrowLeft className="w-4 h-4" />
    </Button>
  );
}
