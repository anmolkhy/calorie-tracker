# ADR 005: Smart Prompt Generator over Embedded AI for Meal Planning

**Date:** 2026-06-04  
**Status:** Accepted

---

## Context

Users need help planning ingredient quantities for new recipes to fit their remaining macro budget. They currently use ChatGPT or Gemini for this, manually typing their macro context each time. Two approaches were considered: embed an AI model via API inside the app, or generate a context-rich prompt that the user pastes into their preferred AI chat.

---

## Decision

Build a Smart Prompt Generator — the app assembles a structured prompt with the user's remaining macros, goal ratios, food database, and query. The user opens this in their preferred AI chat (Claude.ai, ChatGPT, etc.) via a button or clipboard copy. No AI API is embedded in the app.

Also build a rule-based Macro Calculator as the primary tool for the common case where the user knows what they're cooking and just needs quantities.

---

## Reasoning

- **Cost unpredictability** — embedding the Anthropic API means API costs scale with user queries. With no rate limiting, one user querying 50 times a day could generate significant costs. For a personal tool shared with friends, this is unacceptable.
- **User already has AI access** — the user actively uses Claude.ai and ChatGPT. Routing through their own account means they use their own quota, not the app's.
- **Context quality** — the prompt generator solves the actual friction: manually typing macro context into an AI chat every time. The generated prompt is better structured than anything the user would type manually, and includes their full food database.
- **Maintenance** — no API key management, no usage monitoring, no cost alerts, no rate limiting infrastructure needed.
- **Macro Calculator covers 80% of cases** — for the common scenario (user knows the ingredients, needs quantities), a pure math tool is faster and more precise than an AI response.

---

## Alternatives Considered

**Embedded Anthropic API with per-user rate limiting**
Rejected for v1. Would require: API key management, per-user usage tracking, rate limit UI, cost monitoring, and ongoing API cost. Viable for a later version if the app grows to a paid product.

**Embedded open-source model (e.g. via Ollama)**
Rejected. Requires server infrastructure beyond Vercel's serverless model. Significant latency on cold starts.

---

## Consequences

- Users must have their own AI chat account to use the Smart Prompt Generator — this is acceptable given the target user base
- The generated prompt must be well-structured enough to get high-quality responses from any major AI model
- The Macro Calculator is the zero-dependency fallback that works completely offline
- If the app ever moves to a paid model, embedded AI becomes viable and this decision should be revisited
