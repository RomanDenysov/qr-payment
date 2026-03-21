"use client";

import { useEffect, useRef, useState } from "react";

const SIZE = 16;
const TICK_MS = 150;
const ALIVE_RATIO = 0.35;

function createGrid(): boolean[][] {
  return Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => Math.random() < ALIVE_RATIO)
  );
}

function countNeighbors(grid: boolean[][], row: number, col: number): number {
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) {
        continue;
      }
      const r = (row + dr + SIZE) % SIZE;
      const c = (col + dc + SIZE) % SIZE;
      if (grid[r][c]) {
        count++;
      }
    }
  }
  return count;
}

function nextGeneration(grid: boolean[][]): {
  next: boolean[][];
  changed: boolean;
} {
  let changed = false;
  const next = grid.map((row, r) =>
    row.map((alive, c) => {
      const neighbors = countNeighbors(grid, r, c);
      const nextAlive = alive
        ? neighbors === 2 || neighbors === 3
        : neighbors === 3;
      if (nextAlive !== alive) {
        changed = true;
      }
      return nextAlive;
    })
  );
  return { next, changed };
}

export function PageSpinner() {
  const [grid, setGrid] = useState(createGrid);
  const staleCountRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setGrid((prev) => {
        const { next, changed } = nextGeneration(prev);
        if (changed) {
          staleCountRef.current = 0;
        } else {
          staleCountRef.current++;
        }
        // Re-seed if stale for 3 ticks or all dead
        if (
          staleCountRef.current >= 3 ||
          !next.some((row) => row.some(Boolean))
        ) {
          staleCountRef.current = 0;
          return createGrid();
        }
        return next;
      });
    }, TICK_MS);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div
        className="grid gap-px"
        style={{
          gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
        }}
      >
        {grid.flat().map((alive, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: static grid
            className={`size-2 transition-colors duration-150 ${alive ? "bg-foreground" : "bg-transparent"}`}
            key={i}
          />
        ))}
      </div>
    </div>
  );
}
