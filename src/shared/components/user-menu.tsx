"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Palette } from "lucide-react";
import { ThemeSwitcher } from "./theme-switcher";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

interface UserMenuProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  isCollapsed?: boolean;
}

export function UserMenu({ user, isCollapsed }: UserMenuProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      router.push("/sign-in");
      router.refresh();
    } catch {
      toast.error("Error al cerrar sesión");
    }
  };

  if (isCollapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger>
          <button className="flex items-center justify-center w-full px-3 py-3 outline-none hover:bg-muted transition-colors cursor-pointer rounded-md">
            <div className="relative shrink-0 flex">
              <Avatar className="h-8 w-8 bg-accent text-accent-foreground">
                <AvatarFallback className="text-xs font-semibold uppercase bg-accent text-accent-foreground">
                  {user.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background shadow-[0_0_10px_#10b981]" />
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="p-2">
            <p className="text-xs font-medium text-muted-foreground">Conectado como</p>
            <p className="text-sm font-semibold truncate">{user.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2">
              <Palette size={16} />
              <span>Apariencia</span>
            </div>
            <ThemeSwitcher />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleSignOut}
            className="text-destructive focus:text-destructive cursor-pointer"
          >
            <LogOut size={16} />
            <span>Cerrar Sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button className="flex items-center gap-3 px-3 pt-4 cursor-pointer hover:bg-muted transition-colors rounded-b-md pb-2 outline-none w-full">
          <div className="relative shrink-0 flex">
            <Avatar className="h-8 w-8 bg-accent text-accent-foreground">
              <AvatarFallback className="text-xs font-semibold uppercase bg-accent text-accent-foreground">
                {user.name.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background shadow-[0_0_10px_#10b981]" />
          </div>
          <div className="flex flex-col flex-1 truncate text-left">
            <span className="text-sm font-medium text-foreground truncate">
              {user.name}
            </span>
            <span className="text-xs text-muted-foreground truncate capitalize">
              {user.role.toLowerCase() === "admin" ? "Admin" : user.role.toLowerCase()}
            </span>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="p-2">
          <p className="text-xs font-medium text-muted-foreground">Conectado como</p>
          <p className="text-sm font-semibold truncate">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-2">
            <Palette size={16} />
            <span>Apariencia</span>
          </div>
          <ThemeSwitcher />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut size={16} />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
