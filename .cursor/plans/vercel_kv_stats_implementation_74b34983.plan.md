---
name: Vercel KV Stats Implementation
overview: Add public statistics tracking using Vercel KV to display unique visitors, QR codes generated, and total revenue in a dedicated section on the homepage.
todos:
  - id: install-kv
    content: Install @vercel/kv package
    status: pending
  - id: api-stats-get
    content: Create GET /api/stats route to fetch all stats
    status: pending
  - id: api-stats-visit
    content: Create POST /api/stats/visit route for unique visitor tracking
    status: pending
  - id: api-stats-qr
    content: Create POST /api/stats/qr route for QR generation + revenue tracking
    status: pending
  - id: stats-section
    content: Create StatsSection component with 3 stat cards
    status: pending
  - id: track-visitor
    content: Create TrackVisitor client component for visitor counting
    status: pending
  - id: integrate-visitor
    content: Add TrackVisitor to layout.tsx
    status: pending
  - id: integrate-qr
    content: Call stats API from payment-qr-page.tsx on QR generation
    status: pending
  - id: add-stats-page
    content: Add StatsSection to page.tsx
    status: pending
---

# Vercel KV Stats Implementation

## Architecture

```mermaid
flowchart LR
    subgraph client [Client]
        A[Page Visit] --> B[POST /api/stats/visit]
        C[QR Generated] --> D[POST /api/stats/qr]
    end
    
    subgraph api [API Routes]
        B --> E[Increment visitor]
        D --> F[Increment QR + revenue]
        G[GET /api/stats] --> H[Return all stats]
    end
    
    subgraph kv [Vercel KV]
        E --> I[(stats:visitors)]
        E --> J[(stats:visitors_ips SET)]
        F --> K[(stats:qr_total)]
        F --> L[(stats:revenue)]
    end
    
    H --> I
    H --> K
    H --> L
```

## KV Data Structure

| Key | Type | Description |

|-----|------|-------------|

| `stats:visitors` | number | Total unique visitor count |

| `stats:visitors:ips` | SET | Hashed visitor IPs (for deduplication) |

| `stats:qr_total` | number | Total QR codes generated |

| `stats:revenue` | number | Sum of all payment amounts (EUR cents) |

## Files to Create/Modify

### 1. Install Vercel KV

```bash
bun add @vercel/kv
```

### 2. API Routes

**`app/api/stats/route.ts`** - GET endpoint to fetch all stats (public, cached 60s)

**`app/api/stats/visit/route.ts`** - POST to track unique visitors using hashed IP

**`app/api/stats/qr/route.ts`** - POST to increment QR count + add amount to revenue

### 3. Stats Components

**`components/stats-section.tsx`** - Dedicated stats display with 3 cards:

- Unique visitors (with user icon)
- QR codes generated (with QR icon)
- Total revenue in EUR (with currency icon)

### 4. Integration Points

**`app/page.tsx`** - Add `<StatsSection />` below the main content

**`components/payment-qr-page.tsx`** - Call `/api/stats/qr` after successful QR generation

**`app/layout.tsx`** - Add visitor tracking hook/component

### 5. Visitor Tracking

Create a client component `components/track-visitor.tsx` that fires once per session (using sessionStorage flag) to avoid over-counting page refreshes.

## Environment Variables Required

After running `vercel env pull`, these will be available:

- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`
- `KV_URL`

## Notes

- Revenue stored in **cents** (integers) to avoid floating point issues
- Visitor IPs are hashed (SHA-256) before storing for privacy
- Stats endpoint cached with `revalidate: 60` to reduce KV reads
- Use `INCRBYFLOAT` for revenue to handle decimal amounts if needed