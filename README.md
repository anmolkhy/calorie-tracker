# Macros — Personal Calorie & Macro Tracker

A fast, minimal, and accurate calorie and macro tracker built for personal daily use. Installable as a PWA on mobile. Built on the philosophy that tracking should be based on **raw ingredient weights** with **verified nutrition data from product labels** — not crowdsourced guesses or prepared dish estimates.

## Philosophy

Most calorie tracking apps fail because:

- Their food databases have thousands of duplicate entries with unreliable numbers
- They log prepared dishes with assumed recipes instead of raw ingredients
- They're cluttered with social features, upsells, and noise

This app tracks **raw ingredients at their weighed quantities**. If you cook dal, you log the raw dal, oil, and onions separately at their actual weight. The math is always honest.

## Features

- **Daily food logging** — search, select, enter grams. Done in 3 taps
- **Fixed meal templates** — create reusable meals (e.g. "Oats Breakfast") and log everything in one click
- **Live macro calculation** — calories, protein, carbs, fat consumed vs. remaining, updates instantly
- **7-day history** — bar chart and daily breakdown with goal tracking
- **Curated food database** — ~60 foods with macros verified from product labels and USDA/IFCT data
- **Custom foods** — add any food with your own label data
- **Daily goals** — set calorie and macro targets with a visual macro split donut chart
- **Multi-user** — each user has their own isolated data, goals, and meal templates
- **PWA** — installable on phone home screen, runs fullscreen like a native app
- **Mobile-first** — designed for daily use on phone, full desktop support

## Tech Stack

| Layer      | Choice                               |
| ---------- | ------------------------------------ |
| Framework  | Next.js 16 (App Router)              |
| Database   | Turso (libSQL / SQLite-compatible)   |
| Auth       | JWT in httpOnly cookies (jose)       |
| Styling    | Tailwind CSS v4 + CSS variables      |
| Language   | TypeScript                           |
| Runtime    | Node.js 22                           |
| Deployment | Vercel (auto-deploy on push to main) |

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, register pages
│   ├── (app)/           # Protected pages: dashboard, history, meals, foods, settings
│   └── api/             # API routes: auth, foods, meals, log, goals
├── components/
│   ├── ui/              # Button, Input, MacroBar
│   ├── log/             # FoodSearch, LogEntryRow
│   └── meals/           # MealQuickLog
├── db/
│   ├── schema.ts        # Turso client + schema initialisation
│   └── seed.ts          # Verified food database seed
├── lib/
│   ├── auth.ts          # JWT helpers
│   ├── api.ts           # handleApi error wrapper + DB init
│   ├── calculate.ts     # Pure macro calculation engine
│   ├── db.ts            # DB initialisation guard
│   ├── AuthContext.tsx  # React session context
│   └── validate.ts      # Input validation
├── types/
│   └── db.ts            # TypeScript types for all DB entities
└── proxy.ts             # Route protection (Next.js 16 convention)

docs/
└── ux-principles.md     # 11 UX principles + validation checklist

specs/
├── TEMPLATE.md
├── 001-frictionless-calorie-log.md
├── 002-product-search-barcode.md
└── 003-macro-calculator-smart-planner.md

adr/
├── 001-turso-over-postgresql.md
├── 002-jwt-cookies-over-nextauth.md
├── 003-raw-weight-tracking-philosophy.md
├── 004-no-auto-macro-adjustment.md
├── 005-prompt-generator-over-embedded-ai.md
├── 006-data-informs-never-judges.md
└── 007-nextjs16-tailwind-v4-stack.md

CLAUDE.md                # AI agent entry point
CHANGELOG.md             # User-facing release notes
```

## Getting Started

### Prerequisites

- Node.js 20+
- Git
- Turso account (free) — https://turso.tech
- Vercel account (free, for deployment) — https://vercel.com

### Local Development

```bash
git clone https://github.com/anmolkhy/calorie-tracker.git
cd calorie-tracker
npm install
```

Create `.env.local` in the project root:

```
JWT_SECRET=your-random-32-char-hex-string
TURSO_DATABASE_URL=libsql://your-db-name.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token
```

Generate a JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

```bash
npm run dev
```

Open http://localhost:3000. The database schema is created and food database seeded automatically on first run.

### Run on Local Network (mobile access)

```bash
npm run dev -- --hostname 0.0.0.0
```

Access from your phone at http://YOUR_PC_IP:3000. Add your IP to next.config.ts under allowedDevOrigins.

### Install as PWA (Mobile)

1. Open the deployed URL in Safari (iOS) or Chrome (Android)
2. Tap browser menu and Add to Home Screen
3. App installs with fullscreen native experience, no browser chrome

## Deployment

Deployed on Vercel with automatic CI/CD. Every push to main deploys to production.

### Environment variables on Vercel

```bash
vercel env add JWT_SECRET
vercel env add TURSO_DATABASE_URL
vercel env add TURSO_AUTH_TOKEN
vercel --prod
```

### Branch strategy

```
main              — production, protected, auto-deploys to Vercel
dev               — integration branch
feature/[name]    — branch from dev for new features
fix/[name]        — hotfix branch from main
```

## Data and Privacy

- All data stored in Turso (SQLite-compatible cloud DB, Mumbai region)
- Passwords hashed with bcrypt (cost factor 10)
- Sessions use JWT stored in httpOnly cookies, not accessible via JavaScript
- Each user's data is fully isolated
- No analytics, no tracking, no ads

## Food Database

~60 foods seeded with macros from verified sources:

| Source                | Used for                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------ |
| Product labels        | Atom Whey, ID Fresh HP/LF Paneer, Licious Chicken Curry Cut, Quaker Oats, Superyou Wafers, Amul Butter |
| USDA FoodData Central | Nuts, seeds, fruits, vegetables, oils                                                                  |
| IFCT (NIN India)      | Indian staples: dal varieties, basmati rice, atta, paneer                                              |

All values are per 100g raw weight. Custom foods can be added via the Foods tab.

## For AI Agents and Developers

Read CLAUDE.md first. It covers the full architecture, critical patterns, constraints, and links to all ADRs. Every non-obvious decision has a corresponding ADR in /adr/.

Key constraints:

- Database is Turso async — always await client.execute({ sql, args })
- Styling uses CSS variables — never Tailwind color utility classes
- Button width is controlled by fullWidth prop — never add width 100% to btn-primary
- All API routes use handleApi wrapper
- Route protection is in src/proxy.ts, not src/middleware.ts

## Roadmap

- [ ] Frictionless calorie log — quick log calories without macro breakdown (spec 001)
- [ ] Product search and barcode scanner via Open Food Facts (spec 002)
- [ ] Macro calculator and smart meal planner (spec 003)
- [ ] Weekly macro averages on history page
- [ ] Export data as CSV
- [ ] Custom app icon and branding
- [ ] Water intake tracking

## License

Personal use project. Not open for contributions at this time.
