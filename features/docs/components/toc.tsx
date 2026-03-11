"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  label: string;
}

const TOC_ITEMS: TocItem[] = [
  { id: "quick-start", label: "Quick Start" },
  { id: "base-url", label: "Base URL" },
  { id: "endpoints", label: "Endpoints" },
  { id: "parameters", label: "Parameters" },
  { id: "response", label: "Response" },
  { id: "errors", label: "Errors" },
  { id: "rate-limiting", label: "Rate Limiting" },
  { id: "examples", label: "Code Examples" },
  { id: "try-it", label: "Try It Out" },
];

export function Toc() {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    const missingIds: string[] = [];
    for (const item of TOC_ITEMS) {
      const el = document.getElementById(item.id);
      if (el) {
        observer.observe(el);
      } else {
        missingIds.push(item.id);
      }
    }

    if (missingIds.length > 0 && process.env.NODE_ENV === "development") {
      console.warn("[Toc] Missing section IDs:", missingIds);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Mobile: horizontal scroll */}
      <nav className="flex gap-2 overflow-x-auto pb-2 lg:hidden">
        {TOC_ITEMS.map((item) => (
          <a
            className={cn(
              "shrink-0 px-2 py-1 text-xs transition-colors",
              activeId === item.id
                ? "bg-foreground/5 text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            href={`#${item.id}`}
            key={item.id}
          >
            {item.label}
          </a>
        ))}
      </nav>

      {/* Desktop: sticky sidebar */}
      <nav className="sticky top-20 hidden self-start lg:block">
        <ul className="space-y-1 border-foreground/10 border-l">
          {TOC_ITEMS.map((item) => (
            <li key={item.id}>
              <a
                className={cn(
                  "-ml-px block border-l-2 py-1 pl-3 text-xs transition-colors",
                  activeId === item.id
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
                href={`#${item.id}`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
