# Monetization & Retention Roadmap

> Strategy doc, not a spec. Captured 2026-06-01. Revisit when traffic clears the next volume floor.

## Where we are

- **~600 organic visits/mo**, ~42% activation → roughly **250 successful QR generations/mo**. Early-stage, climbing.
- Audience: **~80% SK/CZ small-business + freelancers**, Windows/office SMB. Their real job is *get paid* / *pay this*; the QR is one sub-step.
- **Free REST API with real external integrators.** No API key, no billing, capped at **20/min, 100/day**, advertised as free.
- Monetization today: a single **"Buy me a coffee"** link buried in the footer.
- Two growth/retention mechanics are **built but leaking**:
  - The shared-payment page (`app/[locale]/p`) has **no "make your own" powered-by CTA** - every payment link a user sends is a dropped new-user lead.
  - PWA manifest exists but there's **no install prompt**.

## The frame (Theory of Constraints)

At this traffic, **no monetization makes meaningful money yet** - revenue = traffic x intent x conversion, and **traffic is still the binding constraint**. So the selection test is not "which earns most today" but:

> Which lever costs ~zero to set up, **compounds as traffic grows**, and ideally **doubles as a growth lever** instead of taxing the free tool?

This reconciles with the prior "growth-first, monetization deferred" stance (see SEO growth roadmap): the best monetization here **is also growth**, so it isn't a reversal.

## Fit of each path

| Path | Fit | €/customer | Doubles as growth? | Verdict |
|------|-----|-----------|-------------------|---------|
| **Affiliate - adjacency only** (invoicing / banking / accounting) | High | Med (€15-40+, often recurring) | **Yes** (comparison content = SEO) | **Lead engine** |
| **Donations** (Buy Me a Coffee) | Med | Tiny (~€2-3) | No (goodwill only) | Quick win, low ceiling |
| **API paid tier** | High (B2B demand already exists) | **High (€9-19/mo recurring)** | No | **Real engine, later** |
| Freemium Studio features | Low | Low | No - **risks trust** | Skip for now |

### Why affiliate = adjacency only
Jobs-to-be-Done: the user is here to "get paid." The tools that finish that job - **SK/CZ invoicing software (SuperFaktura, iDoklad, Fakturoid, KROS, Billdu), business banking (Wise / Revolut Business), accounting** - are natural, trust-preserving affiliates. A *random* unrelated SaaS reads as spam and breaks the trust that drives WOM + the SEO moat (second-order thinking: don't kill the golden goose).

**The flywheel:** build the affiliate recommendation as **content pages** ("najlepší fakturačný softvér pre živnostníkov", "ako posielať faktúry s QR kódom"). They rank, pull *new* traffic, AND carry the affiliate links. Money and growth from one asset. Reuse the `features/seo/home-content.tsx` section template.

### The lever not originally on the table - the API
Real integrators already exist, and **100 requests/day is a natural paywall wedge** - a serious integrator hits it on day one. One business on a €19/mo "raise limit + API key + commercial license" tier out-earns *all* donations combined, recurring. Needs real infra (keys + Stripe + a careful migration so existing free users aren't broken - the API is a public contract). Engine #2, not the first move.

### Donations - keep but relocate
Footer = nobody sees it. The only place a free-utility donation works is the **peak-end / reciprocity moment: right after a successful download/share.** Move the ask there, keep it tasteful. Ceiling stays low (~€0-3/mo at this traffic) - capture the goodwill, don't over-invest.

## Money reality (be honest)
- Donations: ~0.05-0.2% of active users → **€0-3/mo** now. Scales poorly.
- Affiliate: a few clicks/mo today → **€2-15/mo** now, but **linear with traffic** and the content *grows* the traffic. At 10k visits/mo realistically €50-300/mo + the content helped get you there.
- API tier: even **one** integrator ≈ all donation income, recurring, highest €/customer.

## Action plan (in order)

**Now - near-zero cost, compounds or grows traffic**
1. **Fix the leaking viral loop** - subtle "Vytvorené cez QR Platby · sprav si vlastný →" powered-by CTA on the shared-payment page. Pure growth, ~1h.
2. **Move the donation ask to the success moment** (post-download), out of the footer.

**Engine #1 - affiliate-via-content (money + SEO in one)**
3. Apply to 2-3 SK/CZ invoicing affiliate programs. Build one comparison/how-to page on the existing content template. Add one tasteful "next step: send a proper invoice →" affiliate slot on the success screen.

**Engine #2 - API paid tier (defer until usage justifies infra)**
4. API keys + paid limit tier + Stripe, with a safe grandfather migration for existing free integrators.

**Retention + participation (parallel, low cost)**
- Share-link loop (#1) is the single best retention+growth mechanic - prioritize it.
- PWA install nudge at the success moment (returning users = retention).
- Lean on existing **history + templates** (endowment / IKEA effect - saved data brings them back).
- Collect 3-5 **testimonials** → social-proof block on homepage (lifts SEO CTR *and* affiliate conversion).

## Guardrails - what NOT to do
- **Never paywall or ad-load the core free generator.** "Free, no registration" is the USP and the SEO/WOM moat. Monetize adjacencies and the pro/B2B surfaces only.
- No irrelevant affiliates. Adjacency or nothing.
- Don't over-build donations - low ceiling by nature.
- Don't break the public API contract when tiering it.

## Open question
The original "2 options" framing was cut off (affiliate + one more, likely donations). This doc assumes affiliate + donations + surfaces the API tier as the underrated third. Confirm the intended second option before committing build effort.
