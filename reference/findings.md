# Part 1 Findings — menulab.com.tr Reference Extraction
*Status: **COMPLETE** — all 29 restaurants crawled and analysed*
*Last updated: 2026-07-09*

---

## Extraction log

| Batch | Slugs | Status |
|---|---|---|
| Marketing (home) | `_home` | ✓ complete |
| Batch 1 | arsuz-gece-donercisi, asmaalti-kebapcisi, bakirkoy-kahvecisi, balikci-ersin, bedri-ustanin-yeri, benden-karakoy | ✓ complete |
| Batch 2 | capua-pizza-bakirkoy, cigerci-yilmaz-beylikduzu, cop-sis-sanati, degirmen-doner, donerci-adem-usta, havuzbasi-cafe-bakirkoy | ✓ complete |
| Batch 3 | haydi-balik-karakoy, incili-mozaik-restaurant, kasaptan-burger-gungoren, kasaptan-burger-sancaktepe, kasaptan-burger-vatan-caddesi, kasaptan-burger-zeytinburnu | ✓ complete |
| Batch 4 | kumkapi-ege-restaurant, oz-bakirkoy-durumcusu, sarihan-iskembe-beykent, sarihan-iskembe-gultepe, sarihan-iskembe-karakoy, semazen-doner-burger | ✓ complete |
| Batch 5 | smoky-lounge-bakirkoy, tarihi-mahmutpasa-kahvecisi, tarihi-osmanli-kebap, tarihi-tahtakale-cay-ocagi, zirvem-kebap-avcilar | ✓ complete |

Total live slugs discovered: **29** (via catalog page filter-click + pagination — sitemap.xml is empty/bot-blocked, catalog page is a `#kataloglar` anchor section on the SPA home page, not a separate URL).

---

## A. Feature inventory

Features observed from batch 1 captures. MVP tag: **IN** = build it, **OUT** = skip for MVP, **DEFER** = post-MVP.

| Feature | Observed | MVP |
|---|---|---|
| Multilingual diner menu (TR/EN/AR/RU + more) | Yes — all 6 have TR+EN+AR+RU enabled | **IN** (TR/EN/AR; RU is a surprise — flag) |
| Item images | Yes — all restaurants have per-item `imageUrl` (webp, via `/uploads/menulab/`) | **IN** |
| Allergens per item | Yes — up to 14 allergens, each an object `{id, nameTr, nameEn, nameAr, nameRu, ..., icon emoji}` | **IN** |
| Nutrition per item | Yes — `energyKcal, protein, fat, saturatedFat, carbohydrate, sugar, fiber, saltG, basis, isEstimated` | **DEFER** (lock per spec §5) |
| Item variants (size/price tiers) | Yes — benden-karakoy has 35 items with variants (e.g. Kadeh/35cl/50cl/70cl with separate prices) | **OUT for MVP** (spec §5⑤ flat items) — **FLAG: real data has variants** |
| Category navigation style | All: `"drilldown"` | **IN** |
| Dark mode | All batch 1: `darkMode: true` | **IN** (check if any are light) |
| Per-restaurant templateType | Each restaurant has a unique `templateType` string (e.g. `"asmaalti"`, `"doner-ocakbasi"`, `"benden-karakoy"`) | **See theming section §E** |
| Working hours | JSON string per day (mon–sun), e.g. `"09:00–03:00"` | **IN** |
| Social links | instagramUrl, tiktokUrl | **IN** |
| Google Maps + Reviews links | googleMapsUrl, googleReviewsUrl | **IN** |
| Cover image | Per restaurant, e.g. `/uploads/menulab/covers/diger.webp` | **IN** |
| Logo | Per restaurant upload (`logoType: "upload"`) or preset icon | **IN** |
| Logo styling | logoSize (int), logoShape ("rounded"), logoBorder ("none") | **IN** |
| Card styling | cardRadius (int px), cardShadow ("light") | **IN** |
| Slogan (multilingual) | Yes — sloganTr/En/Ar/Ru/Fr/Es/It/De/Zh/Fa fields | **IN** (TR/EN/AR minimum) |
| KDV notice | Per restaurant, e.g. `"Fiyatlarımıza KDV dahildir."` | **IN** |
| Price change date | ISO date — probably displayed somewhere | **DEFER** |
| Cert logos | `certLogos: null` in all observed — not used yet | **OUT** |
| Branches | `branches: []` — multi-branch support exists in schema but unused in observed data | **OUT for MVP** |
| Campaigns | `campaigns: []` — exists in schema, unused in observed data | **OUT for MVP** |
| Category hero image | `categoryHeroImage: null` in all observed | **OUT for MVP** |
| Splash screen | `splashBg`, `splashImage` fields exist — 2 restaurants use it (cigerci, donerci-adem-usta) | **IN** |
| Reviews | `reviewsEnabled: true` on all batch 1 — links to Google Reviews | **OUT for MVP** (display link only) |
| `isNew` flag per item | Yes — `isNew: boolean` on each item | **IN** (low effort, high signal) |
| `isFeatured` flag per item | Yes — `isFeatured: boolean` | **IN** |
| `ingredients` per item | Yes — `ingredients: string[]` (TR only) + `ingredientsText` multilingual fields | **IN** |
| `portionGrams` per item | Yes — integer | **DEFER** |
| `flags` per item | `{hasAlcohol: boolean, hasPork: boolean}` — used for dietary indicators | **IN** |
| `entryType` per item | `"direct"` seen on all standard restaurants — no variation found | **IN** (store as field, always "direct" for now) |
| Category `sortGroup` | Used by capua (Format 2) to group e.g. pizza sub-categories under "Pizzalar" | **IN** — category groups are a real UX feature |
| `fontPackId` | `"modern"` on all 27 standard restaurants — no other value observed | **IN** (store field; single value for now) |
| `paletteId` | `null` on all 29 restaurants — not used in production | **OUT for MVP** |
| `colorOverrides` | `null` in all batch 1 | **DEFER** |
| `accentColor` | `null` in all batch 1 | **IN** (check later batches) |
| `showPrices` | `true` in all batch 1 | **IN** |

