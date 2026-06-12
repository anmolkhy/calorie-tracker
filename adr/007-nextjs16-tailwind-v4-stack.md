# ADR 007: Next.js 16 + Tailwind CSS v4 Stack Decisions

**Date:** 2026-04-26  
**Status:** Accepted

---

## Context

Several framework-level decisions were made during initial scaffolding that have downstream consequences for how the codebase is structured and how AI agents should work with it.

---

## Decision

Use Next.js 16 (App Router) with Tailwind CSS v4, TypeScript strict mode, and the `src/` directory convention.

---

## Critical Implementation Details

### Tailwind CSS v4 — not v3
The project uses Tailwind v4 which has significant differences from v3:
- Import syntax: `@import "tailwindcss"` not `@tailwind base/components/utilities`
- No `tailwind.config.ts` file — configuration is in CSS
- `@layer components` in `globals.css` defines reusable classes (`.card`, `.btn-primary`, `.input-field`, etc.)
- **Do not use Tailwind color utility classes** (`text-green-400`, `bg-gray-800`) — use CSS variables via `style={{}}` instead
- All design tokens are CSS variables defined in `globals.css`

### CSS Variables — the design token system
```css
--bg, --surface, --surface-2, --border, --border-hover
--text, --text-muted, --text-dim
--accent (#c8f135), --accent-dim, --accent-subtle
--red, --red-subtle, --orange, --blue
--protein (#4488ff), --carbs (#ff8c00), --fat (#cc44ff), --calories (#c8f135)
```

### Next.js 16 — proxy.ts not middleware.ts
Next.js 16 renamed middleware to proxy. Route protection lives in `src/proxy.ts` exporting a `proxy` function, not `middleware`. The old `middleware.ts` convention is deprecated and shows a warning.

### Next.js 15+ — async params in dynamic routes
```typescript
// Correct
type RouteParams = { params: Promise<{ id: string }> };
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
}
// Wrong — will break
export async function GET(req, { params }: { params: { id: string } }) {
  const id = params.id; // sync access no longer works
}
```

### Button width — fullWidth prop, not CSS class
The `.btn-primary` CSS class does NOT include `width: 100%`. Width is controlled exclusively by the `fullWidth` prop on the `Button` component or `flex-1`/`w-full` Tailwind classes at the call site. Adding `width: 100%` to `.btn-primary` breaks button layout across the app.

### Component styling pattern
```tsx
// Correct — CSS class for component-level styles
<div className="card flex flex-col gap-4">

// Correct — inline style for dynamic/token values  
<span style={{ color: 'var(--accent)' }}>

// Wrong — Tailwind color class
<span className="text-green-400">
```

---

## Consequences

- Every AI agent working on this codebase must read this ADR before writing any CSS or component code
- The absence of a `tailwind.config.ts` file is intentional — do not create one
- Component-level styles belong in `globals.css` under `@layer components`, not in component files as inline styles or separate CSS modules
- The `src/` directory is enforced — all application code lives under `src/`
