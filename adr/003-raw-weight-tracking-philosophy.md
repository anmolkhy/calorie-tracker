# ADR 003: Raw Weight Tracking as Core Philosophy

**Date:** 2026-04-25  
**Status:** Accepted

---

## Context

When designing the food database and logging system, a fundamental decision was made about what the macros represent — prepared dish estimates or raw ingredient weights.

---

## Decision

All foods in the database store macros per 100g of raw, uncooked ingredient. All meal logging is based on raw weights before cooking. No prepared dish estimates are seeded in the database.

---

## Reasoning

- **Accuracy** — cooking changes weight (water loss, absorption) in unpredictable ways depending on method, duration, and equipment. Raw weights are consistent and measurable.
- **Verifiability** — USDA and IFCT databases publish raw ingredient data. Product labels show raw/unprocessed values. Prepared dish data is always an estimate based on an assumed recipe.
- **User honesty** — "dal tadka" means different things in different kitchens. A user's dal tadka is their actual ingredients at their actual quantities — not an averaged estimate from a crowdsourced database.
- **Composability** — any prepared dish can be constructed from raw ingredients using the Fixed Meals feature. The user's meal template for "Dal Tadka" uses their actual toor dal quantity, their actual oil amount, their actual onion weight.
- **This is how accurate tracking is done** — athletes, dietitians, and serious trackers always use raw weight. The app is designed for users who want accurate data, not convenient approximations.

---

## Alternatives Considered

**Prepared dish database (like MyFitnessPal)**
Rejected. Crowdsourced prepared dish data is unreliable — duplicate entries, wrong values, regional variation, assumed recipes. The primary complaint about existing trackers that motivated building this app.

**Cooked weight tracking**
Rejected. Requires knowing the cooked-to-raw ratio for each food, which varies by cooking method. Adds complexity without improving accuracy.

---

## Consequences

- Users must weigh raw ingredients, not cooked food
- Fixed Meals feature is essential — without it, users would have to log every ingredient of a recurring meal individually every time
- The food database contains only raw ingredients and packaged products (which are pre-portioned and label-verified)
- "Quick Log" feature (spec 001) exists as the escape hatch for situations where raw weight tracking is impossible (restaurant meals, office food)
