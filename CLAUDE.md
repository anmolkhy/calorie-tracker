# CLAUDE.md — Macros Calorie Tracker

This file is the entry point for any AI agent or LLM working on this project. Read this before touching any code.

---

## What This Project Is

A personal calorie and macro tracker built for daily mobile use. The core philosophy: track raw ingredient weights using verified nutrition data from product labels — not crowdsourced estimates or prepared dish averages.

Built for one primary user initially, now shared with a small group. Every design and engineering decision optimises for speed of daily use, data accuracy, and mobile-first experience.

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router) | Uses `src/` directory, route groups |
| Database | Turso (libSQL / SQLite) | Async client — all queries are awaited |
| Auth | JWT in httpOnly cookies | `jose` library, 7-day expiry |
| Styling | Tailwind CSS v4 + CSS variables | See globals.css for all design tokens |
| Language | TypeScript | Strict mode |
| Deployment | Vercel | Auto-deploys on push to main |
| PWA | manifest.json + sw.js | Installable on mobile home screen |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Public pages: login, register
│   ├── (app)/               # Protected pages (require session)
│   │   ├── dashboard/       # Today's log — main daily screen
│   │   ├── history/         # 7-day history with bar chart
│   │   ├── meals/           # Fixed meal template management
│   │   ├── foods/           # Food database browser + custom foods
│   │   └── settings/        # Daily goals (calories + macros)
│   └── api/                 # All API routes
│       ├── auth/            # login, register, logout, me
│       ├── foods/           # CRUD for foods
│       ├── meals/           # CRUD for meal templates
│       ├── log/             # Daily log entries, week summary
│       └── goals/           # User macro targets
├── components/
│   ├── ui/                  # Button, Input, MacroBar — shared primitives
│   ├── log/                 # FoodSearch, LogEntryRow
│   └── meals/               # MealQuickLog
├── db/
│   ├── schema.ts            # Turso client + CREATE TABLE statements
│   └── seed.ts              # Initial food database (verified macros)
├── lib/
│   ├── auth.ts              # JWT create/verify, session helpers
│   ├── api.ts               # handleApi wrapper — runs ensureDB + catches errors
│   ├── calculate.ts         # Pure macro calculation functions
│   ├── db.ts                # ensureDB — runs once, init + seed guard
│   ├── AuthContext.tsx      # React context for session state
│   └── validate.ts          # Input validation, ValidationError class
├── types/
│   └── db.ts                # TypeScript interfaces for all DB row shapes
└── proxy.ts                 # Route protection (Next.js 16 proxy convention)
```

---

## Critical Patterns

### Every API route follows this pattern:
```typescript
export async function GET/POST/PUT/DELETE(req: NextRequest, { params }?: RouteParams) {
  return handleApi(async () => {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // ... handler logic
  });
}
```

`handleApi` in `src/lib/api.ts` automatically:
- Calls `ensureDB()` — initialises DB and seeds foods on first run
- Catches `ValidationError` → 400 response
- Catches all other errors → 500 response with console.error

### Database client is async — always await:
```typescript
// Correct
const result = await client.execute({ sql: 'SELECT ...', args: [...] });
const row = result.rows[0];

// Wrong — better-sqlite3 sync API no longer used
const row = db.prepare('SELECT ...').get(...);
```

### Dynamic route params are async in Next.js 15+:
```typescript
type RouteParams = { params: Promise<{ id: string }> };
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
}
```

### All macro calculation goes through calculate.ts:
```typescript
calculateMacros(food: FoodMacros, quantityGrams: number): MacroResult
sumMacros(entries: MacroResult[]): MacroResult
calculateRemaining(goals: MacroResult, consumed: MacroResult): MacroResult
getProgressPercent(consumed: number, goal: number): number
```

### Styling uses CSS variables, not Tailwind color classes:
```tsx
// Correct
<div style={{ color: 'var(--accent)' }}>
<div style={{ background: 'var(--surface)' }}>

// Wrong — these Tailwind color classes don't map to our design tokens
<div className="text-green-400">
```

CSS variables are defined in `src/app/globals.css`. Component-level styles use `@layer components` classes defined there (`.card`, `.btn-primary`, `.input-field`, `.macro-track`, etc).

---

## Data Model

```
users
  id, name, email, password_hash, created_at

user_goals
  id, user_id, calories, protein, carbs, fat, effective_from
  (versioned — new row on each update, latest wins)

foods
  id, name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g
  category, is_custom (0=seeded, 1=user-added), created_by (user_id, nullable)

meals
  id, user_id, name, created_at

meal_items
  id, meal_id, food_id, quantity_grams
  (ON DELETE CASCADE from meals)

daily_logs
  id, user_id, date (YYYY-MM-DD), created_at
  UNIQUE(user_id, date)

log_entries
  id, daily_log_id, food_id, quantity_grams, meal_id (nullable), logged_at
  (ON DELETE CASCADE from daily_logs)
```

All macro values stored per 100g. All calculations scale by `quantity / 100`.

---

## Environment Variables

```
JWT_SECRET          — min 32 chars, random hex string
TURSO_DATABASE_URL  — libsql://[db-name].turso.io
TURSO_AUTH_TOKEN    — Turso database token
```

---

## Development Workflow

### Spec first
Every feature starts with a spec in `/specs/` using `specs/TEMPLATE.md`. No code is written without an approved spec.

### Branch strategy
```
main    — production, auto-deploys to Vercel, never commit directly
dev     — integration branch
feature/[name]  — branch from dev
fix/[name]      — hotfix branch from main
```

### Before any feature work, read:
1. This file (CLAUDE.md)
2. `docs/ux-principles.md` — 11 principles + UX validation checklist
3. The relevant spec in `specs/`

### Key constraints for AI agents:
- Never use `as any` — use proper types from `src/types/db.ts` or inline types
- Never use `better-sqlite3` sync API — DB is Turso async client
- Never add `width: 100%` to `.btn-primary` in CSS — width is controlled by `fullWidth` prop
- Never use Tailwind color utility classes — use CSS variables via `style={{}}`
- Always use `handleApi` wrapper for API routes — never raw try/catch in routes
- Always await `params` in dynamic routes — Next.js 15+ async params

---

## Docs Index

| File | Purpose |
|---|---|
| `CLAUDE.md` | This file — project entry point for AI agents |
| `docs/ux-principles.md` | 11 UX principles + validation checklist |
| `specs/TEMPLATE.md` | Spec template for new features |
| `specs/*.md` | Individual feature specs |
| `CHANGELOG.md` | User-facing release notes |
| `README.md` | Project overview and setup |
