# ADR 001: Turso (libSQL) over PostgreSQL

**Date:** 2026-05-04  
**Status:** Accepted

---

## Context

The app needed a persistent database. Initial development used `better-sqlite3` (local SQLite file) for simplicity. On moving to Vercel deployment, a cloud database was required since Vercel serverless functions cannot write to the local filesystem.

---

## Decision

Use Turso (libSQL/SQLite-compatible cloud database) rather than PostgreSQL.

---

## Reasoning

- **Schema compatibility** — Turso is SQLite-compatible. The entire schema migrated from `better-sqlite3` to `@libsql/client` with zero schema changes. Only the query syntax changed (sync → async, `.prepare().get()` → `await client.execute()`).
- **Free tier** — 500M rows read/month, 10M rows written/month, 5GB storage. More than sufficient for current and near-future scale.
- **No connection pooling** — PostgreSQL on serverless requires a connection pooler (PgBouncer, Supabase pooler). Turso handles this natively.
- **Mumbai region** — Turso has an `ap-south-1` region close to the primary user base, keeping latency low.
- **Simplicity** — SQLite's mental model is simpler. No migrations tool needed, no separate migration files, schema is defined directly in `schema.ts`.

---

## Alternatives Considered

**PostgreSQL via Supabase**
Rejected. More powerful but significantly more complex for this scale. Connection pooling in serverless is a known pain point. Overkill for a personal tracker with <50 users.

**PlanetScale (MySQL)**
Rejected. MySQL syntax differs from SQLite, requiring schema rewrite. No advantage over Turso at this scale.

**Keeping local SQLite on a VPS**
Rejected. Would require a persistent server, eliminating the Vercel free tier deployment simplicity.

---

## Consequences

- All DB queries are async — `await client.execute({ sql, args })` pattern throughout
- No transactions in the traditional sense — Turso supports them but we use sequential awaits for simplicity
- If scale ever requires PostgreSQL, the migration path is: swap `@libsql/client` for `pg`, rewrite queries in `src/app/api/**` — schema logic and all other code unchanged