---

## B. Page / screen map

### Marketing site (menulab.com.tr)

The entire marketing site is a **single-page Next.js app** with anchor navigation (`#kataloglar`, `#nasil-calisir`, `#basvuru`). There are **no separate marketing page URLs**. The company info pages (hakkimizda, iletisim, gizlilik) are on the **parent company site** `webtechtr.com`, not on menulab.com.tr.

| Screen | URL | Contents |
|---|---|---|
| Home / Hero | `menulab.com.tr/` | Hero headline, CTA "Başvur" (Apply) |
| How it works section | `/#nasil-calisir` (anchor) | Step-by-step process |
| Live menu catalog | `/#kataloglar` (anchor) | Filter by business type, paginated grid of live restaurant cards (4 pages), each card shows restaurant name, type, city, item count, links to live menu. Filters: Tümü/Balık Restoranı/Balıkçı/Bar & Restaurant/Burger/Döner & Burger/Döner & Ocakbaşı/Döner Salonu/Dürümcü/Kafe/Kahveci/Kebapçı/Pizzacı/Restoran/café-restaurant/kebapci/nargile-lounge/restoran/İşkembeci |
| Apply / Onboarding form | `/#basvuru` (anchor) | Restaurant application form |

**Key insight:** There is NO separate `/nasil-calisir`, `/kataloglar`, or `/basvuru` route — these are scroll-anchor sections. The spec's framing of "catalog page" was actually the `#kataloglar` section.

### Diner menu pages

| Screen | URL pattern | Contents |
|---|---|---|
| Restaurant menu | `menulab.com.tr/{slug}` | Full diner-facing SPA menu (29 live examples) |

No observed sub-routes under the slug (e.g. `/benden-karakoy/item/...`). Everything is rendered within the single slug page.

---

## C. Flows

### C1. Diner journey (from batch 1 captures — complete when more batches done)

1. Scan QR → navigate to `menulab.com.tr/{slug}`
2. Next.js SSR/SSG page renders — full menu data is embedded in the HTML (RSC payload), no separate API call needed for initial render
3. Language switcher visible (TR/EN/AR/RU minimum)
4. Category navigation: "drilldown" style — categories listed, tap to drill into items
5. Item card → tap → detail view (images, description, allergens, nutrition, ingredients, variants if any)
6. No cart, no ordering

