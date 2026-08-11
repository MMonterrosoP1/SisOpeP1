"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function useSavedFilters(cookieName: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Solo restaurar si no hay filtros activos en la URL
    const filterKeys = Array.from(searchParams.keys()).filter((k) => k !== "page");
    if (filterKeys.length > 0) return;

    // Buscar la cookie
    const cookies = document.cookie.split("; ");
    const savedCookie = cookies.find((row) => row.startsWith(`${cookieName}=`));
    
    if (savedCookie) {
      const savedParamsString = savedCookie.split("=")[1];
      if (savedParamsString) {
        const savedParams = new URLSearchParams(savedParamsString);
        
        // Verificar si la cookie realmente tiene filtros útiles
        const hasRealFilters = Array.from(savedParams.keys()).some((k) => k !== "page");
        
        if (hasRealFilters) {
          // Mantener la página actual de la URL si existe, si no, dejar la de la cookie
          const currentPage = searchParams.get("page");
          if (currentPage) {
            savedParams.set("page", currentPage);
          }
          
          const targetQuery = savedParams.toString();
          const currentQuery = searchParams.toString();
          
          if (targetQuery !== currentQuery) {
            router.replace(`${pathname}?${targetQuery}`);
          }
        }
      }
    }
  }, [cookieName, pathname, router, searchParams]);
}
