# Macros — Personal Calorie & Macro Tracker

A fast, minimal, and accurate calorie and macro tracker built for personal daily use. Built on the philosophy that tracking should be based on **raw ingredient weights** with **verified nutrition data** — not crowdsourced guesses or prepared dish estimates.

## Philosophy

Most calorie tracking apps fail because:
- Their food databases have thousands of duplicate entries with unreliable numbers
- They log prepared dishes with assumed recipes instead of raw ingredients
- They're cluttered with social features, upsells, and noise

This app tracks **raw ingredients at their weighed quantities**. If you cook dal, you log the raw dal, oil, and onions separately — each at their actual weight. The math is honest.

## Features

- **Daily food logging** — search, select, enter grams, done in 3 taps
- **Fixed meal templates** — create reusable meals (e.g. "Oats Breakfast") and log everything in one click
- **Live macro calculation** — calories, protein, carbs, fat consumed vs. remaining
- **7-day history** — bar chart and daily breakdown
- **Curated food database** — seeded with verified macros from product labels and USDA/IFCT data
- **Custom foods** — add any food with your own label data
- **Daily goals** — set and update calorie and macro targets anytime
- **Multi-user** — each user has their own data, goals, and meal templates
- **Mobile-friendly** — designed for daily use on phone

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Database | SQLite via `better-sqlite3` |
| Auth | JWT in httpOnly cookies (`jose`) |
| Styling | Tailwind CSS v4 + CSS variables |
| Language | TypeScript |
| Runtime | Node.js 22 |

## Project Structure

<pre> ```text
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
│   ├── schema.ts        # SQLite schema + singleton
│   └── seed.ts          # Verified food database seed
├── lib/
│   ├── auth.ts          # JWT helpers
│   ├── api.ts           # handleApi error wrapper
│   ├── calculate.ts     # Pure macro calculation engine
│   ├── db.ts            # DB initialization
│   └── validate.ts      # Input validation
└── types/
└── db.ts            # TypeScript types for all DB entities
``` </pre>

## Getting Started

### Prerequisites
- Node.js 20+
- Git

### Installation

```bash
git clone https://github.com/anmolkhy/calorie-tracker.git
cd calorie-tracker
npm install
```

### Environment Setup

Create `.env.local` in the project root:
JWT_SECRET=your-secret-key-minimum-32-characters-long

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The database is created automatically on first run at `data/calorie-tracker.db`. The food database is seeded on first startup.

### Run on Local Network (mobile access)

```bash
npm run dev -- --hostname 0.0.0.0
```

Access from your phone at `http://YOUR_PC_IP:3000`.

## Data & Privacy

- All data is stored locally in a SQLite file at `data/calorie-tracker.db`
- Passwords are hashed with bcrypt
- Sessions use JWT stored in httpOnly cookies
- No data leaves your machine

## Food Database

The seed database contains ~55 foods with macros sourced from:
- **Product labels** — Atom Whey, ID Fresh Paneer, Licious Chicken, Quaker Oats, Superyou Wafers
- **USDA FoodData Central** — nuts, seeds, fruits, vegetables
- **IFCT (National Institute of Nutrition, India)** — Indian staples: dal, rice, atta, paneer

All values are per 100g raw weight. Custom foods can be added anytime via the Foods tab.

## Roadmap

- [ ] PWA — install on phone home screen
- [ ] Deploy to Vercel + Turso (cloud SQLite)
- [ ] Water intake tracking
- [ ] Weekly macro averages
- [ ] Export data as CSV

## License

Personal use. Not open for contributions at this time.