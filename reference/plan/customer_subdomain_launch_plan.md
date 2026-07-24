# İnci Cafe Restaurant and Subdomain Launch Plan

*Status: proposed · Priority: first · Created: 2026-07-16*

## 1. Objective

Launch İnci Cafe Restaurant on a dedicated subdomain with a polished, mobile-first restaurant menu. The interaction model remains inspired by Menulab's Doğan Restaurant example, while the visual identity comes from İnci's supplied logo and its existing restaurant presence.

The result should feel recognizably İnci rather than like a generic Doğan clone. Doğan supplies the journey and interaction reference; İnci supplies the brand palette, cuisine, history, and tone. Any missing artwork or photography will use strong, replaceable defaults.

## 2. Decisions already made

- The supplied İnci logo is the primary identity reference.
- The initial art direction uses oxblood burgundy, muted heritage gold, warm ivory, and charcoal, derived from the supplied logo.
- The restaurant is a broad Turkish café-restaurant rather than a seafood-only venue. Its identity should foreground grills, pide/lahmacun, testi dishes, Turkish classics, drinks, and approachable hospitality.
- Doğan's full-screen splash, visual category gallery, category list, product sheet, persistent atmosphere, and restrained transitions remain the structural reference.
- Doğan's maritime illustration, blue palette, marlin logo, and seafood-specific symbolism are explicitly excluded.
- The new design will be a dedicated structural template, not another color-token variation of the existing `MenuView`.
- Branding and business settings will initially be managed by the internal operator back office.
- A customer-facing account/dashboard is a separate future project because it requires tenant authorization, account recovery, auditing, and role boundaries.
- The subdomain/hostname setting remains operator-only because DNS names require validation and collision protection.
- Supported raster uploads will be PNG, JPEG, and WebP. Files will be validated, resized, and optimized. SVG will not be accepted unless a sanitization strategy is added.
- The initial supported content languages remain Turkish, English, and Arabic. Additional languages are a future data-model decision, not cosmetic parity with the reference.
- Internal star ratings, written reviews, and staff ratings are explicitly deferred; launch uses the configured external review link.

## 3. What can proceed without customer assets

The following can be completed now:

- Page structure and interactions.
- Responsive layout and typography.
- Original temporary background artwork.
- Dynamic text wordmark or monogram based on the restaurant name.
- Designed category and item fallbacks.
- Upload and replacement controls.
- Subdomain routing.
- QR URL generation.
- Restaurant information and social-action sections.
- Visual regression and browser testing.

The only factual information required before final launch is the correct restaurant name, menu and prices, contact details, address, and approval of the production hostname. A custom logo or professional photography is not required.

## 3A. İnci identity evidence and constraints

### Evidence available now

- Supplied circular logo: oxblood field, gold serif wordmark, symmetrical laurel branches, and “since 1978”.
- Existing exterior: informal street-side seating, warm lighting, white tablecloths, and an approachable neighborhood/tourist-district restaurant character.
- Existing menu imagery: Turkish grills, kebabs, pide/lahmacun, testi dishes, fish, hot/cold drinks, and multilingual presentation.
- Existing Restoranım profile: İnci Cafe Restaurant, Fatih/İstanbul, with contact, location, and working-hours data that can be used as provisional reference only.

### Brand system

- Primary burgundy: approximately `#882634` from the supplied raster logo.
- Heritage gold: approximately `#D5A95D` from the supplied raster logo.
- Supporting colors: warm ivory, parchment, deep charcoal, and restrained olive/herb green in food imagery.
- Display typography: confident classical serif with Turkish glyph support.
- Body typography: highly readable humanist sans-serif.
- Motifs: laurel leaves, a subtle pearl/dot device, fine rules, arches, table-linen texture, and warm ambient light.
- Avoid: nautical symbols, neon, generic luxury-black styling, excessive Ottoman ornament, fake historical claims, and overly polished fine-dining imagery that contradicts the actual restaurant.

### Asset and factual-data cautions

- The supplied logo visibly contains “Restauran” rather than “Restaurant”. Use it as supplied for prototype work, but do not silently redraw or correct the customer's mark; obtain or approve a corrected export before public launch.
- “Since 1978” may be used provisionally because it is present in the supplied logo, but it remains a launch fact to confirm.
- Existing Restoranım photographs are identity/menu evidence, not automatically approved production assets. Some may be third-party uploads and their reuse rights are unknown.
- Prices visible in old menu photographs are not authoritative and must not be imported.
- Address, phone, hours, menu items, translations, and social/review links must be confirmed before launch even if provisional values are entered for staging.
- The old printed menu includes Russian as well as Turkish, English, and Arabic. Russian should remain hidden until real Russian translations exist; the current application must not advertise a language that only falls back to Turkish.

