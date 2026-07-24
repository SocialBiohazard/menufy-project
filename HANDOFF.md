# MenuApp — Project Handoff

_Last updated 2026-07-16. This doc is the source of truth for anyone (human or agent) picking up the project._

## 1. What this project is

A **managed QR-menu service** for restaurants, modeled on **menulab.com.tr** (a Turkish done-for-you QR-menu agency). The business model is **done-for-you**: a restaurant asks for a menu, the agency builds it and hosts it; diners scan a QR to view it. There is **no self-serve** for restaurants.

That means the product has **three surfaces**:
1. **Diner menu** (public, per restaurant at `/{slug}`) — ✅ built.
2. **Operator back-office** (internal tool where agency staff build/manage menus) — ✅ built.
3. **Public marketing + application site** (landing + "request a menu" funnel — what a customer/your boss thinks of as "the website") — ❌ **not built yet.** Root `/` just redirects to the operator login.

## 2. Current state (honest)

**Works, end-to-end verified:**
- Supabase Auth login with an application-side `OPERATOR_EMAILS` allowlist. Public Supabase signup must be disabled before launch.
- Dashboard: list restaurants, create, delete, publish/unpublish, QR download, links.
- Restaurant Core editor: name, slug, business type, template, per-restaurant color overrides, **logo/cover/slogan branding**, languages (TR/EN/AR), nav style.
- Menu builder: categories + items CRUD, reorder, multilingual fields, price, **image upload to Supabase Storage**, allergen multiselect (14 seeded), availability ("86") toggle, New/Featured badges, optional nutrition.
- Public diner menu at `/{slug}`: renders the chosen theme, TR/EN/AR + RTL, cover/logo hero, category nav (drilldown **and** accordion), allergen chips, publish gating (unpublished → 404).
- **4 themes** (`lib/themes.ts`): `terracotta` (default), `noir`, `sahil`, `ember` — token-driven; adding a theme = one token object.
- QR generation (points at `NEXT_PUBLIC_SITE_URL/{slug}`).

**Not built / rough (roadmap, roughly in priority order):**
1. **Public marketing + application site** (the customer-facing "website"). Highest priority per the owner.
2. **Visual theme picker** — the editor's template selector is still a plain text dropdown; should be a gallery with previews.
3. Diner **item-detail view** (tapping an item does nothing).
4. **Image compression** on upload (photos upload raw — big/slow).
5. Remaining **Phase-1.5 profile fields on the live page** (hours, address, phone, socials, Maps/Reviews, KDV notice — schema + some editor fields exist; not rendered on the diner page).
6. **Item variants** UI (size/price), **menu scheduling**, **duplicate-restaurant** for chains, **custom per-restaurant domains**.

## 3. Stack & the gotchas that will bite you

- **Next.js 16.2.10** (App Router), **React 19**, **Tailwind v4** (CSS config, no `tailwind.config.js`). `params` in routes is a **Promise** — `await` it.
- **Prisma 7.8** — big changes from older Prisma:
  - **No `url` in `schema.prisma`.** Connection URLs live in `prisma.config.ts` (uses `DIRECT_URL` for migrations). Runtime uses a **driver adapter**: `@prisma/adapter-pg` with `DATABASE_URL` (see `lib/prisma.ts`).
  - Generated client output is `generated/prisma/` (**gitignored**); import from `@/generated/prisma/client`. **You must run `prisma generate` on any fresh checkout / deploy** or imports fail.
- **shadcn/ui is the base-ui variant** (`@base-ui/react`, style "base-nova"): use the **`render` prop, not `asChild`**; a Button rendered as a link/anchor needs **`nativeButton={false}`**; base-ui `Select`'s `onValueChange` passes `string | null`.
- **Supabase**: Postgres (project ref `vweokfgpyfbjxyqbjnea`, region eu-west-1), Auth (email/password), Storage (public bucket `menu-media`). Env key is the **new format** `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` + `SUPABASE_SECRET_KEY`.
- **Node scripts can't use `@supabase/supabase-js`** (crashes on Node 20 — no native WebSocket for Realtime). `scripts/create-operator.ts` and `scripts/setup-storage.ts` therefore use the Supabase **REST API via `fetch`**. (Inside Next.js runtime the SDK is fine via `@supabase/ssr`.)
- Passwords with special chars (`@` etc.) must be **URL-encoded** in the connection strings.
- Local dev quirk: killing `next dev` in the persistent shell can make the shell exit 144 — start dev on a fresh port in the background instead.

## 4. Run it locally

```bash
npm install
npx prisma generate          # generated client is gitignored
npm run dev                  # http://localhost:3000
```
Operator access is restricted by the comma-separated `OPERATOR_EMAILS` environment variable. Never store operator passwords in this repository.
Other scripts: `npm run db:migrate`, `npm run db:seed` (allergens), `npm run db:studio`, `npx tsx scripts/setup-storage.ts` (bucket, already created).

`.env` holds the live Supabase credentials (gitignored). Template in `.env.example`.

## 5. Where things live

- `app/[slug]/page.tsx` — public diner page. `components/menu/*` — the diner template (`MenuView`, `ItemCard`, `MenuTemplate`).
- `lib/themes.ts` — the 4 themes + token resolver (the whole theming system).
- `app/dashboard/**` — operator app. `components/admin/*` — dashboard, editor, builder, dialogs, image upload, QR.
- `lib/actions/*` — server actions (restaurant, category, item, media), all `requireOperator`-guarded, zod-validated (`lib/validation.ts`).
- `lib/prisma.ts`, `prisma/schema.prisma`, `prisma.config.ts` — data layer. `prisma/seed.ts` (allergens), `prisma/seed-demo.ts` (demo restaurant).
- `utils/supabase/*`, `middleware.ts`, `lib/auth.ts` — auth.
- **`reference/`** — the Part 1 research: `findings.md` (29-restaurant analysis), `captures/*` (screenshots + DOM per restaurant), `plan/*` (the original specs). This is the design/quality reference; not code.
- `old_plans/` — the old crawler + its `node_modules` (Playwright is installed there and is reused for screenshots).
- Full history/decisions also in the owner's agent memory at `~/.claude/projects/-home-zayn-Downloads-Code-MenuProject/memory/` (may not travel with the repo — this doc is the portable version).

## 6. Deploying the first real customer NOW (before the site is "done")

You do **not** need the marketing site or any unfinished feature to host one customer — the diner menu, builder, publish, and QR all work, and that matches the done-for-you model (you build their menu for them).

1. **Commit + push** the repository after the launch checks pass.
2. **Create a Railway project** from the GitHub repository.
3. **Deploy to Railway** as a persistent Node.js service.
   - Copy the variables documented in `.env.example` into the Railway service.
   - Set `NEXT_PUBLIC_SITE_URL` to the generated Railway domain initially, then the final main application domain.
   - `railway.json` defines the Railpack build, migration pre-deploy command, persistent start command, and `/api/health` deployment healthcheck.
4. **Purchase/configure the domain through Railway Networking.** Restaurant-specific hostnames are entered in the operator editor and routed by the application.
5. In the live dashboard, **build the customer's menu** (their real content, logo/cover, pick a theme), then **Publish**.
6. Give the customer their configured hostname and the QR code downloaded from the dashboard.

**Launch gate:** rotate all development credentials before creating the Railway deployment. Do not copy the currently exposed development database password, server secret, or historical operator password into Railway.