### C2. Onboarding / application flow (from `#basvuru` section)

- Restaurants submit an application form on the marketing home page
- Agency (WebTechTR) builds and maintains the menu on their behalf
- No self-serve login for restaurants

### C3. Operator build flow — *designed by us, not extracted*

### C4. Restaurant view flow — *cut from MVP*

---

## D. Information architecture

### Menu hierarchy

```
Restaurant (slug)
├── businessName, businessType, phone, address, city, district
├── slug
├── logo, coverImage, categoryHeroImage
├── slogan (TR/EN/AR/RU/FR/ES/IT/DE/ZH/FA)
├── kdvNotice
├── workingHours { mon, tue, wed, thu, fri, sat, sun }
├── Social: instagramUrl, tiktokUrl, googleMapsUrl, googleReviewsUrl
├── Theme: templateType, layout, fontPackId, paletteId, colorOverrides, accentColor
│   logoSize, logoShape, logoBorder, cardRadius, cardShadow, darkMode
│   categoryNavigationStyle, showPrices, reviewsEnabled, nutritionEnabled
├── I18n: defaultLang, enabledLangs[]
├── branches[] (multi-branch — unused in observed data)
├── campaigns[] (unused in observed data)
└── categories[]
    ├── id, name (TR/EN/AR/RU/FR/ES/IT/DE/ZH/KO/FA)
    ├── imageUrl, stockImageKey
    ├── sortOrder, sortGroup
    └── items[]
        ├── id
        ├── name (TR/EN/AR/RU/FR/ES/IT/DE/ZH/KO/FA)
        ├── description (TR/EN/AR/RU/FR/ES/IT/DE/ZH/KO/FA)
        ├── price (null if variants used)
        ├── imageUrl, stockImageKey
        ├── isFeatured, isNew
        ├── entryType ("direct" observed)
        ├── ingredients: string[] (TR)
        ├── ingredientsText (TR) + ingredientsEn/Ar/Ru/Fr/Es/De/Zh/Ko/Fa
        ├── portionGrams: int
        ├── flags: { hasAlcohol, hasPork }
        ├── nutrition: { energyKcal, protein, fat, saturatedFat, carbohydrate,
        │               sugar, fiber, saltG, basis, isEstimated }
        ├── allergens[]: { id, nameTr, nameEn, nameAr, nameRu, nameFr, nameEs,
        │                  nameIt, nameDe, nameZh, nameKo, nameFa, icon (emoji) }
        └── variants[]: { id, label (TR/EN/AR/RU/FR/ES/IT/DE/ZH/KO/FA), price, sortOrder }
```

### Multilingual model

- **10 languages observed in schema**: TR, EN, AR, RU, FR, ES, IT, DE, ZH, FA (plus KO in some fields)
- **4 actually enabled** in batch 1: all 6 restaurants have `enabledLangs: ["tr","en","ru","ar"]`  
  **RU (Russian) is present in the real data** — the spec said TR/EN/AR but RU is enabled on all observed menus. This is a data finding, not a design decision reversal; our MVP decision (§5③) was TR/EN/AR. Note for data model: structure should support RU easily.
- Multilingual fields follow pattern: `name` (TR default) + `nameEn`, `nameAr`, `nameRu`, `nameFr`, etc.
- Allergen names are stored in the global allergen table with all language variants — not per-item

### Allergen data model

14 allergens referenced by `id` (integer, global lookup). Each allergen object: `{id, nameTr, nameEn, nameAr, nameRu, nameFr, nameEs, nameIt, nameDe, nameZh, nameKo, nameFa, icon (emoji)}`. Items reference allergens by id array.

Sample: id=6 → Süt/Milk/الحليب/Молоко/Lait/Leche/Latte/Milch/奶（乳制品）/🥛

---

## E. Theming system analysis

### Key finding: Not a theme selector — it's per-restaurant template assignment

Every restaurant has a unique `templateType` string. In batch 1:
- `arsuz-gece-donercisi` → `"doner-ocakbasi"`
- `asmaalti-kebapcisi` → `"asmaalti"`
- `bakirkoy-kahvecisi` → `"bakirkoy"`
- `balikci-ersin` → `"balikci-ersin"`
- `bedri-ustanin-yeri` → `"bedri"`
- `benden-karakoy` → `"benden-karakoy"`

