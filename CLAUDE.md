# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QR Platby - A free online QR code generator for Slovak banking payments using the BySquare format. Users enter payment details (IBAN, amount, symbols) and generate QR codes scannable by any Slovak bank's app. All data is stored locally in the browser.

## Commands

```bash
# Development
bun dev                    # Start dev server
bun run build              # Production build (NOT `bun build` — that's bun's bundler)
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
- **i18n**: next-intl with `[locale]` routing — locales: sk, en, cs

## Architecture

```
app/                      # Next.js App Router pages
  [locale]/               # Locale-segmented routes
components/               # Reusable UI components
  ui/                     # shadcn Base UI primitives
features/payment/         # Payment feature module
  components/             # Payment-specific components
  schema.ts               # Zod validation schema
  store.ts                # Zustand store (history, deduplication)
  qr-generator.ts         # QR code generation with canvas overlay
  use-payment-generator.ts # Form submission hook
features/feedback/        # Feature request / feedback module
lib/utils.ts              # Utility functions (cn, maskIban)
env.ts                    # T3 env validation
messages/{sk,en,cs}.json  # Translation files (namespaced keys)
```

## Key Patterns

- **Server Components by default** - Mark interactive components with `"use client"`
- **Dynamic imports with SSR disabled** for Base UI components (prevents hydration mismatches)
- **Feature-based organization** - Domain logic grouped in `features/` directory
- **Zustand store hooks** - Use `useCurrentPayment()`, `usePaymentHistory()`, `usePaymentActions()`
- **Form validation** - Zod schemas with react-hook-form Controller pattern
- **i18n in client components** - `useTranslations("Namespace")` hook, `Link` from `@/i18n/navigation`
- **Translated Zod validation** - Use schema factory functions (e.g. `createSchema(messages)`) since hooks can't be called in schemas
- **Base UI Dialog** - Inline wrapper components (DialogPortal, DialogOverlay, DialogContent), not shadcn re-exports

## Code Standards

This project uses Ultracite (Biome preset) for formatting and linting. Key rules:
- Prefer `unknown` over `any`
- Use arrow functions for callbacks
- Prefer `for...of` over `.forEach()`
- Use `async/await` over promise chains
- React 19: Use ref as prop (no forwardRef needed)
- Always run `bun x ultracite fix` before committing
- Block statements required for all if/else (no `if (x) return y`)
- Regex literals must be top-level constants, not inline

## Path Alias

`@/*` maps to project root (e.g., `@/components/ui/button`)

## Gotchas

- **Zod v4**: Use `.issues` not `.errors` on `ZodError` objects
- **`bun install` after pull**: Remote PRs may add deps — run `bun install` before building
- **`bunx shadcn` hangs**: CLI often hangs on "Resolving dependencies". Fetch source from `https://ui.shadcn.com/r/styles/base-lyra/<component>.json` instead
- **Biome suppression in JSX props**: Use `// biome-ignore` inline comment on the prop line, not `{/* */}` JSX comment
- **UI components**: Always use shadcn/Base UI primitives (`@base-ui/react/accordion`, etc.) — don't build custom alternatives from lower-level primitives
- **JSX ternary branches**: Must return a single expression — wrap multiple siblings in `<>...</>` fragment

## Worktrees

Use `.worktrees/` directory for git worktrees (project-local, hidden).
