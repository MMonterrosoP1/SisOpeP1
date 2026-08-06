"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Button } from "@/components/ui/button";
import { LogoFull } from "@/shared/components/logo";
import { Menu } from "lucide-react";

interface DashboardLayoutClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  defaultCollapsed?: boolean;
  children: React.ReactNode;
}

export function DashboardLayoutClient({ user, defaultCollapsed = false, children }: DashboardLayoutClientProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-muted/50 overflow-hidden">
      <Sidebar
        user={user}
        defaultCollapsed={defaultCollapsed}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between h-16 px-4 border-b border-border bg-background/80 backdrop-blur-md">
          <LogoFull className="h-10 w-auto" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileOpen(true)}
          >
            <Menu size={24} />
          </Button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