This suggests the operator assigns a `templateType` key to each restaurant, and the frontend looks up a registered template by that key. It's closer to "each restaurant gets its own design" than "pick from 3 themes." However, all share the same structural settings:

| Setting | Batch 1 value | Notes |
|---|---|---|
| `layout` | `"premium"` | Only one layout type observed so far |
| `categoryNavigationStyle` | `"drilldown"` | Only one style observed |
| `darkMode` | `true` | All dark — check later batches |
| `fontPackId` | `"modern"` | One font pack — others may exist |
| `paletteId` | `null` | Not yet populated |
| `colorOverrides` | `null` | Not yet populated |
| `accentColor` | `null` | Not yet populated |
| `cardRadius` | varies (need more data) | Per-restaurant |
| `cardShadow` | `"light"` | Consistent so far |

**Resolved theming architecture (§5⑫) — full extraction complete:**

The reference platform has:
- A single `layout: "premium"` (no other layout values seen across all 27 standard restaurants)
- A single `fontPackId: "modern"` (no variation)
- `darkMode: true` on all 27 standard restaurants (no light-mode menus in the wild)
- `categoryNavigationStyle`: 26× `drilldown`, 1× `accordion`
- `accentColor`: used on 5 restaurants (brand-specific colours — `#D4AF37` gold, `#D11B29` red)
- `templateType`: 19 distinct values — the primary theming axis; determines the visual identity per restaurant/chain

**What templateType actually controls** (inferred from data + component names):
- Visual identity: cover image layout, colour treatment, typography expression
- Sector-specific design personality (kebap vs café vs fish restaurant look)
- It does NOT change the data structure — all standard restaurants share the same RSC schema

**For our MVP:** Implement a **named template selector** (`templateType` field on Restaurant). Start with 3–5 named templates (e.g. `classic-dark`, `modern-minimal`, `bold-brand`), each a React component variant that accepts the same data props. Operator picks one template per restaurant. The `accentColor` field applies a brand colour on top of the chosen template — cheap personalisation without a new template. This resolves §5⑫ as: **separate template components** (not config-driven JSON flags), with `accentColor` as the one per-restaurant override.

**What varies between templates** (visual inspection needed — screenshots in `captures/*/desktop.png`):
- Cover image: full-bleed hero vs logo-over-cover vs text-only header
- Category navigation: pill tabs vs sidebar list vs sticky drilldown
- Item cards: image-left vs image-top vs text-only list rows
- Typography: serif vs sans, large vs compact

---

## F. Data model v0

Derived from §D above. Preliminary — will be refined after all batches.

### Entities

