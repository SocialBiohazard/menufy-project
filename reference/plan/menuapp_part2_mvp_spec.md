# MenuApp — Part 2: MVP Structure + Implementation Spec
*Working doc · Part 2 of 3 (Extract → MVP spec → Implement) · Built from Part 1 findings + reconciliation*

---

## 0. Status

- Part 1 (extraction): **complete.** 29 restaurants, marketing site, full schema/theming/compliance analysis.
- This doc: **Part 2.** Reconciles the original locked spec (§5 of Part 1 spec) against what Part 1 actually found, closes the 3 open decisions, and produces the buildable data model + operator flow.
- Next: **Part 3 — implementation**, in Claude Code.

---

## 1. Scope reconciliation — final

### 1a. Original locked scope (carried forward unchanged)

① restaurant auth cut · ② allergens mandatory per-item · ③ languages TR+EN+AR · ④ images in · ⑤ flat items, no variants/modifiers · ⑥ availability toggle in + scheduling in · ⑦ draft/publish in · ⑧ slug subpath · ⑨ QR generation in · ⑩ one operator login, no roles · ⑪ manual entry, no import · ⑬ analytics/reviews/listing-sync/billing deferred.

### 1b. Resolved this session

| Decision | Resolution |
|---|---|
| Nutrition per item | **In, optional field.** Not mandatory like allergens — operator fills in if they have the data. |
| Category navigation style | **Both drilldown + accordion.** Per-restaurant setting, operator picks. |
| Restaurant-profile extras (hours, socials, Maps/Reviews, KDV notice, slogan, logo/card styling) | **Schema-ready, not built.** Fields exist as nullable columns so no migration is needed later, but no builder UI or diner-page rendering ships for them in MVP. They sit in a named **Phase 1.5 queue** — nothing here goes live until you explicitly greenlight it, field-by-field or as a batch. |

### 1c. Small calls made without asking (stated, not hidden)

| Item | Call | Why |
|---|---|---|
| Multi-location chains | No special modeling. Each location = its own `Restaurant` row on its own slug. | Already how the reference data does it (kasaptan ×4, sarihan ×3). No `branches[]` array needed. |
| Empty menu state | Built regardless. | Not optional — it's a real state (`smoky-lounge`), needs a non-broken diner page. |
| `sortGroup` category grouping | Deferred. | 1/29 restaurants used it. |
| Splash screens | Deferred. | Cosmetic, 2/29 restaurants. |
| `isNew` / `isFeatured` item flags | **In.** | Boolean, zero build cost, broadly populated in real data. |
| `ingredients` field | **In**, TR only for MVP. | Populated broadly, low effort, adjacent to allergen trust signal. |
| Variants | Schema stub only — table exists, not wired into builder or diner UI. | Locked ⑤ says no variants, but 8% of real items have them; avoids a future migration. |
| RU / FA languages | Schema supports arbitrary `enabledLangs[]`, but MVP UI only exposes TR/EN/AR. | Matches locked ③; keeps door open since real data uses RU/FA at scale. |

---

## 2. Data model v1 (Prisma)

```prisma
enum NavigationStyle {
  DRILLDOWN
  ACCORDION
}

model Restaurant {
  id           String   @id @default(cuid())
  slug         String   @unique
  businessName String
  businessType String?

  // --- Phase 1.5 queue: nullable, not built into MVP UI yet ---
  phone            String?
  address          String?
  city             String?
  district         String?
  workingHours     Json?
  instagramUrl     String?
  tiktokUrl        String?
  googleMapsUrl    String?
  googleReviewsUrl String?
  kdvNotice        String?
  slogan           String?
  sloganEn         String?
  sloganAr         String?
  // --------------------------------------------------------------

  logo       String?
  coverImage String?

  templateType            String            // key into the code-level template registry
  accentColor              String?
  categoryNavigationStyle NavigationStyle    @default(DRILLDOWN)
  darkMode                 Boolean           @default(true)

  defaultLang  String   @default("tr")
  enabledLangs String[] @default(["tr", "en", "ar"])

  isPublished Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  categories    Category[]
  menuSchedules MenuSchedule[]
}

model Category {
  id           String     @id @default(cuid())
  restaurantId String
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id])

  name   String
  nameEn String?
  nameAr String?

  imageUrl  String?
  sortOrder Int     @default(0)
  sortGroup String? // present, unused in MVP UI — deferred grouping feature

  items Item[]
}

model Item {
  id         String   @id @default(cuid())
  categoryId String
  category   Category @relation(fields: [categoryId], references: [id])

  name          String
  nameEn        String?
  nameAr        String?
  description   String?
  descriptionEn String?
  descriptionAr String?

  price       Int      // whole currency units (matches reference: TRY stored as whole lira)
  imageUrl    String?
  ingredients String?  // TR only, freeform

  isNew       Boolean @default(false)
  isFeatured  Boolean @default(false)
  isAvailable Boolean @default(true)   // the "86" toggle
  hasAlcohol  Boolean @default(false)
  hasPork     Boolean @default(false)
  sortOrder   Int     @default(0)

  allergens ItemAllergen[]
  nutrition Nutrition?
  variants  Variant[]        // schema stub — not exposed in MVP builder/diner UI
}

model Allergen {
  id     Int    @id           // 1–14, Turkish allergen regulation, pre-seeded
  nameTr String
  nameEn String
  nameAr String
  icon   String               // emoji
  items  ItemAllergen[]
}

model ItemAllergen {
  itemId     String
  allergenId Int
  item       Item     @relation(fields: [itemId], references: [id])
  allergen   Allergen @relation(fields: [allergenId], references: [id])

  @@id([itemId, allergenId])
}

model Nutrition {
  id     String @id @default(cuid())
  itemId String @unique
  item   Item   @relation(fields: [itemId], references: [id])

  energyKcal   Int?
  protein      Float?
  fat          Float?
  saturatedFat Float?
  carbohydrate Float?
  sugar        Float?
  fiber        Float?
  saltG        Float?
  basis        String?  // "100g" | "100ml" | "per portion"
  isEstimated  Boolean  @default(false)
}

model Variant {
  id     String @id @default(cuid())
  itemId String
  item   Item   @relation(fields: [itemId], references: [id])

  label     String
  labelEn   String?
  labelAr   String?
  price     Int
  sortOrder Int    @default(0)
}

model MenuSchedule {
  id           String     @id @default(cuid())
  restaurantId String
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id])

  name        String   // e.g. "Breakfast", "Dinner"
  daysOfWeek  Int[]    // 0–6
  startTime   String   // "07:00"
  endTime     String   // "11:00"
  categoryIds String[] // categories active during this window
}
```

