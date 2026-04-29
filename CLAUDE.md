# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QR Platby - A free online QR code generator for bank payments supporting PAY bySquare (Slovak), SPAYD (Czech), and EPC QR (EU SEPA). Users enter payment details (IBAN, amount, symbols) and generate QR codes scannable by banking apps. Amount is optional. All data is stored locally in the browser.

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
- **Bulk Export**: jsPDF (PDF), manual ZIP (STORE method), PapaParse (CSV)
- **Toasts**: Sonner
- **Themes**: next-themes
- **Analytics**: @vercel/analytics
- **i18n**: next-intl with `[locale]` routing — locales: sk, en, cs

## Architecture

```
app/                      # Next.js App Router pages
  [locale]/               # Locale-segmented routes
  api/v1/qr/route.ts      # QR generation REST API (POST + GET docs)
components/               # Reusable UI components
  ui/                     # shadcn Base UI primitives
features/api/             # API card component (homepage)
features/payment/         # Payment feature module
  components/             # Payment-specific components
  format.ts               # Payment format types & labels (bysquare, epc, spayd)
  schema.ts               # Zod validation schema
  store.ts                # Zustand store (history, deduplication)
  qr-generator.ts         # QR code generation with canvas overlay
  qr-payload.ts           # QR payload builder (dispatches to format encoders)
  epc-encoder.ts          # EPC QR payload encoder (EU SEPA)
  spayd-encoder.ts        # SPAYD payload encoder (Czech standard)
  share-link.ts           # Compact base64url share link encode/decode
  use-payment-generator.ts # Form submission hook
features/bulk/            # Bulk QR generation from CSV
  bulk-generator.ts       # Batch QR generation with progress
  csv-parser.ts           # CSV parsing and validation (PapaParse)
  export-pdf.ts           # A4 PDF export (jsPDF, 2x3 grid)
  export-zip.ts           # ZIP export (zero-dep STORE method)
  store.ts                # Zustand store for bulk state
features/customizer/      # Unified QR customizer (home sheet + /studio page)
  store.ts                # Zustand config + templates store (qrCustomizer.v1, max 30 templates)
  types.ts                # CustomizerConfig, Fill, FrameConfig, OverlayPosition
  renderer.ts             # renderCustomizerQR (gradients, position overlays, frame compositor)
  compress-logo.ts        # Logo compression for QR overlay
  branding-bridge.ts      # customizerToBranding helper for bulk/share/api callsites
  components/             # Shared customizer UI (color/dot/text/logo/frame controls + sheet + templates)
features/feedback/        # Feature request / feedback module
features/faq/             # FAQ data (translated)
features/docs/            # API docs page components
features/webmcp/          # Web MCP server provider
i18n/                     # next-intl config (routing, navigation, request)
lib/api/                  # API utilities
  rate-limiter.ts         # Upstash Redis rate limiting (sliding window)
  qr-schema.ts            # Zod schema + TypeScript types for API
  qr-docs.ts              # Machine-readable API documentation
  cors.ts                 # CORS headers
lib/utils.ts              # Utility functions (cn, maskIban)
lib/seo.ts                # SEO utilities (canonical, hreflang alternates)
env.ts                    # T3 env validation
messages/{sk,en,cs}.json  # Translation files (namespaced keys)
docs/
  features.json           # Feature catalog (name, source, route, category)
  analytics-events.json   # Analytics event map (event names, properties, sources)
public/openapi.json       # OpenAPI 3.1 spec - keep in sync with qr-schema.ts and route.ts
```

## Key Patterns

- **Server Components by default** - Only add `"use client"` when the component uses hooks, event handlers, or browser APIs. Push client boundaries to the smallest interactive leaves:
  - Page-level layouts, headings, cards, and static text must stay server components
  - Extract interactive parts (buttons with onClick, forms, state) into small client "islands"
  - Pass server-rendered content into client components via `children` prop (RSC composition)
  - `useTranslations` from `next-intl` works in both server and client components — prefer server
  - `getTranslations` from `next-intl/server` for async server components
  - Pure styled wrappers (e.g. table, label) without hooks must not have `"use client"`
  - `next/dynamic` with `ssr: false` requires a `"use client"` wrapper — cannot be used in server components