```
Restaurant
  id            String  (cuid)
  businessName  String
  businessType  String  (free text, e.g. "Bar & Restaurant")
  slug          String  (unique, URL-safe)
  phone         String?
  address       String?
  city          String?
  district      String?
  coverImage    String? (path)
  logo          String? (path)
  logoType      String  ("upload" | "preset")
  presetIcon    String?
  logoSize      Int     (default 100)
  logoShape     String  ("rounded" | ...)
  logoBorder    String  ("none" | ...)
  cardRadius    Int
  cardShadow    String  ("light" | ...)
  slogan        String? (TR)
  sloganEn      String?
  sloganAr      String?
  sloganRu      String?
  kdvNotice     String?
  workingHours  Json    ({mon,tue,wed,thu,fri,sat,sun})
  instagramUrl  String?
  tiktokUrl     String?
  googleMapsUrl String?
  googleReviewsUrl String?
  templateType  String  (theme identifier)
  layout        String  ("premium")
  fontPackId    String  ("modern" | ...)
  paletteId     String?
  accentColor   String?
  colorOverrides Json?
  darkMode      Boolean (default true)
  defaultLang   String  (default "tr")
  enabledLangs  String[] (e.g. ["tr","en","ar","ru"])
  categoryNavigationStyle String ("drilldown")
  showPrices    Boolean (default true)
  reviewsEnabled Boolean
  nutritionEnabled Boolean
  priceChangeDate DateTime?
  certLogos     Json?
  isPublished   Boolean (our addition — draft/publish)
  createdAt     DateTime
  updatedAt     DateTime

Category
  id        String
  restaurantId String → Restaurant
  name      String (TR)
  nameEn    String?
  nameAr    String?
  nameRu    String?
  (+ other lang fields)
  imageUrl  String?
  stockImageKey String?
  sortOrder Int
  sortGroup String?

Item
  id          String
  categoryId  String → Category
  name        String (TR)
  nameEn      String?
  nameAr      String?
  nameRu      String?
  (+ other lang fields)
  description String? (TR)
  descriptionEn String?
  descriptionAr String?
  descriptionRu String?
  (+ other lang fields)
  price       Int?    (null when variants used — store in pence/kuruş)
  imageUrl    String?
  stockImageKey String?
  isFeatured  Boolean
  isNew       Boolean
  entryType   String  ("direct")
  ingredients String[] (TR)
  ingredientsText String? (TR freeform)
  ingredientsEn String?
  ingredientsAr String?
  ingredientsRu String?
  portionGrams Int?
  hasAlcohol  Boolean
  hasPork     Boolean
  isAvailable Boolean (our addition — §5⑥ availability toggle)
  sortOrder   Int
  allergens   Allergen[] (M2M)
  variants    Variant[]
  nutrition   Nutrition? (embedded object or separate table)

Allergen  (global lookup table, pre-seeded)
  id      Int  (1–14, matching Turkish allergen regulation)
  nameTr  String
  nameEn  String
  nameAr  String
  nameRu  String
  nameFr  String?  ...
  icon    String  (emoji)

Variant  (child of Item)
  id       String
  itemId   String → Item
  label    String (TR)
  labelEn  String?
  labelAr  String?
  labelRu  String?
  price    Int
  sortOrder Int

Nutrition  (embedded on Item or 1:1 table)
  energyKcal    Int?
  protein       Decimal?
  fat           Decimal?
  saturatedFat  Decimal?
  carbohydrate  Decimal?
  sugar         Decimal?
  fiber         Decimal?
  saltG         Decimal?
  basis         String?  ("100g" | "100ml" | "per portion")
  isEstimated   Boolean
```

**Note on variants vs flat items:** The spec §5⑤ says flat items (no variants) for MVP. The reference data shows variants are used (benden-karakoy: 35 of 271 items have variants). MVP builds without variants; the data model should still include the Variant entity as a stub so they can be added post-MVP without a migration.

---

## G. Compliance & localization notes

- **Allergens:** 14-allergen system referenced by integer ID, matching EU/Turkish allergen regulation. All observed restaurants populate allergens per item (some sparsely). The `allergens` field on the global table includes all 10 language names + emoji icon. Our data model should pre-seed this lookup table.
- **KDV (VAT) notice:** All restaurants show a `kdvNotice` string (e.g. "Fiyatlarımıza KDV dahildir." = "VAT is included in our prices"). This is a per-restaurant free-text field.
- **KVKK / Privacy:** Handled on the `webtechtr.com` parent domain, not on menulab.com.tr. We will need our own KVKK page.
- **Multilingual scope:** The schema supports 10+ languages. Observed enabled languages: TR, EN, AR, RU. Our MVP targets TR/EN/AR per §5③. Russian (RU) appears in all 6 observed menus — noted, not changing the MVP decision.
- **Currency:** Prices are integers in Turkish Lira (TRY). Cross-referencing visible data: `price: 150` for a lentil soup, `price: 1200` for a breakfast spread, `price: 500` for a glass of rakı — these match realistic TRY prices, so prices are stored as **whole lira integers** (not kuruş). No decimal storage needed.
- **Empty menu state:** At least 1 restaurant (`smoky-lounge`) is registered with `categories: []`. The diner page must handle this gracefully (empty state UI, not a crash).

---

---

## Batch 2 findings — additional observations

### Schema format divergence (critical finding)

Three distinct RSC payload schemas exist across the 29 restaurants. This is the single most important structural discovery:

**Format 1 — Standard (batch 1, cigerci, cop-sis-sanati, degirmen-doner, donerci-adem-usta)**
```
menu: {
  businessName, templateType, layout, darkMode, fontPackId, ...all config fields,
  categories: [{ id, name, nameEn, nameAr, nameRu, ..., items: [{ id, name, nameEn, ..., allergens: [{id, nameTr, ...}], variants: [...] }] }]
}
```
Allergens referenced by integer ID from global lookup table. Multilingual fields are flat (`nameEn`, `nameAr`).