**Build-order note on `MenuSchedule`:** per the original spec's own flag, this is the heavier half of ⑥. Ship `isAvailable` first — it's a single boolean toggle and covers most real-world "86 the salmon" needs. `MenuSchedule` is a fast-follow, not day-one.

---

## 3. Theming architecture (resolves §5⑫)

**Decision:** named React template components, not config-driven JSON. Confirmed by Part 1 — 19 distinct `templateType`s in the reference data, and the two fully bespoke ones (capua, havuzbasi) prove templates are genuinely different component trees, not a shared renderer with flags.

- Each template = one React component, same data props (`Restaurant` + `categories[]` with nested `items[]`).
- `accentColor` is the one cross-template override — applies a brand color on top of whichever template is chosen, cheap personalization without a new component.
- `categoryNavigationStyle` (`DRILLDOWN` | `ACCORDION`) is a restaurant-level setting, not baked into the template — a template should render either, so nav style and visual identity stay decoupled.

**Starting template set for MVP (3–5), suggested by business-type clustering in the extracted data — refine after you review `captures/*/desktop.png`:**

| Working name | Inspired by | Notes |
|---|---|---|
| `classic-dark` | Baseline pattern across most restaurants | Default; dark mode, drilldown |
| `warm-heritage` | kasaptan / sarihan chains | Warm accent color as first-class (red/gold), traditional feel |
| `coastal-fresh` | balikci-ersin, haydi-balik | Lighter/fresher palette for seafood |
| `minimal-cafe` | bakirkoy-kahvecisi style | Simpler layout, fewer categories, café pacing |

This is a starting hypothesis, not locked — the actual visual differentiation (cover treatment, card layout, typography) still needs eyes on the screenshots.

---

## 4. Operator build flow (designed by us — no reference to extract)

Operator authentication is implemented with database-backed accounts and sessions.

1. **Dashboard** — list of restaurants, publish status, quick links to public slug + QR.
2. **Restaurant editor**
   - *Core tab* (required to publish): business name, slug, template, accent color, nav style, default language, enabled languages.
   - *Profile tab* (Phase 1.5, hidden/disabled until greenlit): hours, socials, Maps/Reviews links, KDV notice, slogan.
   - *Menu builder*: categories (create/reorder/rename), items within category — name/description in TR+EN+AR, price, image upload, allergen multiselect (from pre-seeded 14), ingredients (TR), nutrition (optional fields), `isNew`/`isFeatured` toggles, availability toggle.
   - *Publish*: draft/publish switch, gates whether the public slug shows live content or a "not yet published" state.
   - *QR*: generate + download QR pointing at `yourdomain/{slug}`.
3. **Public diner page** — `/{slug}`, renders the assigned template with the published menu. Handles empty-menu state gracefully.

---

## 5. Stack confirmation

- Next.js (App Router) + PostgreSQL via Prisma, database-backed operator/customer authentication, and local or S3-compatible media storage.
- Application authorization gates operator, customer, and public access. Public diners only receive published snapshots; unpublished drafts remain private.
- Hosting: Railway with Railway PostgreSQL and object storage.

---

## 6. Compliance

- **KVKK page:** menulab handles this on the parent `webtechtr.com` domain — we don't have a reference to extract. Needs its own page, written for our domain, before public launch.
- **Allergen lookup table:** pre-seed all 14, TR/EN/AR (matching locked ③, not the full 10-language reference set).
- **KDV notice:** lives in the Phase 1.5 queue — schema field exists, not required for MVP launch.

---

## 7. Fully deferred, untouched (no new decision needed)

- Variants/modifiers (schema stub only, no UI)
- Restaurant-side auth (cut)
- Analytics, review management, listing sync, billing (deferred)
- `sortGroup` category grouping, splash screens (deferred)
- Multi-branch array pattern (chains handled via separate restaurant records instead)

---

## 8. Next step

Part 3 — implementation. Use this document with the Prisma schema, migrate PostgreSQL, seed the allergen table, then build dashboard → restaurant editor → menu builder → public slug page, in that order.
