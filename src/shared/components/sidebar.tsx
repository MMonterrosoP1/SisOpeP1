"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Building2,
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
  { name: "Consultas", href: "/dashboard/encounters", icon: Stethoscope, roles: ["ADMIN", "DOCTOR"], isNew: true },
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

  const renderNavItems = (collapsed: boolean) => (
    <div className="flex-1 overflow-y-auto space-y-1 no-scrollbar">
      {!collapsed && (
        <div className="px-3 pt-5 pb-2">
          <span className="text-xs font-normal text-muted-foreground">Menú Principal</span>
        </div>
      )}

      {filteredItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        const content = (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => onMobileClose()}
            className={`flex items-center gap-3 px-3 py-2 mx-2 rounded-md cursor-pointer transition-colors ${
              isActive ? "bg-muted" : "hover:bg-muted"
            } ${collapsed ? "justify-center" : ""}`}
          >
            <item.icon
              className={`w-4 h-4 stroke-[1.5] shrink-0 ${
                isActive ? "text-foreground" : "text-muted-foreground"
              }`}
            />

            {!collapsed && (
              <span
                className={`text-sm font-medium ${
                  isActive ? "text-foreground" : "text-foreground/70"
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
            <img
              key="logo-collapsed"
              src="/premed-dark-logo.png"
              alt="Logo"
              className="w-10 h-10 object-contain"
            />
          ) : (
            <img
              key="logo-expanded"
              src="/premed-dark.png"
              alt="FM-PREMED Logo"
              className="h-13 w-auto object-contain mt-4"
            />
          )}
        </div>

        {/* Main Content */}
        {renderNavItems(isCollapsed)}

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
        <SheetContent side="left" className="w-64 p-0 bg-background">
          <div className="flex flex-col h-full py-4 px-2">
            {/* Logo Area */}
            <div className="px-3 pb-6 pt-4 flex items-center justify-center">
              <img
                src="/premed-dark.png"
                alt="FM-PREMED Logo"
                className="h-10 w-auto object-contain"
              />
            </div>

            {/* Main Content */}
            {renderNavItems(false)}

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
