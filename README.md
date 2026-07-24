# Menufy

Managed digital restaurant menus with an internal operator dashboard, multilingual public menus, QR codes, and per-restaurant hostnames.

The first priority customer uses the dedicated `inci-heritage` template. Restaurant identity, profile information, menu content, translations, notices, currency, links, and visual settings are stored in Postgres and edited through `/dashboard`.

## Local setup

Requirements:

- Node.js 20.9–24
- npm
- a Supabase project with Postgres, Auth, and Storage

```bash
npm ci
cp .env.example .env
npm run db:generate
npm run db:migrate
npm run dev
```

On Windows, copy `.env.example` to `.env` using Explorer or PowerShell instead of the Unix `cp` command.

Configure every variable described in `.env.example`. `OPERATOR_EMAILS` is a comma-separated, case-insensitive allowlist. Authenticated users not on that list cannot access the dashboard.

## Quality checks

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

## Railway deployment

This application is deployed as a persistent Next.js Node server, not as serverless functions.

1. Create a Railway project from this GitHub repository.
2. Add all variables from `.env.example` to the service.
3. Generate a Railway public domain.
4. Set `NEXT_PUBLIC_SITE_URL` to `https://<RAILWAY_PUBLIC_DOMAIN>` or the final main application domain.
5. Confirm the service uses `railway.json`.
6. Do not deploy until `DIRECT_URL` works with `npm run db:migrate:deploy`.
7. Configure the Railway healthcheck at `/api/health` (also declared in `railway.json`).

Railway injects `PORT`; `npm start` binds the persistent Next.js server to `0.0.0.0`. Railway's public domain is recognized as the main operator application host. Restaurant hostnames are configured per restaurant in the dashboard.

## Launch safety

Development credentials currently used during reconstruction must not be reused in Railway. Before the first deployment:

- rotate the Supabase database password;
- rotate the Supabase server secret;
- reset the historical operator password;
- disable public Supabase signup;
- verify the operator allowlist;
- verify the direct migration connection;
- remove exposed credentials from Git history.

## Important paths

- `app/dashboard` — operator application
- `components/admin` — restaurant settings and menu builder
- `components/menu` — public menu templates
- `lib/actions` — authenticated mutations
- `prisma/schema.prisma` — data model
- `reference/plan/customer_subdomain_launch_plan.md` — paid-customer launch plan
- `railway.json` — Railway build/deploy health configuration