## 4. Phase C0 — launch-safety checkpoint

This work does not need to block visual development, but it must be complete before the public launch:

- Rotate any admin credential that has been exposed or shared in project documentation or chat history.
- Establish a clean Git baseline before implementation begins.
- Verify that real environment files and secrets are ignored and that example environment files contain no credentials.
- Fix active lint and build errors.
- Review authentication boundaries rather than relying only on route-level proxy behavior.
- Harden uploads with MIME validation, size limits, generated filenames, image decoding, and replacement/deletion cleanup.
- Replace the deprecated `middleware.ts` convention with this project's Next.js `proxy.ts` convention when the routing work is implemented.

## 5. Phase C1 — hostname and subdomain routing

### Work

- Add a validated, unique public hostname/subdomain association for the restaurant.
- Resolve the incoming hostname and internally route the subdomain root to the correct restaurant.
- Keep the existing `/{slug}` address working as a fallback and operator preview URL.
- Exclude framework assets, image optimization, APIs, and operator routes from tenant rewrites.
- Ensure the main domain still serves the main website and operator routes.
- Generate restaurant-aware canonical metadata and social-sharing URLs.
- Make QR codes use the restaurant's preferred public URL instead of always using the global site URL plus slug.
- Configure the production subdomain and HTTPS with the hosting provider.

### Important constraint

Simply pointing a subdomain at the current deployment is insufficient. The current root behavior does not select a restaurant, so host-aware application routing is required.

### Acceptance criteria

- Visiting the customer subdomain at `/` opens the correct published restaurant.
- Refreshing a category or item state does not fall into the main/operator application.
- The direct slug URL still works.
- Main-domain login and dashboard routes remain unaffected.
- QR codes resolve to the customer subdomain.
- Unknown or unconfigured hostnames fail safely.

## 6. Phase C2 — operator-managed branding and profile settings

### Reuse existing data where possible

The current restaurant model already includes many useful fields, including logo, cover image, slogan, colors, phone, address, city/district, working hours, Instagram, TikTok, Maps, review link, and tax notice. These should be exposed and completed before inventing duplicate fields.

### Complete or add

- Logo upload with text-wordmark fallback.
- Splash/background artwork upload.
- Cover image upload.
- Slogan and short introduction text.
- Splash enable/disable setting.
- Template selection.
- Phone, address, city/district, and working-hours controls.
- Instagram, TikTok, Maps, and review links.
- Tax/KDV notice.
- Optional last-price-change date.
- Optional localized kitchen/allergen and nutrition-estimate notices.
- Category image upload; the schema already has `Category.imageUrl`, but the current category editor does not expose it properly.
- Optional item portion weight/display label.
- Complete nutrition editing for energy, protein, fat, saturated fat, carbohydrate, sugar, fiber, salt, measurement basis, and estimated-value status.
- Preview, crop guidance, replacement, validation, optimization, and cleanup for images.

### Fallback hierarchy

- Missing logo: generated wordmark or initials from the restaurant name.
- Missing background: original built-in template artwork.
- Missing category image: cuisine-appropriate built-in or generated category artwork.
- Missing item image: an intentional neutral placeholder, not a random stock image.
- Missing optional profile field: hide that action cleanly rather than rendering empty UI.

### Acceptance criteria

- Every visible branding asset can be replaced without a code change.
- Missing assets never result in broken images or collapsed layout.
- Replacing an upload does not leave uncontrolled orphaned files.
- Changes appear in preview before publication.

## 7. Phase C3 — dedicated restaurant template

Working name: `inci-heritage`. This is the customer-specific template identity; the underlying structural pattern may later be generalized.

This must be a dedicated template component with its own layout and interactions. Recoloring the current generic stacked menu is not sufficient.

### State 1: splash

- Full-screen original burgundy-and-gold heritage background using restrained laurel, pearl, arch, or warm restaurant-light cues.
- Restaurant wordmark/logo.
- Serif-led headline or a confirmed “since 1978” heritage line.
- Clear "View Menu" action.
- Language selector.
- Restrained transition into the category gallery.
- Respect reduced-motion preferences if transitions are used.

### State 2: category gallery

