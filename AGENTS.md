# Agent Guidelines for QR Payments Repository

## Development Commands

```bash
# Development
bun dev                    # Start dev server (http://localhost:3000)
bun build                  # Production build
bun start                  # Start production server

# Code Quality (Ultracite/Biome)
bun format        # Auto-fix formatting and linting issues
bun lint       # Check for issues without fixing
```

## Tech Stack

- **Framework**: Next.js 16 with App Router, React 19 with compiler
- **Runtime**: Bun
- **Styling**: Tailwind CSS v4, shadcn/ui (base-lyra), Tabler icons
- **Forms**: react-hook-form + Zod validation
- **State**: Zustand with localStorage persistence
- **QR Generation**: bysquare library + qrcode canvas rendering

## Code Style Guidelines

### Imports

- External dependencies first, then internal modules
- Use `@/*` alias for project root (e.g., `@/components/ui/button`)
- Group imports by purpose (react, external, internal)
- No blank lines between import groups

```typescript
"use client";

import { useCallback, useState } from "react";
import { IconExample } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { usePaymentActions } from "@/features/payment/store";
```

### Components

- Mark interactive components with `"use client"` at top
- Server Components are default in App Router
- Use `dynamic()` import with `ssr: false` for Base UI components to prevent hydration mismatches
- Use named exports for components
- Nest children between tags, not as props

### React 19 Specifics

- Pass `ref` as prop directly (no `forwardRef` needed)
- Call hooks only at top level
- Specify all dependencies in hook arrays

### Types

- Prefer `unknown` over `any`
- Use `z.infer<>` to derive types from Zod schemas
- Export types that are used across modules
- Use type assertions only when necessary

```typescript
export const paymentSchema = z.object({ ... });
export type PaymentFormData = z.infer<typeof paymentSchema>;
```

### Naming Conventions

- Components: `PascalCase` (e.g., `PaymentFormCard`)
- Functions: `camelCase` (e.g., `setCurrent`)
- Constants: `SCREAMING_SNAKE_CASE` (e.g., `MAX_HISTORY_SIZE`)
- Types: `PascalCase` (e.g., `PaymentRecord`)

### Forms

- Use Zod for validation with `zodResolver`
- Use `react-hook-form` with Controller for custom inputs
- Set `mode: "onBlur"` for validation
- Use `defaultValues` object

```typescript
const { register, handleSubmit, control } = useForm<PaymentFormData>({
  defaultValues,
  resolver: zodResolver(paymentSchema),
  mode: "onBlur",
});
```

### Error Handling

- Throw `Error` objects with descriptive messages
- Use try-catch for async operations
- Show user feedback with `sonner.toast`
- Use instanceof checks for specific error types

```typescript
try {
  await generateQR();
  toast.success("QR kód vygenerovaný");
} catch (error) {
  if (error instanceof InvalidIBANError) {
    toast.error(error.message);
  } else {
    toast.error("Nepodarilo sa vygenerovať QR kód");
  }
}
```

### State Management (Zustand)

- Store pattern: `state` and `actions` separation
- Export specific hooks: `useCurrentPayment`, `usePaymentActions`
- Use `persist` middleware for localStorage
- Group related actions in `actions` object

```typescript
export const useCurrentPayment = () => store((s) => s.current);
export const usePaymentActions = () => store((s) => s.actions);
```

### Async Patterns

- Use `async/await` over promise chains
- Use `useTransition` for non-blocking updates
- Use `useCallback` for memoized async functions
- Always use the return value of awaited promises

### Code Organization

- Feature-based structure in `features/` directory
- Schema in `schema.ts`, store in `store.ts`, hooks in `use-*.ts`
- Reusable components in `components/`
- UI primitives in `components/ui/`

### Formatting (Ultracite/Biome)

- Always run `bun x ultracite fix` before committing
- Prefer arrow functions for callbacks
- Use `for...of` over `.forEach()`
- Use `const` by default, `let` only for reassignment
- Use early returns to reduce nesting
- Destructure objects and arrays

### Accessibility

- Use semantic HTML (`<button>`, `<nav>`, etc.)
- Provide meaningful labels for form inputs
- Add keyboard event handlers with mouse events
- Use proper ARIA attributes
- Add `rel="noopener"` for `target="_blank"` links

### Internationalization

- User-facing text is in Slovak
- Error messages in Slovak
- Keep comments and code in English

## Architecture

```
app/                      # Next.js App Router (server components)
components/               # Reusable UI components
  ui/                     # shadcn Base UI primitives
features/payment/         # Payment feature module
  components/             # Payment-specific components
  schema.ts               # Zod validation schema
  store.ts                # Zustand store
  qr-generator.ts         # QR code generation
  use-payment-generator.ts # Form submission hook
lib/utils.ts              # Utility functions (cn, maskIban)
env.ts                    # T3 env validation
```

## Key Patterns

- **Dynamic imports** with SSR disabled for Base UI components
- **Zustand store hooks** for state management
- **Zod schemas** for type-safe validation
- **localStorage persistence** via Zustand middleware
- **useTransition** for non-blocking UI updates
