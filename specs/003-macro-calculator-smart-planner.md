# Spec: Macro Calculator + Smart Meal Planner

**Status:** Approved
**Author:** Anmol
**Date:** 2026-06-04
**Related specs:** None

---

## Problem

When the user wants to cook a new recipe or a meal they haven't logged before, they don't know what quantities of each ingredient to use to stay within their remaining macro budget. Currently they switch to ChatGPT or Gemini, manually type their remaining macros and goals, describe what they want to cook, and get a suggestion back. This works but has two problems:

1. Context has to be manually transferred every time — remaining macros, goal shape, food preferences
2. It happens outside the app, breaking the tracking loop

The user needs help with quantity planning approximately twice a week, always for the same type of question: "I want to make X. How much of each ingredient should I use to match my usual macro shape for this meal without overshooting?"

---

## Solution

Two complementary tools:

**Tool 1 — Macro Calculator**
A constraint-based ingredient quantity calculator. User selects ingredients from their food database, sets a calorie target, and the calculator suggests quantities for each ingredient that hit the target while maintaining a macro ratio. Pure math, no AI, no API cost, works offline.

Covers the most common scenario: user knows what they're cooking, just needs the quantities.

**Tool 2 — Smart Prompt Generator**
A "Plan with AI" button that opens the user's preferred AI chat (Claude.ai, ChatGPT, or any) with a pre-built prompt that includes:

- Their remaining macros for today
- Their calorie budget for the meal
- Their typical macro ratio (derived from their goals)
- Their food database (or relevant subset)
- Their natural language query

The user describes what they want to cook in a text field. The app assembles the full context and opens the AI chat with everything pre-loaded. One tap, full context, no manual typing.

Covers the open-ended creative scenario: user isn't sure what to cook or wants a conversational back-and-forth.

Zero API cost for either tool. The user uses their own AI account for Tool 2.

---

## Scope

### In

**Macro Calculator**

- Accessible from the dashboard when there are remaining calories for the day
- User selects 2-6 ingredients from their food database
- User sets a target calorie range (e.g. 600-700 kcal)
- Optional: set a protein floor (e.g. "at least 40g protein")
- Calculator outputs suggested quantity in grams for each ingredient
- User can adjust individual quantities and see totals recalculate in real time
- "Log this meal" button — logs all ingredients as individual entries for today

**Smart Prompt Generator**

- "Plan with AI" button on dashboard
- Text field: user describes what they want to cook
- App assembles a structured prompt with: remaining macros, goal macro ratio, relevant foods from database, user's query
- "Open in Claude" button — opens claude.ai with prompt pre-filled via URL or clipboard copy
- "Copy prompt" fallback — copies full prompt to clipboard for any AI chat

### Out

- No AI embedded in the app — no Anthropic API calls
- No automatic meal suggestions without user input
- No integration with external recipe databases
- No saving of calculator sessions (user can log the result but the calculator resets)
- Macro Calculator does not do complex optimisation — it uses a simple proportional approach, not linear programming

---

## User Stories

- As a user wanting to make pasta, I want to select my ingredients and get gram quantities that fit my remaining macro budget so I don't have to do the math manually
- As a user with 700 kcal left, I want to describe "I want to make a chicken stir fry" and get a complete context-rich prompt I can paste into Claude so I don't have to manually type my macros every time
- As a user after using the calculator, I want to log the suggested quantities directly to today's log in one tap

---

## Acceptance Criteria

**Macro Calculator**

- [ ] Accessible from dashboard in ≤ 2 taps when calories remain for the day
- [ ] User can search and select ingredients from their personal food database
- [ ] User can set a calorie target (number input) and optional protein floor
- [ ] Calculator displays suggested quantities for each ingredient
- [ ] Adjusting any quantity updates all totals in real time
- [ ] Total calories, protein, carbs, fat shown as user adjusts
- [ ] "Log this meal" logs all entries to today and returns to dashboard
- [ ] Works entirely offline — no API calls

