import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * Decorative "QR Platby" brand mark rendered as an animated pixel grid.
 *
 * Each lit cell is an individual SVG <rect> so it can flicker independently
 * (CSS-driven, no JS). Delays/durations are derived deterministically from the
 * cell index so server and client markup match (no hydration mismatch) and no
 * "use client" boundary is needed. Decorative only — `aria-hidden`, the real
 * page <h1> carries the accessible heading text.
 */

// 9-row glyph grid. "#" = lit cell, "." = empty. Baseline body is rows 0-6,
// rows 7-8 reserved for descenders (e.g. "y").
const GLYPHS: Record<string, string[]> = {
  Q: [
    ".###.",
    "#...#",
    "#...#",
    "#...#",
    "#.#.#",
    "#..#.",
    ".##.#",
    ".....",
    ".....",
  ],
  R: [
    "####.",
    "#...#",
    "#...#",
    "####.",
    "#.#..",
    "#..#.",
    "#...#",
    ".....",
    ".....",
  ],
  P: [
    "####.",
    "#...#",
    "#...#",
    "####.",
    "#....",
    "#....",
    "#....",
    ".....",
    ".....",
  ],
  l: ["#.", "#.", "#.", "#.", "#.", "#.", "##", "..", ".."],
  a: [
    ".....",
    ".....",
    ".###.",
    "....#",
    ".####",
    "#...#",
    ".####",
    ".....",
    ".....",
  ],
  t: ["....", ".#..", "###.", ".#..", ".#..", ".#..", ".##.", "....", "...."],
  b: [
    "#....",
    "#....",
    "####.",
    "#...#",
    "#...#",
    "#...#",
    "####.",
    ".....",
    ".....",
  ],
  y: [
    ".....",
    ".....",
    "#...#",
    "#...#",
    "#...#",
    "#...#",
    ".####",
    "....#",
    ".###.",
  ],
};

const SEQUENCE = ["Q", "R", " ", "P", "l", "a", "t", "b", "y"] as const;

const GRID_HEIGHT = 9;
const LETTER_GAP = 1;
const WORD_GAP = 3;
const SPACE = " ";
const LIT = "#";

// How many squares thick each glyph stroke becomes. Every source cell is
// expanded into a STROKE_SCALE × STROKE_SCALE block of squares, turning the
// 1-square pixel font into a chunky multi-square banner. Bump to 4 for bolder.
const STROKE_SCALE = 3;

// Cell pitch and rect size (in SVG units). The 2-unit difference is the gap
// between squares — keeps individual squares distinct within thick strokes.
const PITCH = 8;
const RECT = 6;
const RECT_OFFSET = (PITCH - RECT) / 2;

// Glints are assigned per ORIGINAL glyph pixel (a STROKE_SCALE × STROKE_SCALE
// block), and all squares in a block animate in unison — so each glint is one
// visible chunk, not an imperceptible single sub-square.
// glints/second ≈ animatedBlocks / avgCycle. Of ~113 glyph pixels: ~18% flicker
// + ~10% glow ≈ 32 blocks over an ~8s avg cycle → roughly 4 glints/second.
const GLOW_RATIO = 0.1; // flash the brand color
const FLICKER_RATIO = 0.18; // blink on/off

// Negative, randomized delays desync each block so glints scatter across the
// full cycle — no synchronized wave or diagonal sweep.
const FLICKER_PHASE_RANGE = 11_000;
const FLICKER_MIN_DURATION = 5000;
const FLICKER_DURATION_RANGE = 6000;

const HASH_SCALE = 43_758.5453;

/** Deterministic 0..1 hash — pure, stable across SSR/CSR (no bitwise ops). */
function pseudoRandom(seed: number): number {
  const value = Math.sin(seed) * HASH_SCALE;
  return value - Math.floor(value);
}

type PixelKind = "static" | "flicker" | "glow";

