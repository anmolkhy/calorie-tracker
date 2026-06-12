# ADR 002: JWT in httpOnly Cookies over NextAuth

**Date:** 2026-04-26  
**Status:** Accepted

---

## Context

The app requires user authentication. Next.js apps commonly use NextAuth (now Auth.js) as the standard auth solution. A custom JWT implementation was chosen instead.

---

## Decision

Use `jose` library for JWT creation and verification, storing tokens in httpOnly cookies. No third-party auth library.

---

## Reasoning

- **No OAuth required** — the app is a personal tool, not a public product. Email + password is the only auth method needed. NextAuth's primary value is OAuth provider integration, which adds zero value here.
- **Simpler mental model** — the entire auth flow is in two files: `src/lib/auth.ts` (JWT helpers) and the auth API routes. No abstraction layers, no magic.
- **httpOnly cookies** — tokens stored in httpOnly cookies are not accessible via JavaScript, protecting against XSS. This is the correct security pattern.
- **`jose`** — fully standards-compliant JWT library, works in Edge runtime and Node.js, actively maintained by Vercel ecosystem.
- **Control** — custom auth means no dependency on a third-party library's breaking changes or API surface changes.

---

## Alternatives Considered

**NextAuth / Auth.js**
Rejected. Adds complexity (callbacks, adapters, session strategies) that isn't needed for email/password only auth. The session handling is opaque and harder to debug. Significant overhead for what is essentially two API routes.

**Lucia Auth**
Rejected. Same rationale — adds abstraction over something simple enough to implement directly.

---

## Consequences

- Password reset flow not implemented — users who forget their password must be manually reset via Turso dashboard. Acceptable for current user base size.
- Token expiry is 7 days — users stay logged in for a week without re-authenticating
- Session is verified on every API call via `getSession()` in `src/lib/auth.ts`
- Route protection is handled in `src/proxy.ts` (Next.js 16 proxy convention, not middleware)
