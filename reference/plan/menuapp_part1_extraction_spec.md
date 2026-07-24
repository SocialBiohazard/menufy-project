# MenuApp — Part 1: Reference Extraction Spec
*Working doc · Part 1 of 3 (Extract → MVP spec → Implement) · Reference: menulab.com.tr*

---

## 0. The reframe that shapes everything

menulab.com.tr (a Turkish QR-menu service by WebTechTR) is a **done-for-you managed service**, not a self-serve SaaS. Restaurants **do not log in and build menus** — they fill out an application form and the agency builds and maintains the menu for them ("we handle upload, design, domain"; "we make price/product changes on your behalf — one message is enough").

**Consequence:** there is *no public admin/builder* to reverse-engineer. So Part 1 is two jobs, not one:

| | Source | How |
|---|---|---|
| **EXTRACT** (observable) | The public diner-facing menus, theme catalog, marketing + application/onboarding flow, URL/slug scheme | Playwright (menus are JS-rendered — see §4) |
| **DESIGN** (not public) | The operator admin / menu builder, the restaurant view, auth/roles, draft-publish, media, QR generation | Our own decisions, informed by the extracted output + product goals |

Do **not** send Playwright hunting for an admin panel. It isn't there. The admin is ours to design.

---

## 1. Locked product model

- **Type:** done-for-you managed service (agency operates it, restaurants are clients).
- **User types (MVP):**
  - **Operator** — agency staff. **One shared login** for MVP (no multi-user/roles yet). Full create/edit of all restaurants and menus.
  - **Diner** — public, no login. Scans QR → sees the live menu.
  - *Restaurant login is **cut from MVP*** — no private restaurant-facing view, so no restaurant auth to build. (Revisit post-MVP only if a private view is ever needed.)
- **Tenancy** lives in the data (many restaurants, each on a slug page like `/dogan-restaurant`), not in self-serve signups.
- **Scope:** menu **display only** — no ordering, no payments, no delivery.
- **Themes:** content/presentation split; ≥3 selectable themes. How *distinct* the 3 are is decided *after* extraction (§5.12).

**MVP feature scope (locked):** operator login (single) → build/manage restaurants + menus (categories → flat priced items, **images**, **allergens**, content in **TR/EN/AR**) → **draft/publish** → assign a **theme** → per-item **availability toggle** + **menu scheduling** → generate **QR** → public slug menu page for diners. No restaurant auth, no ordering/payments, no variants/modifiers, no import, no analytics.
- **Stack:** Next.js + Supabase (Postgres + Auth + Storage + RLS) + Supabase MCP in Claude Code; hosting on Railway optional.

---

## 2. Extraction output schema (what Part 1 produces)

The captures get poured into this structure. This *is* the Part 1 deliverable.

**A. Feature inventory** — every diner-facing feature observed (search, language switch, category nav, item detail, allergen display, image behavior, full-screen mode, etc.), each with a one-line "in/out for our MVP" tag.

**B. Page/screen map** — every distinct diner screen + every marketing/onboarding screen, with what each contains and links to.

**C. Flows** —
- *Diner journey* (scan → land → browse → filter/switch language → view item).
- *Onboarding/application* (how a restaurant becomes a live menu — the funnel).
- *Operator build flow* (designed by us).
- *Restaurant view flow* (designed by us).

**D. Information architecture** — the content hierarchy: menu → category → item → (variant? modifier?), plus how multilingual and allergen data attach. This becomes the backbone of the data model.

**E. Theming system analysis** — what varies template-to-template (layout, typography, color, sector styling), what stays constant, how content maps into a template, roughly how many templates they offer and how configurable each is.

**F. Data model v0** — entities + relationships derived from A–E and the captured network payloads.

**G. Compliance & localization notes** — Turkey-specific allergen law, KVKK, and the multilingual model (see §6).

---

## 3. Extraction methodology (run in Claude Code, on Sonnet)

**Why Playwright, not fetch:** the menus are client-side-rendered — a static fetch of `/dogan-restaurant` returns only a "menu loading…" shell. Playwright runs a real browser, executes the JS, and can see + capture the fully rendered menu.

