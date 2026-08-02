"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex items-center gap-1 bg-default-100 p-1 rounded-full border border-default-200">
      <button 
        onClick={() => setTheme('light')}
        className={`p-1.5 rounded-full transition-colors ${theme === 'light' ? 'bg-background shadow-sm text-foreground' : 'text-default-500 hover:text-foreground'}`}
        aria-label="Light mode"
      >
        <Sun size={14} strokeWidth={2} />
      </button>
      <button 
        onClick={() => setTheme('system')}
        className={`p-1.5 rounded-full transition-colors ${theme === 'system' ? 'bg-background shadow-sm text-foreground' : 'text-default-500 hover:text-foreground'}`}
        aria-label="System mode"
      >
        <Monitor size={14} strokeWidth={2} />
      </button>
      <button 
        onClick={() => setTheme('dark')}
        className={`p-1.5 rounded-full transition-colors ${theme === 'dark' ? 'bg-background shadow-sm text-foreground' : 'text-default-500 hover:text-foreground'}`}
        aria-label="Dark mode"
      >
        <Moon size={14} strokeWidth={2} />
      </button>
    </div>
  );
}