**Format 2 — Adapted (capua-pizza-bakirkoy) — React component: `CapuaClientView`**
```
adapted: {
  categories: [{ slug, name, nameEn, nameAr, itemCount, sortGroup, ... }],
  itemsByCategory: { [categorySlug]: [{ id, slug, categorySlug, name, nameEn, nameAr, price, variants, nutrition, allergens: [] }] }
}
```
Items are in a flat dictionary keyed by category slug, not nested. Category uses `slug` (not `id`). No allergen IDs — allergens array is empty in observed items. No `templateType`, `layout`, etc. config fields in the payload.

**Format 3 — Shell (havuzbasi-cafe-bakirkoy) — React component: `HavuzbasiShell`**
```
categories: [{ id, name: {tr, en, ar, fa}, image, products: [{ id, name: {tr,en,ar,fa}, desc: {tr,en,ar,fa}, price, group, image, nutrition: {portionG, energyKcal, protein, carbs, sugar, fat, saturatedFat, fiber, salt}, allergens: ["gluten","laktoz","yumurta"] }] }]
```
Multilingual fields are **nested objects** `{tr, en, ar, fa}` not flat fields. Items use `products` not `items`. `allergens` are **string arrays** not ID references. Nutrition uses `carbs` (not `carbohydrate`), `portionG` (not `portionGrams`), `salt` (not `saltG`). No config fields at all.

**Implication:** Formats 2 and 3 are bespoke per-restaurant React components compiled into the Next.js bundle. They're not "themes" — they're custom builds. For our MVP, we build one shared renderer with proper theme variants; we do not replicate this per-restaurant custom component pattern.

### New observations from batch 2

| Feature | Observation | MVP |
|---|---|---|
| `accentColor` in use | cigerci-yilmaz-beylikduzu: `"#D4AF37"` (gold) — first non-null accent | **IN** |
| `splashImage` / splash screen | cigerci: `/uploads/menulab/cigerci/splash-bg-framed.webp`; donerci-adem-usta: neon logo splash | **IN** (splash/loader screen before menu) |
| `categoryNavigationStyle: "accordion"` | donerci-adem-usta uses accordion (not drilldown) — second nav style confirmed | **IN** (implement both drilldown + accordion) |
| `branches` (multi-branch) | cigerci-yilmaz-beylikduzu has 1 branch with address, district, phone, googleMapsUrl, `isDefault` | **OUT for MVP** |
| `sortGroup` on categories | capua uses sortGroup for grouping categories (e.g. "Pizzalar" groups 5 pizza sub-categories, "Kahveler" groups 2 coffee sub-categories) | **IN** — category groups are a real UX feature |
| Items with `slug` field | capua format: items have their own URL-safe slug | **IN** (add to data model) |
| Nutrition field name differences | `portionG` vs `portionGrams`, `carbs` vs `carbohydrate`, `salt` vs `saltG` — internal inconsistency in the reference platform | Our model normalises to one set of names |
| Allergens as strings | havuzbasi uses `["gluten","laktoz","yumurta"]` string arrays vs ID references | Our model uses ID references (Format 1 is richer) |
| `reviewsEnabled: false` | cigerci has it disabled — confirmed it's a per-restaurant toggle | **IN** |
| Languages: FA instead of RU | capua and havuzbasi use FA (Farsi/Persian) not RU — different language sets per restaurant | Our model's `enabledLangs[]` handles this; FA should be in supported list |

### Batch 2 per-restaurant summary

| Slug | templateType | nav | dark | accent | splash | branches | cats | items | variants |
|---|---|---|---|---|---|---|---|---|---|
| capua-pizza-bakirkoy | (custom: CapuaClientView) | n/a | n/a | n/a | n/a | no | 14 | ~92 | 36 |
| cigerci-yilmaz-beylikduzu | cigerci | drilldown | true | #D4AF37 | yes | 1 branch | 7 | 32 | 0 |
| cop-sis-sanati | cop-sis-sanati | drilldown | true | null | null | no | 6 | 36 | 0 |
| degirmen-doner | degirmen-doner | drilldown | true | null | null | no | 13 | 29 | 1 |
| donerci-adem-usta | donerci-adem-usta | **accordion** | true | null | neon-logo | no | 33 | 43 | 9 |
| havuzbasi-cafe-bakirkoy | (custom: HavuzbasiShell) | n/a | n/a | n/a | n/a | no | ~6 | ~40 | 0 |