**Capture, per page (in priority order):**
1. **Network requests/responses** — set up a response listener *before* navigating, and dump every XHR/fetch JSON to disk. **This is the single highest-value capture:** the JSON the SPA fetches to render a menu basically hands you the reference data model (item shape, category structure, how allergens/translations are stored).
2. **Full-page screenshots** — mobile viewport (375px) *and* desktop, since QR menus are mobile-first.
3. **Rendered DOM** — `page.content()` after the menu loads.

**Token hygiene (this is how you keep it cheap on the $20 pool):**
- Run the crawl on **Sonnet**. It's mechanical.
- **Save everything to disk**, then have Claude read *targeted* files — never paste whole DOMs or dump all screenshots into context.
- `/clear` between restaurants so page 20 isn't re-sending pages 1–19.
- Playwright itself costs *zero* Claude usage; only your reading/analysis of captures does.

**Pages to crawl:**
- `menulab.com.tr/` (home), the "Nasıl Çalışır" (how-it-works), "Kataloglar" (catalog), and "Başvur" (apply) pages — for the onboarding funnel + theme catalog.
- `menulab.com.tr/dogan-restaurant` (confirmed example) **plus every other example slug you can find** — have the script scrape the catalog page and/or `sitemap.xml` for the full list of live menus (there appear to be ~29). Each live menu demonstrates a theme; collectively they're your theme reference library.

