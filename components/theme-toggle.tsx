"use client";

import { IconMoon, IconSun } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useCallback } from "react";
import { Button } from "./ui/button";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const t = useTranslations("Nav");

  const handleThemeToggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  return (
    <Button
      aria-label={t("toggleTheme")}
      id="theme-toggle"
      onClick={handleThemeToggle}
      size="icon-sm"
      variant="ghost"
    >
      <IconMoon className="size-4 opacity-100 transition-[opacity,transform] duration-300 dark:pointer-events-none dark:hidden dark:opacity-0" />
      <IconSun className="pointer-events-auto hidden size-4 opacity-0 transition-[opacity,transform] duration-300 dark:block dark:opacity-100" />
    </Button>
  );
}
