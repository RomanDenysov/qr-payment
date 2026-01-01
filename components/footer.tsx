"use client";

import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="mt-auto pt-8">
      <Separator className="mb-3" />
      <div className="flex flex-wrap items-center justify-center gap-2 pb-4 text-muted-foreground text-xs">
        <span>&copy; 2025</span>
        <span>•</span>
        <p>Vyrobené s 🖤 na Slovensku</p>
        <span>•</span>
        <a
          className="underline underline-offset-4 hover:text-foreground"
          href="https://buymeacoffee.com/romandenysov"
          rel="noopener noreferrer"
          target="_blank"
        >
          Buy me a coffee
        </a>
        <span>•</span>
        <a
          className="underline underline-offset-4 hover:text-foreground"
          href="https://github.com/RomanDenysov"
          rel="noopener noreferrer"
          target="_blank"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}