**Starter script** (untested — I can't reach the domain from here; treat as a base to run/iterate in Claude Code):

```ts
// crawl.ts — run: npx playwright install chromium && npx tsx crawl.ts
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'fs/promises';

const SLUGS = ['dogan-restaurant']; // TODO: discover the rest from catalog page / sitemap.xml
const BASE = 'https://menulab.com.tr';

for (const slug of SLUGS) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await ctx.newPage();

  const net: any[] = [];
  page.on('response', async (res) => {
    const ct = res.headers()['content-type'] || '';
    if (ct.includes('application/json')) {
      try { net.push({ url: res.url(), status: res.status(), body: await res.json() }); }
      catch {}
    }
  });

  await page.goto(`${BASE}/${slug}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500); // let the SPA settle

  const dir = `captures/${slug}`;
  await mkdir(dir, { recursive: true });
  await writeFile(`${dir}/network.json`, JSON.stringify(net, null, 2));
  await writeFile(`${dir}/dom.html`, await page.content());
  await page.screenshot({ path: `${dir}/mobile.png`, fullPage: true });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({ path: `${dir}/desktop.png`, fullPage: true });

  await browser.close();
}
```

---

## 4. Initial recon (seeded from what I could already observe)

Confirmed so far, to save you re-discovering it:
- **Managed-service model** confirmed (application form → agency builds → live in a few days).
- **Sector-based design templates** — they pitch designs tuned per restaurant type.
- **Multilingual: TR / EN / AR** on the diner menus.
- **Allergen reporting (14 types) + nutritional values** surfaced on items.
- **Slug-based public URLs:** `menulab.com.tr/{restaurant}`.
- **~29 live example menus** — your theme reference set.
- **Operator-managed edits** — no self-serve; changes go through the agency.

Everything below the marketing layer (actual menu UI, item detail behavior, exact data shapes) is the SPA that a static fetch can't see — that's what Playwright fills in.

---

## 5. Decisions — LOCKED  *(original rationale preserved below)*

Final MVP calls: ① restaurant auth **cut** · ② allergens = **mandatory** per-item field · ③ languages **TR + EN + AR** (all three) · ④ item **images: in** · ⑤ **flat priced items** — no variants/modifiers · ⑥ availability toggle **in** + menu scheduling **in** · ⑦ draft/publish **in** · ⑧ slug **subpath** · ⑨ QR generation **in** · ⑩ **one operator login**, no roles · ⑪ **manual entry** — no import · ⑫ theme distinctness + architecture: **after extraction** · ⑬ analytics / reviews / listing-sync / billing: **deferred**.

> **Heads-up on ⑥:** the availability ("86") toggle is trivial, but **menu scheduling** (serving different menus by day/shift) is the heavier half — it adds menu *versioning* + time-resolution logic to both the data model and the builder. It's in per your call; flagging only so you can ship availability first and add scheduling as a fast-follow if the window gets tight.

The numbered items below are the original framing (the `[DECIDE]` tags are now resolved as summarized above) — kept for the reasoning behind each call.

1. **[DECIDE] What does "restaurant view access" actually show?** This is the big one. If restaurants only ever see their *live* menu — that's the public page, and it needs **no login or auth at all**. Building restaurant authentication is only worth it if they see something *private*: publish status, a preview of *unpublished* edits, scan analytics, or a "request a change" button. So either define the private thing they see, or we drop restaurant auth from MVP entirely and save real time. Which is it?

2. **[ASSUMING] Allergens/nutrition are a first-class, mandatory field — not optional.** Allergen declaration is legally required on menus in Turkey (14 allergens). The data model carries allergens per item **from day one**, and it doubles as a genuine selling point vs. a plain PDF menu.

3. **[DECIDE] Multilingual is *content* i18n, which is harder than UI i18n.** menulab does TR/EN/AR *per menu item* (each item needs a name + description per language). This must be in the data model from the start — retrofitting it is painful. **Which languages for MVP?** My default: TR + EN, structured so AR (and others) drop in later.

4. **[DECIDE] Item images.** Menus have item photos → you need Supabase Storage + upload + image resizing, and some menus have 300+ items (real storage/perf load). **Images in MVP, or text-only menus first?**

5. **[DECIDE] Menu depth: variants & modifiers.** Categories → items is easy. But do items need **variants** (small/medium/large pricing) and **modifiers** (extras/add-ons)? These significantly complicate the data model and the builder UI. My default for MVP: **flat items with a single price, no modifiers** — add later.

6. **[DECIDE] Item availability ("86") + menu scheduling.** A signature feature of these products: toggle an item out-of-stock, and schedule different menus by shift/day. Cheap-ish and high-signal. **In MVP, or later?**

7. **[ASSUMING] Draft vs. Published state.** Operators need to edit a menu without the changes going live mid-edit. I'll include a draft/publish toggle in MVP — it's small and prevents embarrassing live breakage.

8. **[ASSUMING] Slug scheme = subpath.** `yourdomain/{slug}` is simplest for MVP (one SSL cert, trivial routing). Subdomains or custom per-restaurant domains are a later upgrade.

9. **[ASSUMING] QR generation is in MVP.** It's the entire point of a QR menu — generate a QR per restaurant pointing at the public URL, downloadable by the operator. Small build, must-have.

10. **[DECIDE] Operator roles.** One shared operator login, or multiple staff accounts with roles (admin vs. data-entry)? Default: individual operator accounts, flat permissions for MVP, RBAC later.

11. **[DECIDE] Data-entry ergonomics — this is secretly the core product.** In a managed model, operators type in menus all day from PDFs/photos restaurants send them. So the **menu builder UX is the real product**, more than the diner page. Worth deciding early: pure manual entry, or do we want speed-ups like duplicate-a-menu, bulk paste, or PDF/image import (possibly AI-assisted later)? Default: clean manual entry for MVP, import as a fast-follow.

12. **[DECIDE-after-extraction] Theme distinctness + theming architecture.** You said the 3-layouts-vs-3-skins call depends on what we find in menulab's templates — agreed. But independent of that, we should pick the **theming architecture** now: one config-driven renderer (themes = JSON of colors/fonts/layout flags) vs. separate template components per theme. This determines how cheap adding theme #4 is later. I'll recommend based on what the extraction shows.

13. **[DEFERRED] Out of MVP but noted:** scan/traffic analytics, review management, listing sync (Google/Yelp), and any self-serve billing. menulab has some of these; we're consciously skipping them.

---

## 6. Next step

1. You (or Claude Code, on Sonnet) run the §3 extraction against menulab.com.tr and fill the §2 schema.
2. Synthesis of the captures → the Part 1 findings doc can happen in Claude Code (Opus for the reasoning pass) *or* you bring the distilled findings back here.
3. Findings → **Part 2: MVP structure + implementation spec.**

All decisions are now locked (§5), so **this spec is final — nothing blocks extraction.** Run §3 in Claude Code (Sonnet) whenever you're ready; the captured network JSON + the §2 schema become the Part 1 findings, which feed **Part 2: MVP structure + implementation spec.**
