# SEO & Growth Plan — July 2026

Implementation plan for a Claude Code session. Based on Google Search Console data (28 days, 2026-06-10 → 2026-07-07) and the current codebase. All changes must integrate with the ongoing redesign (light theme, pixel logo, orange accent) — build new sections with the redesigned components, not the old ones.

## Context: what the GSC data says

Totals: 251 clicks, ~7,700 impressions, avg position ~6. Impressions trending up (~200/day early June → 300-500/day now).

Key findings:

1. **We rank but don't get clicked.** Head terms sit at position 6-8 with terrible CTR:
   - `pay by square generator` — 332 imp, CTR 1.5%, pos 6.3
   - `generátor qr platby` — 145 imp, **0 clicks**, pos 8.4
   - `paybysquare generator` — 63 imp, 0 clicks, pos 7.4
   - `qr platba generátor` — 129 imp, CTR 2.3%, pos 8.5
   - Healthy CTR at pos 6-8 is 3-5%. This is a title/description problem.
2. **Only the homepage ranks.** 198 of 251 clicks go to `/`. Subpages are invisible (`/bulk` — 2 impressions). The domain has trust; new dedicated pages should rank quickly.
3. **Czech market underperforms.** SK: 2,607 imp @ pos 5.7. CZ: 1,333 imp @ pos 7.8, and Czech-language queries rank badly: `qr kod pro platbu` pos 27, `jak vytvořit qr kód pro platbu` pos 33-43. `/cs` got only 490 impressions. CZ is the biggest untapped market.
4. **How-to queries convert best.** `ako vytvoriť qr kód na platbu` — pos 2, CTR 50%. The how-to format is proven; scale it.
5. **Competitor brand searches exist.** `bsqr.co generator ...` — ~137 imp total @ pos 8; `qrgenerator.sk ...` queries too.
6. **Bank-specific queries exist and are uncontested.** `pay by square vub` pos 11, `pay by square tatra banka` pos 29, `... moneta` pos 11, `... raiffeisen`.
7. **US traffic is noise** (2,298 imp, CTR 0.09% — people searching for Square Inc). Ignore. But NL (334 imp), DE (300), UK (209) with ~0 clicks = real EPC/SEPA demand for an English landing.

## Priorities

| # | Workstream | Effort | Impact |
|---|-----------|--------|--------|
| 1 | Metadata/CTR rework (sk/cs/en) | S | High, immediate |
| 2 | Czech how-to landing page | M | High |
| 3 | Bank landing pages (programmatic) | M | Medium-high |
| 4 | SK how-to guide + FAQ/HowTo schema on new pages | S-M | Medium |
| 5 | English SEPA/EPC landing | S-M | Medium |
| 6 | Usage stats (Upstash counters + homepage cards) | M | Product/social proof |
| 7 | Share-link open tracking | M | Product differentiator |

Do them in order. 1-5 are SEO; 6-7 are product features that feed marketing later. Each workstream should be a separate PR/commit series.

---

## Workstream 1 — Metadata/CTR rework

**Files:** `messages/{sk,cs,en}.json` → `Metadata` namespace; verify usage in `app/[locale]/layout.tsx` (`generateMetadata`).

Current titles are long and front-load the brand-neutral phrase; Google truncates at ~60 chars and the value proposition gets cut. Rework principles:

- Lead with the exact head query per locale, keep under ~60 chars visible:
  - sk: lead with "Generátor QR platby" / "PAY by square generátor" (the two highest-impression SK queries), include "zadarmo".
  - cs: lead with "QR platba generátor" / "Vytvořit QR kód na platbu", include "zdarma". Note: in CZ "QR platba" colloquially means the SPAYD format itself — the title should read naturally to a Czech user, not like a Slovak product.
  - en: lead with "SEPA QR Code Generator" or "IBAN QR Code Generator" — NOT "PAY by square" first (that collides with Square Inc searches in the US, which are noise; the real EN audience searches "iban qr", "sepa qr", "epc qr").
- Descriptions: first ~90 chars must contain the differentiators — zadarmo/zdarma/free, bez registrácie/no signup, funguje so všetkými bankami. Add a call to action ("Vytvorte QR kód za 5 sekúnd").
- Keep `titleTemplate` as is for subpages.
- After editing, verify all three locales render correctly (`bun dev`, check `<title>` and meta description per locale).

Acceptance: titles ≤60 chars to the pipe, descriptions 140-160 chars, each locale leads with its own head query.

