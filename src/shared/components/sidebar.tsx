"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LogoIcon, LogoFull } from "@/shared/components/logo";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  FileText,
  BookOpen,
  Shield,
  UserCog,
  PanelLeftClose,
  PanelLeft
} from "lucide-react";
import { UserMenu } from "./user-menu";
import { UserRole } from "@/shared/schemas/enums";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
  isNew?: boolean;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "DOCTOR", "VIEWER"] },
  { name: "Pacientes", href: "/patients", icon: Users, roles: ["ADMIN", "DOCTOR"] },
  { name: "Consultas", href: "/encounters", icon: Stethoscope, roles: ["ADMIN", "DOCTOR"] },
  { name: "Constancias", href: "/dashboard/certificates", icon: FileText, roles: ["ADMIN", "DOCTOR"] },
  { name: "Catálogos", href: "/dashboard/catalogs", icon: BookOpen, roles: ["ADMIN"] },
  { name: "Auditoría", href: "/dashboard/audit", icon: Shield, roles: ["ADMIN"] },
  { name: "Usuarios", href: "/dashboard/users", icon: UserCog, roles: ["ADMIN"] },
];

interface SidebarProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ user, isMobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const filteredItems = navItems.filter((item) =>
    item.roles.includes(user.role as UserRole)
  );

  const renderNavItems = (collapsed: boolean, isMobile: boolean = false) => (
    <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar px-2">
      {!collapsed && (
        <div className="px-3 pt-5 pb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Menú Principal</span>
        </div>
      )}

      {filteredItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        const content = (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => onMobileClose()}
            className={`flex items-center gap-3 px-3 mx-1 rounded-xl cursor-pointer transition-all duration-200 ${
              isMobile ? "py-3.5" : "py-2.5"
            } ${
              isActive 
                ? "bg-primary/10 text-primary font-medium" 
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            } ${collapsed ? "justify-center" : ""}`}
          >
            <item.icon
              className={`shrink-0 ${isMobile ? "w-5 h-5" : "w-4 h-4"} stroke-[1.5] ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            />

            {!collapsed && (
              <span
                className={`${isMobile ? "text-base" : "text-sm"} ${
                  isActive ? "font-semibold text-primary" : "font-medium"
                }`}
              >
                {item.name}
              </span>
            )}

            {!collapsed && item.isNew && (
              <span className="ml-auto text-[10px] uppercase tracking-wider font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                New
              </span>
            )}
          </Link>
        );

        if (collapsed) {
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger>
                {content}
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{item.name}</p>
              </TooltipContent>
            </Tooltip>
          );
        }

        return content;
      })}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col h-screen bg-background border-r border-border py-4 px-2 transition-all duration-300 ${
          isCollapsed ? "w-[80px]" : "w-64"
        }`}
      >
        {/* Logo Area */}
        <div className="px-3 pb-3 flex items-center justify-center">
          {isCollapsed ? (
            <LogoIcon
              key="logo-collapsed"
              className="w-10 h-10 object-contain"
            />
          ) : (
            <LogoFull
              key="logo-expanded"
              className="h-13 w-auto object-contain mt-4"
            />
          )}
        </div>

        {/* Main Content */}
        {renderNavItems(isCollapsed, false)}

        {/* Footer */}
        <div className="mt-auto flex flex-col gap-4">
          <div className={`px-3 ${isCollapsed ? "flex justify-center" : ""}`}>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex items-center justify-center p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"
            >
              {isCollapsed ? (
                <PanelLeft className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="border-t border-border">
            <UserMenu user={user} isCollapsed={isCollapsed} />
          </div>
        </div>
      </aside>

      {/* Mobile Sheet */}
      <Sheet open={isMobileOpen} onOpenChange={(open) => !open && onMobileClose()}>
        <SheetContent side="left" className="w-[280px] p-0 bg-background/95 backdrop-blur-xl border-r-border shadow-2xl">
          <div className="flex flex-col h-full py-4">
            {/* Logo Area */}
            <div className="px-3 pb-6 pt-4 flex items-center justify-center">
              <LogoFull
                className="h-10 w-auto object-contain"
              />
            </div>

            {/* Main Content */}
            <div className="flex-1 mt-2">
              {renderNavItems(false, true)}
            </div>

            {/* Footer */}
            <div className="mt-auto flex flex-col gap-4">
              <div className="border-t border-border">
                <UserMenu user={user} isCollapsed={false} />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
