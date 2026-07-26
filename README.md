# Menufy

Managed digital restaurant menus with an internal operator dashboard, multilingual public menus, QR codes, and per-restaurant hostnames.

The first-priority customer uses the dedicated `inci-heritage` template. Restaurant identity, profile information, content, translations, notices, currency, links, and visual settings are stored in PostgreSQL and edited through `/dashboard`.

## Local setup

Requirements:

- Node.js 20.9–24
- npm
- PostgreSQL

```bash
npm ci
cp .env.example .env
npm run db:generate
npm run db:migrate
npm run create-operator -- developer@example.com
npm run dev
```

Set `OPERATOR_PASSWORD` in the shell before running `create-operator`; do not put an operator password in the repository. On Windows, copy `.env.example` using Explorer or PowerShell instead of `cp`.

Local development defaults to media files under `.data/media`. Production uses a private S3-compatible bucket and the variables documented in `.env.example`.

## Quality checks

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

## Railway deployment

The application runs as a persistent Next.js Node server, not as serverless functions.

1. Create a Railway project from this repository.
2. Add a Railway PostgreSQL service and reference its connection variables.
3. Add a Railway storage bucket and inject its `AWS_*` credentials.
4. Set `MEDIA_STORAGE_DRIVER=s3`.
5. Generate a Railway public domain and set `NEXT_PUBLIC_SITE_URL`.
6. Run `npm run db:migrate:deploy` as the pre-deploy command.
7. Configure `/api/health` as the deployment healthcheck.
8. Create the initial operator with a temporary, securely supplied `OPERATOR_PASSWORD`, then remove that variable.

Railway injects `PORT`; `npm start` binds the server to `0.0.0.0`. Restaurant hostnames are configured per restaurant in the dashboard.

## Launch safety

- Use a new production database password.
- Set a new operator password and remove temporary setup credentials.
- Verify `OPERATOR_EMAILS`.
- Verify database backups and a restore procedure.
- Verify the private media bucket and image delivery.
- Remove exposed historical credentials from Git history where applicable.

## Important paths

- `app/dashboard` — operator application
- `components/admin` — restaurant settings and menu builder
- `components/menu` — public menu templates
- `lib/actions` — authenticated mutations
- `lib/auth.ts` and `lib/auth-password.ts` — database sessions and password hashing
- `lib/media-storage.ts` and `app/media` — local/S3 media storage and delivery
- `prisma/schema.prisma` — data model
- `reference/plan/customer_subdomain_launch_plan.md` — paid-customer launch plan
- `railway.json` — Railway build/deploy health configuration
