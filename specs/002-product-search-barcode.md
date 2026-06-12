# Spec: Product Search + Barcode Scanner

**Status:** Approved  
**Author:** Anmol  
**Date:** 2026-06-04  
**Related specs:** None

---

## Problem

When the user buys a packaged product they haven't logged before — from a supermarket, quick commerce, or online — they have to manually look up the macros from an external source and type everything in through the "Add Custom Food" flow. This is high friction: open packaging or product page, find nutrition label, switch to app, navigate to Foods, fill in 5 fields, save. The user already has the label in front of them. The problem is the transcription step.

---

## Solution

Two complementary entry points for adding packaged foods to the personal database:

**1. Product name search via Open Food Facts**
Search for a product by name. Open Food Facts returns matching products with macros from their label data. User selects the correct product, verifies the numbers match what's on their packaging, and confirms. The food is added to their personal database immediately and available for logging.

**2. Barcode scanner**
On mobile, tap a scan button. Camera opens. Point at product barcode. Open Food Facts returns the exact product. User verifies and confirms. Faster than name search for products in hand.

Both flows end at the same verification screen — user sees the pulled data and confirms before anything is saved. They are the last check, not a passive recipient.

---

## Scope

### In
- Product name search against Open Food Facts API from the Foods page
- Barcode scanner using device camera from the Foods page and from the dashboard Log Food panel
- Verification screen showing pulled data before saving — user can edit any field before confirming
- On confirm, food is saved to user's personal database as a custom food (is_custom = 1)
- Available for logging immediately after adding
- Works on mobile (primary) and desktop (name search only — no camera on most desktops)

### Out
- No automatic logging without user verification — verification step is mandatory
- No bulk import
- No barcode scanning on desktop (graceful fallback to name search)
- No syncing with Open Food Facts — one-way pull only
- No rating or flagging of Open Food Facts data quality
- Not replacing the existing manual "Add Custom Food" flow — this is additive

---

## User Stories

- As a user buying a new packaged product, I want to scan its barcode and have the macros pulled automatically so I can verify and add it in under 30 seconds
- As a user searching for a product I just bought online, I want to type its name and find it so I don't have to manually enter all the macro fields
- As a user verifying pulled data, I want to be able to edit any field before saving so I can correct any inaccuracies

---

## Acceptance Criteria

- [ ] A "Search Products" or scan entry point is visible on the Foods page
- [ ] Name search queries Open Food Facts and returns results within 2 seconds
- [ ] Each result shows: product name, brand, calories per 100g, protein, carbs, fat
- [ ] Tapping a result opens a verification screen pre-filled with the pulled data
- [ ] All fields on the verification screen are editable before saving
- [ ] Confirming saves the food as a custom food in the user's database
- [ ] The saved food is immediately searchable and loggable
- [ ] Barcode scanner opens device camera on tap (mobile only)
- [ ] Successful barcode scan jumps directly to the verification screen
- [ ] If barcode not found in Open Food Facts, user is shown a message and falls back to manual entry with the search field pre-filled
- [ ] If Open Food Facts is unreachable, user sees a clear error and falls back to manual entry
- [ ] The existing "Add Custom Food" manual flow is unchanged

---

## Data Changes

### New tables
None — saved foods use the existing `foods` table with `is_custom = 1`

### Modified tables
None

### New API routes
`GET /api/foods/search-product?q=[name]` — proxies Open Food Facts name search, returns normalised results  
`GET /api/foods/barcode?code=[barcode]` — proxies Open Food Facts barcode lookup, returns single product or 404

Proxying through our API (rather than calling Open Food Facts directly from the client) keeps the Open Food Facts endpoint hidden, allows us to normalise the response shape, and lets us add caching later.

### Modified API routes
None

---

## External API

**Open Food Facts**
- Base URL: `https://world.openfoodfacts.org`
- Barcode lookup: `GET /api/v0/product/[barcode].json`
- Name search: `GET /cgi/search.pl?search_terms=[q]&json=1&fields=product_name,brands,nutriments`
- Free, no API key required
- Rate limit: reasonable use, no hard limit published
- Response normalisation needed: OFF returns nested `nutriments` object with keys like `energy-kcal_100g`, `proteins_100g`, `carbohydrates_100g`, `fat_100g`

---

## UI Changes

- **Foods page** — new "Search Products" button alongside existing "+ Add Food" button. On mobile, a separate "Scan Barcode" button with camera icon
- **New ProductSearch component** — search input, results list showing product name + brand + key macros per 100g
- **New ProductVerify component** — pre-filled form with all macro fields editable, "Add to My Foods" confirm button
- **Log Food panel (dashboard)** — add barcode scan icon to the search bar for quick scanning while logging

---

## UX Validation

- [x] Primary action (scan barcode → verify → add) completable in ≤ 3 taps
- [x] Numbers are shown clearly on verification screen
- [x] No unnecessary confirmations — one verification step, that's it
- [x] Scan button accessible from dashboard log panel (thumb zone)
- [x] Complexity earned — verification screen only appears after a result is found
- [x] Data is shown honestly — user sees exactly what was pulled, nothing hidden
- [x] Consistent with existing "Add Custom Food" form patterns
- [x] Search results within 2 seconds on mobile connection
- [x] Error states specific: "Product not found", "Unable to reach product database — add manually"

---

## Open Questions

- [ ] Should we cache Open Food Facts results locally to reduce repeat API calls for the same barcode? (Nice to have, not required for v1)
- [ ] If a product is already in the seeded food database, should we detect and skip the add step? (Probably not worth the complexity for v1)
- [ ] Which barcode scanning library to use on mobile web? Options: `@zxing/browser` (open source, well maintained) or native browser BarcodeDetector API (not universally supported yet). Decision: `@zxing/browser` for v1.

---

## Implementation Notes

_To be filled during build._

---

## Changelog

- 2026-06-04 — Initial spec written and approved
