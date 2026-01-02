"use client";

import { IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { useCallback } from "react";
import { Button } from "./ui/button";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  const handleThemeToggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  return (
    <Button
      id="theme-toggle"
      onClick={handleThemeToggle}
      size="icon-sm"
      title="Switch theme"
      variant="ghost"
    >
      <IconMoon className="fade-in size-4 animate-in opacity-100 transition-[opacity,transform] duration-300 dark:pointer-events-none dark:hidden dark:opacity-0" />
      <IconSun className="fade-in pointer-events-auto hidden size-4 animate-in opacity-0 transition-[opacity,transform] duration-300 dark:block dark:opacity-100" />
    </Button>
  );
}
