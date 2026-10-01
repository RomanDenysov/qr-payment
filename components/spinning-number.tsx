"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Full turns of the 0-9 reel before a digit lands.
const SPINS = 2;
const REEL = Array.from({ length: (SPINS + 1) * 10 }, (_, i) => i % 10);
const STAGGER_MS = 90;
const DIGIT_RE = /\d/;

interface SpinningNumberProps {
  className?: string;
  /** Already formatted for the locale, e.g. "6 021". */
  value: string;
}

/**
 * Number whose digits spin like slot reels and land left to right, once, when
 * it first scrolls into view. Each digit is a clipped column of 0-9 cells one line
 * high; the column slides up to its digit. Separators stay put. With reduced
 * motion the digits are simply shown.
 */
export function SpinningNumber({ className, value }: SpinningNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [landed, setLanded] = useState(false);

  // Spin when the number scrolls into view, so it is not wasted below the
  // fold. The observer fires after the first paint, which the transition needs.
  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setLanded(true);
        observer.disconnect();
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  let column = 0;

  return (
    <span className={cn("inline-flex leading-none", className)} ref={ref}>
      <span className="sr-only">{value}</span>
      {[...value].map((char, index) => {
        // Position is the identity here: the string never reorders.
        const key = `${index}-${char}`;
        if (!DIGIT_RE.test(char)) {
          return (
            <span
              aria-hidden
              className="flex h-[1.2em] items-center whitespace-pre"
              key={key}
            >
              {char}
            </span>
          );
        }
        const offset = landed ? SPINS * 10 + Number(char) : 0;
        const delay = column * STAGGER_MS;
        column += 1;
        return (
          <span
            aria-hidden
            className="h-[1.2em] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,#000_15%,#000_85%,transparent)]"
            key={key}
          >
            <span
              className="flex flex-col transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform motion-reduce:transition-none"
              style={{
                transform: `translateY(-${offset * 1.2}em)`,
                transitionDelay: `${delay}ms`,
              }}
            >
              {REEL.map((digit, cell) => (
                <span
                  className="flex h-[1.2em] items-center justify-center"
                  // biome-ignore lint/suspicious/noArrayIndexKey: static reel, cells never reorder
                  key={cell}
                >
                  {digit}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}
