# QR Code Branding Feature Design

## Purpose & Scope

A branding customization feature that lets users personalize their payment QR codes while guaranteeing scan reliability. Target users are small entrepreneurs and freelancers who want professional-looking QR codes matching their business identity.

**Customization options:**
- Foreground and background colors (contrast-validated)
- Center logo (small, uploaded as image)
- Corner/eye shape variations (square, rounded, dots)
- Optional frame with custom text label (up to 40 characters)

**Storage approach:**
- Up to 3 brand presets saved in localStorage via Zustand
- Follows existing pattern from payment history store
- Logos stored as Base64 strings alongside preset metadata

**Constraints:**
- All options are "scan-safe" - conservative limits to ensure banking apps can read the code
- Color combinations validated for sufficient contrast
- Logo size limited to maintain QR error correction headroom

---

## Data Model

**Brand Preset Schema:**

```typescript
interface BrandPreset {
  id: string;                    // Unique identifier
  name: string;                  // User-defined name (e.g., "My Business")
  colors: {
    foreground: string;          // Hex color for QR pattern (e.g., "#000000")
    background: string;          // Hex color for background (e.g., "#FFFFFF")
  };
  logo?: {
    data: string;                // Base64-encoded image
    size: number;                // Percentage of QR code (10-20% range)
  };
  cornerStyle: 'square' | 'rounded' | 'dots';
  frame?: {
    enabled: boolean;
    text: string;                // Up to 40 characters
    position: 'top' | 'bottom';
  };
  createdAt: number;             // Timestamp for sorting
}
```

**Store structure:**

```typescript
interface BrandStore {
  presets: BrandPreset[];        // Max 3 items
  activePresetId: string | null; // Currently selected preset

  // Actions
  addPreset: (preset: Omit<BrandPreset, 'id' | 'createdAt'>) => void;
  updatePreset: (id: string, updates: Partial<BrandPreset>) => void;
  deletePreset: (id: string) => void;
  setActivePreset: (id: string | null) => void;
}
```

---

## UI Components & Layout

**New components to create:**

```
features/branding/
  components/
    brand-preset-card.tsx      # Display/select a saved preset
    brand-preset-editor.tsx    # Full editor form for creating/editing
    color-picker.tsx           # Color input with contrast validation
    logo-uploader.tsx          # Image upload with preview
    corner-style-picker.tsx    # Visual selector for square/rounded/dots
    frame-editor.tsx           # Toggle + text input + position
  schema.ts                    # Zod validation for BrandPreset
  store.ts                     # Zustand store with persist
  utils.ts                     # Contrast checking, image resizing
```

**Integration with existing UI:**

1. **Header** - Add a "Branding" button next to the history button (opens a sheet/drawer)
2. **Branding Sheet** - Lists saved presets (max 3) with "New Preset" option
3. **QR Preview Card** - Add a preset selector dropdown below the QR code, shows "Default" when no preset active
4. **Payment Form Card** - No changes needed; branding applies at generation time

**Editor flow:**
1. User opens Branding sheet → sees preset cards or empty state
2. Clicks "New Preset" or edit icon → opens editor in the sheet
3. Live preview of QR code updates as they adjust settings
4. "Save Preset" validates and stores; shows toast confirmation

---

## QR Generation Integration

**Extending the existing `qr-generator.ts`:**

```typescript
interface QRGeneratorOptions {
  // Existing
  paymentData: PaymentData;

  // New branding options
  branding?: {
    colors?: { foreground: string; background: string };
    logo?: { data: string; size: number };
    cornerStyle?: 'square' | 'rounded' | 'dots';
    frame?: { text: string; position: 'top' | 'bottom' };
  };
}
```

**Generation pipeline:**

1. **Base QR** - Generate with custom foreground/background colors
2. **Corner styling** - Redraw corner "eyes" with selected style (requires canvas manipulation after initial render)
3. **Logo overlay** - Draw resized logo in center (replaces current text overlay when logo present)
4. **Frame** - Expand canvas, draw border and text above/below QR

**Contrast validation (in `utils.ts`):**
- Calculate WCAG contrast ratio between foreground/background
- Require minimum 4.5:1 ratio (AA standard)
- Show warning in color picker if contrast too low

**Logo processing:**
- Resize to max 100x100px on upload (keeps Base64 small)
- Limit center coverage to 15-20% of QR area
- QR already uses high error correction (L→H bump if logo present)

---

## Error Handling & Edge Cases

**Validation errors (prevent save):**
- Color contrast below 4.5:1 ratio → inline error on color picker
- Logo file too large (>500KB before resize) → toast error on upload
- Logo format not supported (only PNG, JPG, SVG) → toast error
- Preset name empty or duplicate → inline error on name field
- Frame text exceeds 40 characters → character counter turns red, save disabled
- Trying to add 4th preset → "New Preset" button disabled with tooltip

**Runtime edge cases:**
- Preset deleted while active → fall back to default (no branding)
- Corrupted Base64 logo data → skip logo, render QR without it, show toast warning
- localStorage full → toast error "Storage full, delete a preset to save new one"

**Migration:**
- Existing users have no branding store → initialize with empty presets array
- No migration needed for payment history (unchanged)

**Fallback behavior:**
- If `activePresetId` points to deleted preset → reset to `null`
- If any branding option fails during generation → generate default QR, log error

---

## Implementation Notes

**Dependencies:**
- No new packages needed - existing `qrcode` library supports color options
- Canvas API handles logo drawing and corner manipulation
- Consider adding a simple contrast calculation utility (pure function, no library)

**Scan-safe constraints (hardcoded limits):**

| Element | Constraint |
|---------|-----------|
| Logo size | 15-20% of QR area max |
| Color contrast | 4.5:1 minimum ratio |
| Corner styles | 3 predefined options only |
| Error correction | Level H (30%) when logo present |
| Frame padding | Fixed 16px, doesn't obscure QR |

**Performance considerations:**
- Debounce live preview updates (300ms) during color/text editing
- Resize logo on upload, not on every generation
- Cache generated QR canvas when only downloading/sharing (no regeneration)

**Analytics events (extend existing pattern):**
- `preset_created` - User saves a new brand preset
- `preset_applied` - User generates QR with branding
- `logo_uploaded` - User adds a logo to preset

**Out of scope (potential future additions):**
- Gradient colors
- Custom fonts for frame text
- QR code shape masks (circular, custom outline)
- Preset sharing/export