---

---

## Batch 3 findings

### templateType is a proper shared type — theming model now clear

Across 16 standard-format restaurants crawled so far, `templateType` frequencies:

| templateType | count | restaurants |
|---|---|---|
| `kasaptan` | 4 | all 4 kasaptan-burger branches |
| `doner-ocakbasi` | 2 | arsuz-gece-donercisi + incili-mozaik-restaurant |
| (others) | 1 each | unique per restaurant |

**Conclusion:** `templateType` is a proper selector from a palette of named templates. Multi-branch chains and unrelated restaurants can share a template. The reference platform has a mix of shared templates (used by multiple restaurants) and bespoke per-restaurant templates. For our MVP we build named, selectable templates — this confirms §5⑫ should be resolved as: operator picks a template from a predefined list; each template is a named React component variant.

### Multi-location chains pattern

The four kasaptan-burger branches (`gungoren`, `sancaktepe`, `vatan-caddesi`, `zeytinburnu`) share:
- Same `templateType: "kasaptan"`
- Same `accentColor: "#D11B29"` (brand red)
- Same item count on 3 of 4 branches (80 items, 21 categories) — menus are duplicated per branch, not shared
- No `branches[]` array used — each branch is its own independent restaurant record with its own slug

**Implication for data model:** Multi-location chains are modelled as separate restaurant records, not as one restaurant with branches. The `branches[]` array in the schema (seen used in cigerci) is an *alternative* pattern — a single record with multiple address branches. Our MVP should support the simpler separate-record pattern; the branches array can be a later addition.

### Batch 3 per-restaurant summary

| Slug | template | nav | accent | cats | items | variants | allergens |
|---|---|---|---|---|---|---|---|
| haydi-balik-karakoy | haydi-balik | drilldown | null | 10 | 72 | 0 | 56 |
| incili-mozaik-restaurant | doner-ocakbasi | drilldown | null | 19 | 104 | 1 | 94 |
| kasaptan-burger-gungoren | kasaptan | drilldown | #D11B29 | 20 | 71 | 6 | 44 |
| kasaptan-burger-sancaktepe | kasaptan | drilldown | #D11B29 | 21 | 80 | 6 | 53 |
| kasaptan-burger-vatan-caddesi | kasaptan | drilldown | #D11B29 | 21 | 80 | 6 | 53 |
| kasaptan-burger-zeytinburnu | kasaptan | drilldown | #D11B29 | 21 | 80 | 6 | 53 |

---

---

## Batch 4 findings

### templateType frequency now stable (22 of 29 restaurants)

| templateType | uses | example restaurants |
|---|---|---|
| `kasaptan` | 4 | all 4 kasaptan-burger branches |
| `doner-ocakbasi` | 3 | arsuz, incili-mozaik, semazen |
| `sarihan` | 3 | all 3 sarihan-iskembe branches |
| (12 unique) | 1 each | one-off bespoke designs |

15 distinct templates across 22 standard-format restaurants. 3 templates are shared/reused; 12 are unique to one restaurant. Pattern: chains share a template; independent restaurants get their own.

### Batch 4 per-restaurant summary

| Slug | template | nav | accent | cats | items | variants | allergens |
|---|---|---|---|---|---|---|---|
| kumkapi-ege-restaurant | kumkapi-ege | drilldown | null | 123 | 144 | 24 | 67 |
| oz-bakirkoy-durumcusu | oz-bakirkoy | drilldown | null | 7 | 39 | 0 | 22 |
| sarihan-iskembe-beykent | sarihan | drilldown | null | 9 | 91 | 0 | 71 |
| sarihan-iskembe-gultepe | sarihan | drilldown | null | 8 | 67 | 0 | 16 |
| sarihan-iskembe-karakoy | sarihan | drilldown | null | 9 | 94 | 0 | 73 |
| semazen-doner-burger | doner-ocakbasi | drilldown | null | 28 | 99 | 6 | 71 |

