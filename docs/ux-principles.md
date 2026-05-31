# Macros — UI/UX Principles

These are the governing design principles for every screen, interaction, and feature in this app. They are specific to Macros and how it is used daily. Every new feature is validated against these before it is considered done.

---

## Principles

### 1. Speed over completeness
Every interaction must be completable in under 3 taps. The critical path — log a food — is: search → select → enter grams → log. If a feature adds steps to this path, it must justify the addition explicitly in its spec. We never add steps for the sake of features.

### 2. Numbers are the hero
This is a data app. The most important elements on every screen are the numbers — calories consumed, macros remaining, grams logged. Typography hierarchy, sizing, and color must always prioritise number legibility over decorative or structural elements. If a number is hard to read at a glance, the design has failed.

### 3. No confirmation theatre
Do not ask "are you sure?" for low-stakes reversible actions. Deleting a log entry is reversible by re-logging. Confirmations add daily friction. Reserve them only for truly destructive, irreversible actions — and even then, consider undo over confirmation.

### 4. Mobile thumb zone first
Primary actions — Log Food, Log Meal, delete an entry — must be reachable with one thumb without repositioning the hand. Bottom navigation is correct. Primary CTAs belong in the lower half of the screen. Information lives at the top, actions at the bottom. Every layout decision is made for a 390px wide screen held in one hand.

### 5. Earned complexity
Show only what is needed for the current task. Detail is revealed progressively — not dumped on screen upfront. The food search panel appears when needed and disappears after logging. Meal totals appear when items are added. Nothing is shown before the user has indicated they need it.

### 6. Honest data, honest UI
If a macro bar is at 0% it must look like 0%. If calories are over goal, it must be visually distinct. The UI never softens, rounds, or hides the actual numbers. No "good job" messaging, no progress bars that look fuller than the data supports. The numbers shown must be exactly the numbers calculated.

### 7. Forgettable chrome, memorable data
The interface should disappear. Navigation, headers, labels — all recede so the data stands out. The app's job is to show the user their numbers, not to show the user itself. Structural elements use low contrast. Data uses high contrast.

### 8. Consistency over creativity
Every food entry looks the same. Every macro bar works the same way. Every card has the same padding and border treatment. Consistency reduces cognitive load — the user stops reading the UI and starts reading the data. No one-off layouts for individual screens without explicit justification in the spec.

### 9. Respect the user's time
The app is opened multiple times a day, every day. Loading states must be instant or near-instant. No splash screens after first launch. No re-prompting for things already configured. The dashboard must show today's data within one second of opening on a standard mobile connection.

### 10. Errors are informative, not alarming
When something goes wrong, the message says exactly what and what to do. "Server error" is not acceptable as user-facing copy. "Food not found — try a different name or add it as a custom food" is. Error states are calm, specific, and actionable. They never blame the user.

### 11. Data informs, never judges
Over-goal states are presented with visual distinction for legibility — not with punitive language or alarm-state design. Going over on a macro is a data point, not a failure. The app records what happened. It does not evaluate whether the user succeeded or failed. Positive or negative framing is always the user's prerogative, not the app's. Red means "this number is different in nature, pay attention" — it does not mean "you did something wrong."

---

## UX Validation Checklist

Every feature must pass this checklist before it is considered done. This is included in every spec and reviewed before merge.

```
## UX Validation
- [ ] Primary action completable in ≤ 3 taps
- [ ] Numbers are visually dominant on this screen
- [ ] No unnecessary confirmation dialogs added
- [ ] Primary CTA is in thumb zone on mobile (lower half of screen)
- [ ] Complexity is earned — nothing shown before the user needs it
- [ ] Data representation is honest — no softening, rounding, or hiding
- [ ] Over-goal states are visually distinct but not punitive in language or design
- [ ] Consistent with existing patterns (card, input, button, macro bar)
- [ ] Loads within 1 second on mobile
- [ ] Error states are specific and actionable, not generic
```

---

## Known Current Violations (Backlog)

These are existing issues identified against the principles above. They feed into the feature backlog.

| Principle | Violation | Priority |
|---|---|---|
| Speed over completeness | No recent/frequent foods — user must search every time | High |
| Numbers are hero | Dashboard macro numbers small relative to card on mobile | Medium |
| Mobile thumb zone | Log Food / Log Meal buttons mid-screen, not bottom-anchored | Medium |
| Earned complexity | Food search opens before any input | Low |
| Respect user's time | No optimistic UI — every action waits for server response | Low |
