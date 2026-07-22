"use client";

import { Dropdown, Label, Description, Avatar } from "@heroui/react";
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
    } catch (error) {
      toast.error("Error al cerrar sesión");
    }
  };

  const menuContent = (
    <Dropdown.Menu aria-label="Profile Actions">
      <Dropdown.Item key="profile" id="profile" className="h-14 gap-2 border-b border-default-100 pb-2 mb-2" textValue="Profile">
        <Label className="font-semibold">Conectado como</Label>
        <Description className="font-semibold">{user.email}</Description>
      </Dropdown.Item>
      
      <Dropdown.Item 
        key="appearance" 
        id="appearance"
        textValue="Appearance" 
        className="flex items-center py-2"
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Palette size={16} />
            <Label>Apariencia</Label>
          </div>
          <ThemeSwitcher />
        </div>
      </Dropdown.Item>

      <Dropdown.Item 
        key="sign_out" 
        id="sign_out"
        textValue="Sign out" 
        className="text-danger mt-2" 
        onPress={handleSignOut}
        onAction={handleSignOut}
      >
        <div className="flex items-center gap-2">
          <LogOut size={16} />
          <Label>Cerrar Sesión</Label>
        </div>
      </Dropdown.Item>
    </Dropdown.Menu>
  );

  if (isCollapsed) {
    return (
      <Dropdown>
        <Dropdown.Trigger>
          <div className="flex items-center justify-center w-full px-3 py-3 outline-none hover:bg-default-100 transition-colors cursor-pointer">
            <div className="relative shrink-0 flex">
              <Avatar className="bg-accent text-accent-foreground size-8">
                <Avatar.Fallback className="text-xs font-semibold uppercase">{user.name.substring(0, 2)}</Avatar.Fallback>
              </Avatar>
              <span className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full bg-success ring-2 ring-background shadow-[0_0_10px_#17c964]" />
            </div>
          </div>
        </Dropdown.Trigger>
        <Dropdown.Popover placement="right">
          {menuContent}
        </Dropdown.Popover>
      </Dropdown>
    );
  }

  return (
    <Dropdown>
      <Dropdown.Trigger>
        <div className="flex items-center gap-3 px-3 pt-4 cursor-pointer hover:bg-default-100 transition-colors rounded-b-md pb-2 outline-none w-full">
          <div className="relative shrink-0 flex">
            <Avatar className="bg-accent text-accent-foreground size-8">
              <Avatar.Fallback className="text-xs font-semibold uppercase">{user.name.substring(0, 2)}</Avatar.Fallback>
            </Avatar>
            <span className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full bg-success ring-2 ring-background shadow-[0_0_10px_#17c964]" />
          </div>
          <div className="flex flex-col flex-1 truncate text-left">
            <span className="text-sm font-medium text-foreground truncate">{user.name}</span>
            <span className="text-xs text-default-500 truncate capitalize">
              {user.role.toLowerCase() === 'admin' ? 'Admin' : user.role.toLowerCase()}
            </span>
          </div>
        </div>
      </Dropdown.Trigger>
      <Dropdown.Popover placement="bottom start">
        {menuContent}
      </Dropdown.Popover>
    </Dropdown>
  );
}
