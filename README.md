# Calorie Tracker

A local macro tracking app built with Next.js 16, React 19, TypeScript, Tailwind CSS, and SQLite.

## Overview

This project is a calorie and macro tracker with:

- Email/password authentication
- JWT-based session cookie storage
- Daily food logging with macro preview
- Custom food creation and search
- Meal definitions and meal quick logging
- Goal tracking for calories, protein, carbs, and fat
- Local SQLite persistence in `data/calorie-tracker.db`

## Key Features

- User registration and login
- Protected dashboard for daily food tracking
- Food search and custom food management
- Meal creation, editing, and quick logging
- Daily macro totals and remaining goals
- Backend API routes under `src/app/api`
- Pre-seeded foods for common ingredients

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- SQLite via `better-sqlite3`
- JWT authentication with `jose`

## Project Structure

- `src/app` — app router pages and API routes
- `src/app/(auth)` — authentication pages (`/login`, `/register`)
- `src/app/(app)` — authenticated dashboard and UI
- `src/app/api` — API route handlers for auth, foods, meals, goals, and logs
- `src/components` — reusable UI and feature components
- `src/lib` — auth helpers, API wrapper, DB initialization, and utilities
- `src/db` — SQLite schema and seed data
- `data` — generated local SQLite database file

## Getting Started

### Prerequisites

- Node.js 20+
- npm (or yarn/pnpm)

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

### Build

```bash
npm run build
```

### Start

```bash
npm start
```

### Lint

```bash
npm run lint
```

## Environment

The app supports a JWT secret for signing auth tokens. In production, set:

```bash
export JWT_SECRET="your-strong-secret"
```

If `JWT_SECRET` is not provided, the app falls back to a default secret, so make sure to configure it before deploying.

## Database

- The SQLite database file is created at `data/calorie-tracker.db`.
- Schema includes users, goals, foods, meals, daily logs, meal items, and log entries.
- `src/db/seed.ts` seeds an initial food catalog on first run.

## API Routes

Key endpoints include:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/goals`
- `POST /api/goals`
- `GET /api/foods`
- `POST /api/foods`
- `PUT /api/foods/:id`
- `DELETE /api/foods/:id`
- `GET /api/meals`
- `POST /api/meals`
- `GET /api/meals/:id`
- `PUT /api/meals/:id`
- `DELETE /api/meals/:id`
- `GET /api/log`
- `POST /api/log`
- `DELETE /api/log/entry/:id`
- `GET /api/log/meal/:id`
- `GET /api/log/week`

## Notes

- Auth state is managed in `src/lib/AuthContext.tsx`.
- Session cookies are stored under `ct_session`.
- The app uses a singleton SQLite connection in development to survive hot reloads.
- UI state is handled with React hooks in client components.

## Contribution Ideas

Possible improvements:

- Add weekly/monthly reporting
- Add food category filters
- Add nutrition goals by meal type
- Integrate external nutrition APIs

---

Built with Next.js, TypeScript, and SQLite for fast local macro tracking.