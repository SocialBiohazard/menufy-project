# Menufy — Project Handoff

_Updated 2026-07-26._

## Product

Menufy is a managed QR-menu service. It has a public diner menu for each restaurant, an internal operator dashboard, and a future marketing/application site. The urgent paid customer uses the dedicated `inci-heritage` template; the customer will enter the final menu content.

## Current engineering state

- Next.js 16 App Router application running as a persistent Node server.
- Prisma 7 with provider-neutral PostgreSQL.
- Database-backed operators and opaque, hashed, expiring sessions.
- Operator access additionally restricted by `OPERATOR_EMAILS`.
- Scrypt password hashing and server-action login/logout.
- Local media storage for development and private S3-compatible storage for production.
- Stable `/media/...` delivery route; no provider URL is stored for new uploads.
- Restaurant/category/item CRUD, ordering, translations, settings, publishing, QR codes, host routing, and four menu themes.
- Dedicated İnci template with deep links, browser navigation, TR/EN/AR, RTL, and mobile behavior.
- Image decoding, validation, resizing, WebP conversion, and managed cleanup.

## Infrastructure direction

Production will use one Railway project containing:

1. The persistent Next.js service.
2. Railway PostgreSQL.
3. A Railway storage bucket.
4. Railway-managed domains.

The currently configured remote PostgreSQL database is only the reconstruction/migration source. Do not delete it until Railway data migration, production QA, and backup verification are complete.

## Key implementation details

- Next.js route `params`, `searchParams`, and `cookies()` are asynchronous.
- Prisma URLs live in `prisma.config.ts`; runtime uses `@prisma/adapter-pg`.
- Generated Prisma client lives in `generated/prisma` and must be regenerated after schema changes.
- `lib/auth.ts` owns sessions; `lib/auth-password.ts` owns password hashing.
- `scripts/create-operator.ts` creates or resets an allowlisted operator. Supply the password through the temporary `OPERATOR_PASSWORD` environment variable.
- `lib/media-storage.ts` uses `.data/media` locally or S3 when `MEDIA_STORAGE_DRIVER=s3`.
- Railway buckets are private; `/media/...` redirects to a short-lived signed object URL.
- All mutations call `requireOperator()` and validate inputs.
- Tenant hostnames cannot expose `/dashboard`, `/login`, or `/api`.

## Verification

Run:

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

Then test login, sign-out, CRUD, upload/replacement/deletion, tenant isolation, İnci desktop/mobile/RTL behavior, healthcheck, and the production Railway domain.

## Remaining launch work

- Connect Railway and GitHub.
- Provision Railway PostgreSQL and a storage bucket.
- Export/import the current PostgreSQL data.
- Configure production variables and deploy migrations.
- Create the production operator password securely.
- Run production QA and backup/restore checks.
- Purchase/configure the final domain.
- Rotate and retire all reconstruction credentials.

Historical research and superseded plans under `reference/` and `old_plans/` are reference material, not current architecture.
