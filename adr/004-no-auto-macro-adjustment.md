# ADR 004: No Auto-Adjustment of Macros from Calorie Goal

**Date:** 2026-05-04  
**Status:** Accepted

---

## Context

The Goals settings page has both a calorie goal field and individual macro fields (protein, carbs, fat). A natural question arose: should changing the calorie goal automatically redistribute macros, or should changing a macro automatically adjust the calorie goal?

---

## Decision

No auto-adjustment in either direction. Calorie goal and macro goals are independent inputs. A "Sync" button appears when they diverge by more than 50 kcal, allowing the user to set the calorie goal to match the implied calories from their macros. The macro split donut shows the gap explicitly.

---

## Reasoning

- **User intent is ambiguous** — if protein goes up, should carbs decrease or fat decrease? The app cannot know the user's preference. Silent auto-adjustment would change numbers the user deliberately set.
- **Goals are independent targets** — a user may want 160g protein, 200g carbs, and 65g fat regardless of whether those sum to exactly their calorie goal. The goals are directional targets, not a zero-sum budget.
- **Honest over convenient** — the donut chart shows the gap between macros and calorie goal visually. The user can see the misalignment and decide what to do. The Sync button offers a one-tap resolution if they want it.
- **Principle 6** — the UI never softens or hides data. Showing a gap is more honest than silently resolving it.

---

## Alternatives Considered

**Auto-adjust calorie goal when macros change**
Rejected. Makes the calorie goal field redundant and confusing — why have it if it just mirrors the macro sum?

**Auto-adjust macros proportionally when calorie goal changes**
Rejected. Which macro adjusts? By what ratio? Silent changes to numbers the user set are worse than showing a mismatch.

**Lock macros to sum to calorie goal**
Rejected. Overly constraining. Users should be able to set aspirational targets even if they don't perfectly balance.

---

## Consequences

- The Sync button in settings is the intended resolution path for users who want their calorie goal to match their macro sum
- The donut chart gap segment appears when divergence ≥ 5% of calorie goal
- The orange warning strip appears when divergence > 50 kcal
- This decision may be revisited if a "recommend macros from calorie goal" feature is built — that is a separate, additive feature, not a change to the current behaviour