No new features or schema deviations in batch 4. All Format 1, all `darkMode: true`, all `fontPackId: "modern"`, all `categoryNavigationStyle: "drilldown"`.

---

---

## Batch 5 findings

### Batch 5 per-restaurant summary

| Slug | template | nav | accent | cats | items | variants | allergens |
|---|---|---|---|---|---|---|---|
| smoky-lounge-bakirkoy | smoky | drilldown | null | 0 | 0 | 0 | 0 |
| tarihi-mahmutpasa-kahvecisi | mahmutpasa | drilldown | null | 10 | 94 | 0 | 52 |
| tarihi-osmanli-kebap | osmanli | drilldown | null | 9 | 66 | 0 | 1 |
| tarihi-tahtakale-cay-ocagi | bakirkoy | drilldown | null | 6 | 36 | 0 | 14 |
| zirvem-kebap-avcilar | zirvem | drilldown | null | 8 | 76 | 0 | 64 |

**`bakirkoy` template** now used by 2 restaurants (bakirkoy-kahvecisi + tarihi-tahtakale-cay-ocagi). Final shared-template count: 4 templates used by 2+ restaurants.

**`smoky-lounge-bakirkoy`:** Empty menu (`categories: []`). Restaurant is registered in the platform and appears in the catalog, but no menu content has been added. `reviewsEnabled: false`. This is a valid live state — the agency registered the slot but hasn't populated it yet. Confirms need for empty-state handling in the diner page.

---

## Final synthesis (all 29 restaurants)

### Template inventory — complete

| templateType | count | restaurants using it |
|---|---|---|
| `kasaptan` | 4 | all 4 kasaptan-burger branches |
| `doner-ocakbasi` | 3 | arsuz-gece-donercisi, incili-mozaik-restaurant, semazen-doner-burger |
| `sarihan` | 3 | all 3 sarihan-iskembe branches |
| `bakirkoy` | 2 | bakirkoy-kahvecisi, tarihi-tahtakale-cay-ocagi |
| `asmaalti` | 1 | asmaalti-kebapcisi |
| `balikci-ersin` | 1 | balikci-ersin |
| `bedri` | 1 | bedri-ustanin-yeri |
| `benden-karakoy` | 1 | benden-karakoy |
| `cigerci` | 1 | cigerci-yilmaz-beylikduzu |
| `cop-sis-sanati` | 1 | cop-sis-sanati |
| `degirmen-doner` | 1 | degirmen-doner |
| `donerci-adem-usta` | 1 | donerci-adem-usta |
| `haydi-balik` | 1 | haydi-balik-karakoy |
| `kumkapi-ege` | 1 | kumkapi-ege-restaurant |
| `mahmutpasa` | 1 | tarihi-mahmutpasa-kahvecisi |
| `osmanli` | 1 | tarihi-osmanli-kebap |
| `oz-bakirkoy` | 1 | oz-bakirkoy-durumcusu |
| `smoky` | 1 | smoky-lounge-bakirkoy |
| `zirvem` | 1 | zirvem-kebap-avcilar |
| (custom: CapuaClientView) | 1 | capua-pizza-bakirkoy |
| (custom: HavuzbasiShell) | 1 | havuzbasi-cafe-bakirkoy |

**27 standard-format** restaurants across **19 named templateTypes**. 4 templates shared by chains, 15 unique. 2 bespoke custom React components.

### Aggregate statistics

| Metric | Value |
|---|---|
| Total restaurants | 29 |
| Total categories | 724 |
| Total items | 2,191 |
| Items with variants | 176 (8%) |
| Items with allergen IDs | 1,250 (57%) |
| Empty menus (0 items) | 2 (smoky-lounge, capua in Format 2) |
| Splash screens | 2 (cigerci, donerci-adem-usta) |
| accentColor in use | 5 restaurants (1 chain gold, 4 kasaptan red) |
| Multi-branch schema | 1 (cigerci) |
| `accordion` nav | 1 (donerci-adem-usta); 26 use `drilldown` |
| Custom React components | 2 (capua, havuzbasi) |