**Smart Prompt Generator**

- [ ] Accessible from dashboard
- [ ] Text field accepts user's meal description
- [ ] Generated prompt includes: today's remaining macros, goal macro ratios, list of relevant foods from user's database with their per-100g macros, user's query
- [ ] "Open in Claude" button opens claude.ai in new tab with prompt pre-filled (via URL parameter or clipboard)
- [ ] "Copy prompt" copies the full assembled prompt to clipboard
- [ ] Prompt is readable and well-structured — not a data dump

---

## Data Changes

### New tables

None

### Modified tables

None

### New API routes

`GET /api/log/remaining` — returns today's remaining macros (calories, protein, carbs, fat) for the current user. Used to assemble the smart prompt and pre-fill the calculator target.

### Modified API routes

None

---

## UI Changes

- **Dashboard** — new "Plan a Meal" or "Macro Planner" entry point. Visible when there are remaining calories for the day. Can be a secondary action below the main Log Food / Log Meal buttons.
- **New MacroCalculator component** — ingredient selector (reuses FoodSearch pattern), calorie target input, protein floor input, results table with editable quantities, running totals, log button
- **New SmartPrompt component** — text input for meal description, assembled prompt preview (collapsible), Open in Claude button, Copy button

---

## UX Validation

- [x] Macro calculator primary flow completable in ≤ 5 taps (select ingredients → set target → view result → log)
- [x] Numbers are the hero — quantities and totals are large and prominent
- [x] No unnecessary confirmations — "Log this meal" logs directly
- [x] Entry points in lower dashboard area (thumb zone)
- [x] Complexity earned — calculator only shown when relevant (calories remaining)
- [x] Data honest — calculator shows exactly what macros the suggested quantities produce
- [x] Consistent with existing food search and log patterns
- [x] Calculator recalculates instantly on any input change
- [x] Smart prompt error state: "Add some foods to your database first" if database is empty

---

## Open Questions

- [ ] How does the calculator suggest initial quantities? Options: (a) equal calorie split across ingredients, (b) user sets a ratio per ingredient, (c) start from 100g each and scale to target. Option (c) is simplest for v1.
- [ ] Should the calculator remember the last session within a day? (e.g. if user goes back to dashboard and returns, does it restore?) Decision: no, keep it stateless for v1.
- [ ] For the smart prompt, should we include the full food database or just the top 20 most-logged foods? Full database could make the prompt very long. Decision: top 20 most-logged + any food mentioned in the user's query if found in the database.
- [ ] Does "Open in Claude" work reliably via URL parameter on mobile? Test during implementation — clipboard copy is the safe fallback.

---

## Implementation Notes

### Macro Calculator algorithm (v1 — simple proportional)

```
1. Start with 100g of each selected ingredient
2. Calculate total calories at 100g each
3. Scale factor = target_calories / total_calories_at_100g
4. Apply scale factor to all quantities
5. Round to nearest 5g for readability
6. If protein_floor set and not met, increase protein-dense ingredients proportionally
```

### Smart Prompt template

```
I'm tracking my macros and need help planning a meal.

My remaining budget for today:
- Calories: {remaining.calories} kcal
- Protein: {remaining.protein}g
- Carbs: {remaining.carbs}g
- Fat: {remaining.fat}g

My typical macro ratio for meals (based on daily goals):
- Protein: {goalPercent.protein}% of calories
- Carbs: {goalPercent.carbs}% of calories
- Fat: {goalPercent.fat}% of calories

Foods in my database I commonly use:
{topFoods.map(f => `- ${f.name}: ${f.calories_per_100g} kcal, ${f.protein_per_100g}g P, ${f.carbs_per_100g}g C, ${f.fat_per_100g}g F per 100g`).join('\n')}

What I want to cook:
{userQuery}

Please suggest ingredient quantities in grams that fit my remaining budget and match my usual macro ratio as closely as possible.
```

---

## Changelog

- 2026-06-04 — Initial spec written and approved
