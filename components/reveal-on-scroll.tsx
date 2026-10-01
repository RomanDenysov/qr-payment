"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
}

/**
 * Ordered list that fades its items in, once, when it scrolls into view.
 * Stagger comes from a `transitionDelay` on each child. Children are hidden
 * only after mount and only if the container is still below the viewport, so
 * the content stays visible without JavaScript and never flashes.
 */
export function RevealOnScroll({ children, className }: RevealOnScrollProps) {
  const ref = useRef<HTMLOListElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || element.getBoundingClientRect().top < window.innerHeight) {
      return;
    }
    setHidden(true);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setHidden(false);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <ol
      className={cn(
        "*:transition-[opacity,transform] *:duration-300 *:ease-out-cubic data-[hidden=true]:*:translate-y-2 data-[hidden=true]:*:opacity-0",
        className
      )}
      data-hidden={hidden}
      ref={ref}
    >
      {children}
    </ol>
  );
}
