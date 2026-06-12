# Spec: Frictionless Calorie Log

**Status:** Done  
**Author:** Anmol  
**Date:** 2026-06-04  
**Related specs:** None

---

## Problem

When eating at a restaurant, office, or any situation where the user didn't prepare the meal, they have no macro breakdown available. The current logging flow requires selecting a food from the database and entering grams — neither of which is possible when you don't know what went into the meal. The result: the user either skips logging entirely or goes through a cumbersome workaround involving external tools to estimate and then manually create a food entry.

The user wants to close the loop quickly and move on. They accept the data is approximate. They don't want the app to make them feel bad about it.

---

## Solution

Add a "Quick Log" entry mode on the dashboard. The user enters a calorie number and an optional note. No food search, no macro entry, no database required. The entry appears in the daily log like any other entry. Calories count towards the day total. Macros are not fabricated — the macro bars visually indicate that some calories in the day are not macro-tracked, without making it a prominent or judgmental indicator.

---

## Scope

### In
- Quick Log button/entry point on the dashboard
- Input: calorie number (required) + note (optional, e.g. "Restaurant lunch")
- Entry stored as a log_entry with food_id pointing to a reserved system food called "Quick Log"
- Calories contribute to daily calorie total
- Macro bars show only tracked macros — not pro-rated or fabricated values
- Subtle visual indicator on the dashboard that the day has untracked macros
- Entry appears in today's log and history like any other entry — no special badge or flag visible to the user
- Deletable like any other entry

### Out
- No macro estimation or pro-rating
- No "estimated" or "approximate" label on the entry in the log or history
- No guilt-inducing UI treatment
- No breakdown required — calories only is sufficient
- No changes to history page — blends in as a normal entry

---

## User Stories

- As a user eating at a restaurant, I want to log approximate calories in under 10 seconds so I can close the loop and move on without interrupting my meal
- As a user reviewing my history, I want quick log entries to appear normally so I don't feel judged for days I ate out
- As a user checking my dashboard, I want to see my calorie total accurately even when I don't have macro data for every meal

---

## Acceptance Criteria

- [x] Quick Log is accessible from the dashboard in 1 tap
- [x] The input accepts a calorie number and an optional text note
- [x] Submitting the form adds the entry to today's log within 1 second
- [x] The daily calorie total updates immediately to include the quick log entry
- [x] Macro bars (protein, carbs, fat) do not change — they reflect only entries with macro data
- [x] The dashboard shows a subtle, non-alarming indicator when the day has calories without macro breakdown (e.g. a small note under the macro bars: "X kcal not macro-tracked")
- [x] The entry appears in today's log with the note as the food name and the calorie count
- [x] The entry appears in history as a normal entry — no special treatment
- [x] The entry can be deleted like any other log entry
- [x] No moral language anywhere — no "cheat", no "estimated", no warnings

---

## Data Changes

### New system food record (seeded, not user-visible in food search)
```
id: reserved (e.g. -1 or a known fixed ID)
name: 'Quick Log'
calories_per_100g: 100
protein_per_100g: 0
carbs_per_100g: 0
fat_per_100g: 0
category: 'system'
is_custom: 0
```
This is a dummy food used as the food_id anchor for quick log entries. The actual calorie value is stored via quantity_grams (e.g. 600 kcal = 600g of this food at 100 kcal/100g).

### Modified tables
`log_entries` — no schema change. Quick log entries use the existing structure. The note is stored in a new optional `note` column.

```sql
ALTER TABLE log_entries ADD COLUMN note TEXT;
```

### New API routes
`POST /api/log/quick` — accepts `{ calories: number, note?: string, date?: string }`

### Modified API routes
`GET /api/log` — must return `note` field on each entry  
Dashboard total calculation must correctly handle quick log entries

---

## UI Changes

- **Dashboard** — new "Quick Log" entry point alongside "+ Log Food" and "◈ Log Meal"
- **Dashboard macro section** — subtle text below macro bars when day has untracked calories: "X kcal not macro-tracked" in `var(--text-dim)`, small mono text, no icon, no colour emphasis
- **LogEntryRow component** — display `note` as food name when present, show calorie count, no macro breakdown shown for quick log entries (nothing to show)
- **FoodSearch** — no change. Quick log bypasses food search entirely

---

## UX Validation

- [x] Primary action completable in ≤ 3 taps (tap Quick Log → enter calories → submit)
- [x] Numbers are visually dominant — calorie total updates immediately
- [x] No unnecessary confirmation dialogs
- [x] Primary CTA accessible from dashboard (thumb zone)
- [x] Complexity is earned — macro indicator only appears when relevant
- [x] Data representation is honest — macro bars don't show fabricated data
- [x] Over-goal states not punitive — no moral language anywhere
- [x] Consistent with existing log entry patterns
- [x] Should submit within 1 second
- [x] No error states expected for normal use; if submission fails, show inline error

---

## Open Questions

- [x] Where exactly does the Quick Log button live on the dashboard? Decision: third dashboard action alongside Log Food and Log Meal.
- [x] Should quick log entries be excluded from macro averages in the history page? Decision: no special history handling for v1; quick logs count toward calories and contribute zero tracked macros.

---

## Implementation Notes

- Added `note TEXT` to `log_entries` with an idempotent startup migration.
- Added reserved system food id `-1` (`Quick Log`) with 100 kcal per 100g and zero macros.
- Added `POST /api/log/quick` so the client does not need to know the reserved food id.
- Updated `GET /api/log` to return `note`, `is_quick_log`, and `untrackedCalories`.
- Hid `category = 'system'` foods from normal food search.
- Added dashboard Quick Log panel and a subtle untracked-calorie note under macro bars.
- Updated `LogEntryRow` to show quick logs as note/name plus calories only.

---

## Changelog

- 2026-06-04 — Initial spec written and approved
- 2026-06-12 — Implemented, verified, and marked done
