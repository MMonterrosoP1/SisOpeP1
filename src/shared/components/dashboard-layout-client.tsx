"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Button } from "@heroui/react";
import { Menu } from "lucide-react";

interface DashboardLayoutClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  children: React.ReactNode;
}

export function DashboardLayoutClient({ user, children }: DashboardLayoutClientProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-default-50 overflow-hidden">
      <Sidebar 
        user={user} 
        isMobileOpen={isMobileOpen} 
        onMobileClose={() => setIsMobileOpen(false)} 
      />
      
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between h-16 px-4 border-b border-default-200 bg-background">
          <img src="/premed-dark.png" alt="FM-PREMED Logo" className="h-10 w-auto object-contain" />
          <Button isIconOnly variant="ghost" onPress={() => setIsMobileOpen(true)}>
            <Menu size={24} />
          </Button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
