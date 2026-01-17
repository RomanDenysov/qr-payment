# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QR Platby - A free online QR code generator for Slovak banking payments using the BySquare format. Users enter payment details (IBAN, amount, symbols) and generate QR codes scannable by any Slovak bank's app. All data is stored locally in the browser.

## Commands

```bash
# Development
bun dev                    # Start dev server
bun build                  # Production build
bun start                  # Start production server

# Code Quality (Biome/Ultracite)
bun x ultracite fix        # Auto-fix formatting and linting issues
bun x ultracite check      # Check for issues without fixing
```

## Tech Stack

- **Framework**: Next.js 16 with App Router, React 19 with compiler
- **Runtime**: Bun
- **Styling**: Tailwind CSS v4, shadcn/ui (base-lyra style), Tabler icons
- **Forms**: react-hook-form + Zod validation
- **State**: Zustand with localStorage persistence
- **QR Generation**: bysquare library + qrcode canvas rendering

## Architecture

```
app/                      # Next.js App Router pages
components/               # Reusable UI components
  ui/                     # shadcn Base UI primitives
features/payment/         # Payment feature module
  components/             # Payment-specific components
  schema.ts               # Zod validation schema
  store.ts                # Zustand store (history, deduplication)
  qr-generator.ts         # QR code generation with canvas overlay
  use-payment-generator.ts # Form submission hook
lib/utils.ts              # Utility functions (cn, maskIban)
env.ts                    # T3 env validation
```

## Key Patterns

- **Server Components by default** - Mark interactive components with `"use client"`
- **Dynamic imports with SSR disabled** for Base UI components (prevents hydration mismatches)
- **Feature-based organization** - Domain logic grouped in `features/` directory
- **Zustand store hooks** - Use `useCurrentPayment()`, `usePaymentHistory()`, `usePaymentActions()`
- **Form validation** - Zod schemas with react-hook-form Controller pattern

## Code Standards

This project uses Ultracite (Biome preset) for formatting and linting. Key rules:
- Prefer `unknown` over `any`
- Use arrow functions for callbacks
- Prefer `for...of` over `.forEach()`
- Use `async/await` over promise chains
- React 19: Use ref as prop (no forwardRef needed)
- Always run `bun x ultracite fix` before committing

## Path Alias

`@/*` maps to project root (e.g., `@/components/ui/button`)

## Worktrees

Use `.worktrees/` directory for git worktrees (project-local, hidden).
