# ADR 006: Data Informs, Never Judges — UX Principle 11

**Date:** 2026-06-04  
**Status:** Accepted

---

## Context

During UX principle definition, a question arose about how the app should treat over-goal states and imperfect tracking days (cheat meals, restaurant estimates, days where macros aren't fully tracked). Two philosophies were considered: honest-and-neutral vs. motivational feedback.

---

## Decision

The app records data without editorial comment. Over-goal states use visual distinction for legibility (red for over-budget numbers) but never use punitive language, alarm iconography, or motivational messaging. Quick log entries (restaurant meals, estimates) blend into the log without being flagged or asterisked. The app never tells the user they succeeded or failed.

---

## Reasoning

- **Tracking is a tool, not a scoreboard** — the app's job is to give accurate information, not to evaluate behaviour. The user decides what the data means.
- **Extremism isn't sustainable** — the user explicitly noted that being over on a macro occasionally is normal and healthy. An app that makes users feel bad about it will be abandoned.
- **Overalls matter, not individual data points** — a single day's cheat meal is irrelevant in the context of weekly averages. The app should support this view, not contradict it.
- **Red means "different", not "wrong"** — red colour on over-goal numbers serves a legibility function (easy to spot at a glance) not a moral function.
- **No "estimated" badges on quick log entries** — the user made an approximation. Flagging it in the log and history would feel like the app pointing a finger. The data goes in, it counts, life goes on.

---

## Alternatives Considered

**Motivational messaging ("Great job hitting your protein goal!")**
Rejected. Patronising and adds noise. The numbers speak for themselves.

**Warning states for consecutive over-goal days**
Rejected. The app has no context for why the user is over — illness, social event, intentional bulk. Any warning would be presumptuous.

**"Estimated" or "approximate" badge on quick log entries**
Rejected. The user explicitly said "man had a cheat meal, let him live." Marking entries as estimates in the visible log adds stigma to normal human behaviour.

---

## Consequences

- Quick log entries appear identically to regular log entries in the log and history views
- The only over-goal indicator is the number turning red and a "X kcal over" text — both legibility aids, not warnings
- The dashboard shows a subtle "X kcal not macro-tracked" note when quick log entries exist — informational only, in the dimmest text colour
- No streak tracking, no achievement badges, no "you're X% to your goal" motivational copy anywhere in the app
- Insights feature (future roadmap) must follow the same principle — present data, draw no conclusions