## Workstream 2 — Czech how-to landing

**Goal:** rank for `jak vytvořit qr kód pro platbu` (now pos 33-43), `qr kod pro platbu` (pos 27), `vytvořit qr kód na platbu` (pos 7-9).

**Route:** new page, e.g. `app/[locale]/jak-vytvorit-qr-kod/page.tsx` with localized pathnames via `i18n/routing.ts` (next-intl `pathnames` config):
- cs: `/jak-vytvorit-qr-kod-pro-platbu`
- sk: `/ako-vytvorit-qr-kod-na-platbu`
- en: `/how-to-create-payment-qr-code`

One page component, three localized slugs and content sets. This doubles as Workstream 4 (the SK guide) — build once, translate three times.

**Content structure (server component, prose from messages):**
1. H1 matching the query, short intro answering it in the first paragraph (featured-snippet bait).
2. Step-by-step with screenshots/illustrations (reuse the redesign's step cards — same pattern as the existing "Jak vytvořit QR kód na platbu" section on home, but expanded).
3. Per-format explainer (SPAYD vs PAY by square vs EPC — when to use which; cs version leads with SPAYD).
4. Inline generator CTA — link to `/` or embed a minimal form island linking to home with prefilled state.
5. FAQ section (5-8 questions) sourced from real queries: "Musím něco instalovat?", "Funguje to s mou bankou?", "Je to zdarma?", "Co je variabilní symbol v QR kódu?" etc.

**Schema:** `HowTo` + `FAQPage` JSON-LD on this page (follow the existing pattern in `app/[locale]/home-json-ld.tsx`). One JSON-LD component per page, translated via `JsonLd` namespace.

**Wiring checklist (required for every new page):**
- [ ] `app/sitemap.ts` — add path
- [ ] `lib/seo.ts` `getAlternates` — used in the page's `generateMetadata` (canonical + hreflang)
- [ ] `messages/{sk,cs,en}.json` — full translations, no fallback to sk
- [ ] Internal links: from homepage footer/"Další nástroje" section and from FAQ page
- [ ] `docs/features.json` — register the page
- [ ] Server component only; no `"use client"` except tiny interactive islands

## Workstream 3 — Bank landing pages (programmatic)

**Goal:** own `pay by square <bank>` / `qr platba <banka>` queries.

**Architecture:** data-driven, one template. Create `features/seo-pages/banks.ts` with a typed record per bank: slug, name, country (sk/cz), supported formats, app name, how-to-scan steps, official app links. Route: `app/[locale]/banky/[bank]/page.tsx` (localized base path: sk `/banky`, cs `/banky`, en `/banks`) with `generateStaticParams` from the data file.

Banks (from GSC + supported list on home): Tatra banka, Slovenská sporiteľňa, VÚB, ČSOB SK, 365.bank, UniCredit, mBank SK, Fio SK; Česká spořitelna, Komerční banka, ČSOB CZ, Air Bank, Fio CZ, Raiffeisenbank, Moneta, mBank CZ.

**Anti-doorway rule (important):** every bank page must contain genuinely unique content, not a swapped bank name: which format the bank's app scans, exact scan flow in that app (menu names), limits/quirks if any, a bank-specific FAQ. If unique content can't be written for a bank, don't ship that page — thin doorway pages can hurt the whole domain.

Each page: H1 "QR platba <banka> — ako naskenovať a vytvoriť", generator CTA, HowTo schema, breadcrumbs (`BreadcrumbList` JSON-LD). Same wiring checklist as Workstream 2. Add a "Podporované banky" section on home linking to these pages (replaces/upgrades the current static badge list — fits the redesign's Supported Banks section).

## Workstream 4 — covered by Workstream 2 (SK/EN variants of the guide)

## Workstream 5 — English SEPA/EPC landing

**Goal:** capture NL/DE/UK "sepa qr code generator", "iban qr code", "epc qr generator" demand.

Route: `app/[locale]/sepa-qr-code-generator/page.tsx`, primarily for `en` (sk/cs get translated variants but en is the target). Content: what EPC QR is, which EU banking apps scan it, generator CTA defaulting the format tab to EPC (link `/?format=epc` if supported, or add support for a format query param on home — small change in the payment form island). H1: "SEPA QR Code Generator (EPC QR) — Free, No Signup". Same wiring checklist.

Also: reconsider the `en` homepage H1 (currently "PAY by square Generator…") — for EN audience "Payment QR Code Generator for SEPA, Slovak & Czech Banks" matches real queries better. Keep "PAY by square" in the body.

## Workstream 6 — Usage stats

**Backend:** Upstash Redis is already a dependency (`lib/api/rate-limiter.ts`).
- Counters: `stats:qr:total`, `stats:qr:{YYYY-MM}`, `stats:api:total` — plain `INCR`, fire-and-forget.
- Increment points: client-side after successful generation (`features/payment/use-payment-generator.ts` and bulk flow) via `navigator.sendBeacon` or `fetch(..., { keepalive: true })` to a new `POST /api/v1/stats/hit`; API route increments `stats:api:total` directly in `app/api/v1/qr/route.ts`.
- Read endpoint: `GET /api/v1/stats` — cached (`revalidate: 600` or Cache-Control), returns `{ total, month, api }`. No auth, no PII — counters only.
- **Do NOT send any payment payload** to the stats endpoint. Body-less POST.
- Ad blockers will cut some pings — accepted undercount.

**Frontend:** 3 metric cards under the generator section on home (fits between the form and the "Co je QR Platba" block in the new design): total generated (all time), this month, API requests. Server component fetching the endpoint (or direct Redis read server-side — preferred, no extra HTTP hop), numbers formatted per locale. Caption: "Anonymní počítadla — vaše platební údaje nikdy nevidíme" (translate all locales). Show the month card only when ≥2 months of data; until then a static fallback card ("3 formáty · 16 bank").

**Sync:** `docs/analytics-events.json` if new events are added; `docs/features.json`; if `/api/v1/*` shape is added, follow the API Changes checklist in CLAUDE.md (openapi.json, qr-docs.ts, llms.txt — stats endpoint should be documented at least in openapi.json).

## Workstream 7 — Share-link open tracking

**Design (privacy-first, no accounts):**
1. On share-link creation, client generates a random 32-byte `secret`, stores in localStorage (extend the payment store or a new `features/tracking/store.ts`).
2. Public `id = base64url(sha256(secret)).slice(0, 16)` appended to the share URL as a query param (keep the payment payload in the existing compact format — `features/payment/share-link.ts`).
3. On share-link open (`app/[locale]/p/` route), client JS fires `POST /api/v1/t/{id}` — fire-and-forget, no body. Server: `INCR track:{id}:count`, `SET track:{id}:last <timestamp>`, both with `EXPIRE` 90 days refreshed on increment.
4. Owner stats: client sends `secret` to `GET /api/v1/t/stats` (or computes the id client-side and calls `GET /api/v1/t/{id}` — simpler; possession of the full link already reveals the id, decide and document). Display in share dialog + history list: "Otvorené 5× · naposledy včera".

**Rules:**
- Increment ONLY from client JS on the opened page, never on GET/SSR — otherwise WhatsApp/Slack unfurl bots inflate counts.
- Total count + last-opened timestamp only. No unique visitors, no IP, no fingerprinting (GDPR + the "we don't collect data" promise).
- UX copy says "opened", never "paid".
- The tracking id must not be derivable from payment data.
- Payment payload never touches the server.

**Sync:** `features/payment/share-link.ts` (id param encode/decode), `features/payment/store.ts` (persist secret alongside history entry — mind the Zustand migration gotchas in CLAUDE.md), share dialog UI, `docs/features.json`, translations ×3.

---

## Global constraints (apply to every workstream)

- Follow CLAUDE.md: server components by default, `rounded-none`, shadcn/Base UI primitives, Ultracite (`bun x ultracite fix`, scope checks to touched files), Zod v4 `.issues`, no try-catch around dynamic imports.
- Every user-facing string exists in all three of `messages/{sk,en,cs}.json`. No hardcoded copy.
- New routes: sitemap + `getAlternates` canonical/hreflang + `docs/features.json` + internal links. A page with no internal links pointing at it will not be crawled quickly.
- New content pages must visually match the redesign (grid background, pixel/mono aesthetic, orange accent) — reuse the redesigned section components from home.
- Verify each workstream: `bun run build` passes, all three locales render, JSON-LD validates (paste into Google Rich Results test), no hydration warnings.
- Do not add `track()` to navigation links (CLAUDE.md rule).

## Workstream 8 — UI decisions backed by product analytics

Event data (Vercel/Plausible-style, visitors / total):
`qr_generated` 1.4K / 3.3K · `qr_downloaded` 643 / 1.1K · `format_selected` 495 / 2.6K · `api_qr_generated` 244 / 894 · `qr_copied` 195 / 290 · `qr_shared` 69 / 91 · `share_link_copied` 52 / 66 · customizer events ~4% of visitors.
`format_selected` breakdown: epc 400 / 968, bysquare 398 / 937, spayd 347 / 742.
`qr_generated` by `format`: bysquare 78% (2.4K), epc 11% (403), spayd 11% (271) — tab clicks are evenly split but actual generation is dominated by bysquare; EPC has a large selection→generation drop-off (hypothesis: EPC's mandatory recipient-name field adds friction — verify with a per-format validation-error event).
`qr_generated` by `currency`: EUR 90%, CZK 10%.
`qr_generated` by `fields_filled`: 2 → 41%, 1 → 29%, 3 → 14%, 0 → 7%, 4 → 7%, 5 → 3% (77% of generations use ≤2 fields; 29% are IBAN-only static QRs).
`qr_generated` by `has_logo`: true 1%; by `has_branding`: true 4%.

Decisions derived from this data (implement during the redesign):

1. **Action bar hierarchy.** Post-generation actions by usage: Download 46% of generators, Copy 14%, native Share 5%, Share link 4%. The current UI styles "Share link" as primary — invert it: Download = primary; Copy = secondary (keep as a dedicated button, do NOT fold into the share sheet); Share link = tertiary; native Share = overflow on desktop, prominent on mobile (swap Copy into overflow on mobile).
2. **QR prominence over buttons.** ~54% of generators press no action button — they likely scan the QR straight off the screen. Keep the rendered QR large and high-contrast in the layout; buttons are secondary to it.
3. **Format defaults + assisted choice.** Selections split evenly (epc 35% / bysquare 35% / spayd 30%) and switchers try ~2-3 formats per visit, yet 78% of generations are bysquare — tab clicks are exploration, not intent. Implement: per-locale default (sk → bysquare, cs → spayd, en → epc); soft hint when IBAN country mismatches selected format (e.g. SK IBAN + spayd selected → suggest bysquare; hint only, never auto-switch); one-line "who is this format for" caption under the active tab. Track whether `format_selected` totals drop.
   - **EPC funnel investigation:** EPC converts selection→generation far worse than bysquare (968 selections → 403 generations). Hypothesis: EPC's mandatory recipient name field. Add a per-format validation-error/abandon event; if confirmed, ease the EPC path (clearer required-field marking, remember recipient name in localStorage).
3b. **Minimal form is validated.** 77% of generations use ≤2 fields (IBAN + amount); 29% are IBAN-only static QRs. Collapse VS/SS/KS, recipient, and note behind a single "+ more fields" disclosure by default. The IBAN-only static QR is a first-class use case — don't gate generation on amount, and consider a subtle "static QR" hint when amount is empty.
4. **Customizer stays behind one click.** ~4% of visitors use it — it must not occupy first-screen real estate, but keep a discoverable entry point (icon on the QR panel).
5. **History/templates deserve promotion.** 2.4 generated QRs per generating visitor — repeat generation is the norm. History gets a top slot in the new navigation (icon rail).
6. **API is 21% of all QR volume** (894 of ~4.2K) — treat the API as a first-class product surface (docs quality, changelog notes), and as the future paid tier.

Sync notes: format defaults touch `features/payment/` (schema/store/format.ts) and `i18n` defaults; hint copy ×3 locales; update `docs/analytics-events.json` if events change; consider a `format_hint_shown` / `format_hint_accepted` event to measure decision 3.

## Explicitly out of scope (for now)

- Sponsorship/donations UI, paid API tier — later phase, after stats accumulate.
- POS/eKasa/state-QR-system (KVERKOM) integration — different product; our niche is invoices/freelancers/one-off payments. A comparison guide page ("Štátne QR platby vs. QR kód na faktúre") may be added as a follow-up content page using the Workstream 2 template.
- Paid ads, social media.

## Suggested session order

1. Workstream 1 (metadata) — single small PR, ship immediately.
2. Workstream 2 (guide page, all 3 locales) — establishes the content-page template + JSON-LD components + wiring pattern.
3. Workstream 3 (bank pages) — reuses the template; write bank data carefully, honesty over volume.
4. Workstream 5 (SEPA EN landing) — reuses the template.
5. Workstream 6 (stats) — independent, can run parallel to 2-5.
6. Workstream 7 (tracking) — independent, most product-sensitive, do last with fresh attention.