const KIND_CLASS: Record<PixelKind, string> = {
  static: "qr-pixel",
  flicker: "qr-pixel qr-pixel--flicker",
  glow: "qr-pixel qr-pixel--glow",
};

interface Pixel {
  key: string;
  x: number;
  y: number;
  kind: PixelKind;
  flickerDelay: number;
  flickerDuration: number;
}

function pixelKind(index: number): PixelKind {
  if (pseudoRandom(index * 13 + 5) < GLOW_RATIO) {
    return "glow";
  }
  if (pseudoRandom(index * 17 + 9) < FLICKER_RATIO) {
    return "flicker";
  }
  return "static";
}

interface SourceCell {
  col: number;
  row: number;
}

function glyphCells(token: string, xOffset: number): SourceCell[] {
  const cells: SourceCell[] = [];
  const rows = GLYPHS[token];
  for (const [row, line] of rows.entries()) {
    for (const [col, char] of [...line].entries()) {
      if (char === LIT) {
        cells.push({ col: xOffset + col, row });
      }
    }
  }
  return cells;
}

function collectCells(): { cells: SourceCell[]; sourceColumns: number } {
  const cells: SourceCell[] = [];
  let xOffset = 0;

  for (const token of SEQUENCE) {
    if (token === SPACE) {
      xOffset += WORD_GAP;
      continue;
    }
    cells.push(...glyphCells(token, xOffset));
    xOffset += GLYPHS[token][0].length + LETTER_GAP;
  }

  return { cells, sourceColumns: xOffset - LETTER_GAP };
}

// Expand one glyph pixel into its STROKE_SCALE × STROKE_SCALE block of squares.
// Role, delay and duration are shared by the whole block so it glints in unison.
function makeCellPixels(cell: SourceCell, cellIndex: number): Pixel[] {
  const kind = pixelKind(cellIndex);
  const flickerDelay = -pseudoRandom(cellIndex * 2 + 1) * FLICKER_PHASE_RANGE;
  const flickerDuration =
    FLICKER_MIN_DURATION +
    pseudoRandom(cellIndex * 7 + 3) * FLICKER_DURATION_RANGE;
  const block: Pixel[] = [];

  for (let dy = 0; dy < STROKE_SCALE; dy++) {
    for (let dx = 0; dx < STROKE_SCALE; dx++) {
      const gridX = cell.col * STROKE_SCALE + dx;
      const gridY = cell.row * STROKE_SCALE + dy;
      block.push({
        key: `${gridX}-${gridY}`,
        x: gridX * PITCH + RECT_OFFSET,
        y: gridY * PITCH + RECT_OFFSET,
        kind,
        flickerDelay,
        flickerDuration,
      });
    }
  }

  return block;
}

function buildPixels(): { pixels: Pixel[]; columns: number } {
  const { cells, sourceColumns } = collectCells();
  const pixels: Pixel[] = [];

  for (const [cellIndex, cell] of cells.entries()) {
    pixels.push(...makeCellPixels(cell, cellIndex));
  }

  return { pixels, columns: sourceColumns * STROKE_SCALE };
}

const { pixels, columns } = buildPixels();
const VIEW_WIDTH = columns * PITCH;
const VIEW_HEIGHT = GRID_HEIGHT * STROKE_SCALE * PITCH;

function pixelStyle(pixel: Pixel): CSSProperties {
  if (pixel.kind === "static") {
    return {};
  }
  return {
    animationDelay: `${pixel.flickerDelay}ms`,
    animationDuration: `${pixel.flickerDuration}ms`,
  };
}

export function QrPlatbyTitle({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("h-auto w-full text-foreground", className)}
      focusable="false"
      shapeRendering="crispEdges"
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {pixels.map((pixel) => (
        <rect
          className={KIND_CLASS[pixel.kind]}
          height={RECT}
          key={pixel.key}
          style={pixelStyle(pixel)}
          width={RECT}
          x={pixel.x}
          y={pixel.y}
        />
      ))}
    </svg>
  );
}