- Persistent İnci-branded background and compact restaurant header.
- Image-led category cards.
- Warm ivory photo surfaces with burgundy labels and restrained gold rules.
- Two-column mobile gallery where content permits.
- A deliberately composed desktop column rather than a stretched mobile page.
- Clear labels with sufficient contrast over imagery.

### State 3: category menu

- Back navigation and language control.
- Strong category heading.
- Editorial product rows with restrained separators.
- Product image, name, description/portion information, allergen indicators, and price.
- Gold price treatment, ivory/charcoal text hierarchy, and food-first imagery suited to Turkish café-restaurant dishes.
- When a non-Turkish language is selected, optionally retain the original Turkish product name as secondary text.
- Proper unavailable, new, and featured states.
- Restrained state transitions that preserve browser back behavior and respect reduced-motion preferences.

### State 4: item detail

- Mobile bottom sheet and an appropriate desktop dialog/panel.
- Large product image or designed fallback.
- Warm ivory sheet surface with burgundy typography and restrained gold details.
- Product name, price, description, ingredients, and portion information.
- Allergen presentation.
- Complete nutrition grid, measurement basis, and estimated-value notice when data exists.
- Restaurant-specific kitchen/cross-contamination notice when configured.
- Close, keyboard, focus, and back-button behavior.

### State 5: restaurant information and actions

- Tax/KDV and optional pricing notices.
- Call, directions, Instagram, TikTok, and review actions when configured.
- Address and working hours.
- Product attribution/footer without competing with the restaurant brand.

### Acceptance criteria

- The experience has a coherent visual narrative across all five states.
- Mobile and desktop have intentional compositions.
- The result feels related to the customer's reference without reproducing its protected assets or distinctive logo.
- Template-specific layout does not leak into other existing themes.

## 8. Phase C4 — content and temporary imagery

- Verify the real categories, products, prices, allergens, and translations.
- Match temporary category imagery to the restaurant's actual cuisine.
- Prioritize coherent categories such as grills, pide/lahmacun, testi dishes, Turkish classics, fish, desserts, and hot/cold drinks when they exist in the confirmed menu.
- Remove the random Picsum-based visual language from this customer's public experience.
- Use original generated artwork or appropriately licensed imagery for temporary assets.
- Do not publish downloaded Restoranım/gallery photographs unless the customer confirms ownership and reuse permission.
- Test unusually long names, missing descriptions, unavailable items, empty categories, and items without images.
- Swap in customer-supplied assets later without redesigning the page.

## 9. Phase C5 — Playwright visual QA

Playwright is the primary comparison and regression tool because it renders the real application in Chromium and captures actual layout, fonts, images, and interactions.

### Required captures

- Splash screen.
- Category gallery at the top and footer.
- Category menu.
- Item detail sheet/panel.
- Restaurant information/footer.
- Mobile viewport around `390 × 844`.
- Desktop viewport around `1440 × 1000`.
- Turkish and every enabled alternate language.
- Missing-image, long-text, empty-content, and unavailable-item states.

### Additional checks

- Keyboard navigation and focus management.
- Color contrast and touch target sizing.
- Reduced motion.
- Image loading, layout shift, and page weight.
- QR codes on physical phones.
- Direct links, refreshes, and browser back behavior on the subdomain.
- Main domain and operator application regression tests.

## 10. Phase C6 — staging and launch

- Publish a staging version on the intended routing architecture.
- Provide the customer with a short mobile and desktop preview rather than asking them to inspect unfinished admin pages.
- Convert feedback into a bounded launch checklist.
- Configure production DNS and HTTPS.
- Verify canonical and QR URLs after deployment.
- Run the launch-safety checkpoint.
- Publish and monitor runtime errors and broken assets.

## 11. Definition of done

- The customer subdomain opens directly to the correct restaurant menu.
- The restaurant has an original, polished visual identity with no dependence on customer-supplied artwork.
- Splash, category gallery, category menu, item detail, and restaurant-information states are complete.
- Branding and profile content can be replaced from the operator back office without development.
- Mobile and desktop visual tests pass.
- QR, metadata, translations, uploads, and missing-content states work correctly.
- No operator interface or credentials are exposed through the customer subdomain.

## 12. Explicitly deferred

- Customer self-service accounts and dashboard.
- Internal star ratings, written reviews, review moderation, and staff ratings.
- Arbitrary custom-domain automation for many customers beyond the hostname foundation needed here.
- Billing and subscription management.
- Analytics dashboards for restaurant customers.
- Exact visual cloning of Menulab or Doğan Restaurant.