- **Dynamic imports with SSR disabled** for Base UI components (prevents hydration mismatches)
- **Client loader pattern** - Components using localStorage on mount use a `*-loader.tsx` wrapper with `dynamic(() => import(...), { ssr: false })`. See `consent-banner-loader.tsx`, `announcement-banner-loader.tsx`.
- **Feature-based organization** - Domain logic grouped in `features/` directory
- **Zustand store hooks** - Each feature has its own store with granular selectors:
  - Payment: `useCurrentPayment()`, `usePaymentHistory()`, `usePaymentActions()`
  - Bulk: `useBulkRows()`, `useBulkResults()`, `useBulkActions()`, etc.
  - Customizer: `useCustomizerConfig()`, `useCustomizerActions()`, `useCustomizerTemplates()` (shared by home sheet + /studio page)
- **Form validation** - Zod schemas with react-hook-form Controller pattern
- **Translated Zod validation** - Use schema factory functions (e.g. `createSchema(messages)`) since hooks can't be called in schemas
- **Base UI Dialog** - Inline wrapper components (DialogPortal, DialogOverlay, DialogContent), not shadcn re-exports

## Design System

- **No border radius** — All UI components use `rounded-none`. Buttons, cards, inputs, dialogs, badges, alerts — everything is sharp-cornered. When creating new UI elements, always use `rounded-none` or omit border-radius entirely. Never use `rounded-md`, `rounded-lg`, etc.
- **Match existing patterns** — Always check existing shadcn/Base UI components before creating custom UI. New interactive elements must visually match the established design (borders, spacing, colors, typography).

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

- **Dynamic `import()` — don't wrap in try-catch**: Let errors propagate naturally to the caller. Never use `let x; try { x = await import(...) } catch { ... }` — it's ugly, loses the stack trace, and the caller already handles errors. Use bare `const { x } = await import("lib")`.
- **Zod v4**: Use `.issues` not `.errors` on `ZodError` objects
- **`bun install` after pull**: Remote PRs may add deps — run `bun install` before building
- **`bunx shadcn` hangs**: CLI often hangs on "Resolving dependencies". Fetch source from `https://ui.shadcn.com/r/styles/base-lyra/<component>.json` instead
- **Biome suppression in JSX props**: Use `// biome-ignore` inline comment on the prop line, not `{/* */}` JSX comment
- **UI components**: Always use shadcn/Base UI primitives (`@base-ui/react/accordion`, etc.) — don't build custom alternatives from lower-level primitives
- **JSX ternary branches**: Must return a single expression — wrap multiple siblings in `<>...</>` fragment
- **No `client-zip`**: ZIP export uses a zero-dependency manual implementation (STORE method) because Turbopack can't chunk the ESM-only `client-zip` package. Don't re-add it.
- **`ultracite fix` touches unrelated files**: Auto-fix may reformat files you didn't change (trailing newlines, commas). This is normal - include them in the commit.
- **Announcement banner**: Change `ANNOUNCEMENT_ID` in `components/announcement-banner.tsx` and update `Announcement.message` in translation files. Old dismissed banners won't block new ones.

## API Changes

When modifying the `/api/v1/qr` endpoint, keep these files in sync:
- `app/api/v1/qr/route.ts` - route handler (error responses, headers)
- `lib/api/qr-schema.ts` - TypeScript types and Zod validation
- `lib/api/qr-docs.ts` - machine-readable docs (returned by GET)
- `public/openapi.json` - OpenAPI spec (served at `/api/openapi.json`)
- `features/api/api-card.tsx` - homepage API card (rate limit display is hardcoded)

When changing formats, rate limits, or parameters, also update:
- `packages/mcp-server/src/tools.ts` - MCP server tool schemas, FORMATS_INFO, getSuggestion
- `features/webmcp/use-webmcp-qr.ts` - browser WebMCP tool schema + format validation
- `public/llms.txt` and `public/llms-full.txt` - LLM-optimized documentation
- `docs/chatgpt-gpt/gpt-config.md` - ChatGPT Custom GPT system prompt
- `features/docs/data/parameters.ts` - docs page parameter table
- `features/docs/components/try-it-form.tsx` - docs try-it form format options
- `features/faq/data.ts` - FAQ answers (all 3 locales: sk, en, cs)
- `app/[locale]/json-ld.tsx` - JSON-LD structured data (rate limits)

## Documentation JSONs

`docs/features.json` and `docs/analytics-events.json` are the source of truth for features and tracked events.

- **Before implementation**: Read the relevant JSON to understand existing features/events
- **After changes**: Update the JSON if you added, removed, or modified a feature or analytics event
- Keep `source` paths accurate — they must point to real files

## Worktrees

Use `.worktrees/` directory for git worktrees (project-local, hidden).
