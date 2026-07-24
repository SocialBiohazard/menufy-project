# Main Website Plan

*Status: proposed · Priority: after first-customer launch · Created: 2026-07-16*

## 1. Objective

Replace the current root redirect with a polished public website that explains the managed digital-menu service, demonstrates real restaurant menus, and converts restaurant owners into qualified enquiries.

The main website is a separate design problem from the customer template. It should establish the platform's own brand and must not inherit the first customer's midnight restaurant aesthetic.

## 2. Product and design principles

- Present the product as a managed service, consistent with the current operator-led business model.
- Optimize the site around one primary conversion action.
- Use the first launched customer as evidence and a case study only after approval.
- Create bespoke marketing components rather than composing the site entirely from dashboard-style cards, pills, and generic gradients.
- Share low-level brand tokens where useful, but keep marketing layouts separate from restaurant template layouts.
- Prefer a focused, convincing first release over a large collection of thin pages.
- Use Figma or an equivalent design surface for early art-direction comparison because this website is more open-ended than the customer template.

## 3. Phase M0 — positioning and content brief

### Decisions required

- Primary audience and geographic focus.
- Service name and concise value proposition.
- Primary action: request a menu, contact sales, or apply for onboarding.
- Pricing visibility: public pricing, starting price, or consultation-only.
- Turkish-first versus multilingual launch scope.
- Tone: premium hospitality partner, practical local service, or another deliberate position.

### Deliverables

- One-sentence positioning statement.
- Primary and secondary calls to action.
- Homepage content outline.
- Feature/benefit hierarchy.
- Proof points that can be supported honestly.
- Initial FAQ and objection list.

### Acceptance criteria

- A visitor can understand the offer, target customer, and next action within the hero section.
- Claims are specific and supportable rather than generic software-marketing language.

## 4. Phase M1 — information architecture

The initial release can be a strong single-page marketing site with supporting legal and operator routes.

### Homepage sections

1. Focused hero with one primary call to action.
2. Live restaurant-menu preview or device presentation.
3. Explanation of the managed service.
4. Benefits for restaurant owners and diners.
5. How onboarding and updates work.
6. Published examples or template gallery.
7. First-customer case study after approval.
8. Frequently asked questions.
9. Contact/application form.
10. Footer with company, contact, privacy, and operator-login links.

The first release should use a curated examples section. Search, business-type filters, and pagination become useful only after enough published restaurants exist to justify them.

### Supporting routes

- Privacy notice.
- Terms or service information if required.
- Contact/application success state.
- Existing `/login` and `/dashboard` routes, visually secondary and functionally unchanged.
- Published restaurant slug routes and restaurant subdomains.

### Acceptance criteria

- Public visitors reaching `/` no longer fall into an operator-oriented flow.
- Restaurant menus, operator routes, and the marketing site have unambiguous navigation boundaries.
- Mobile information order remains persuasive without relying on desktop-only artwork.

## 5. Phase M2 — visual direction

Create two or three compact visual directions before committing to implementation.

### Each direction should define

- Typography pairing and hierarchy.
- Color system.
- Photography, illustration, or product-UI presentation style.
- Hero composition on mobile and desktop.
- CTA and form treatment.
- Menu-example presentation.
- Spacing, section rhythm, and surface treatment.

### Recommended process

- Start with low-fidelity content structure.
- Create focused desktop and mobile hero/homepage concepts in Figma or an equivalent tool.
- Select one direction based on clarity, distinctiveness, and implementation realism.
- Build a small code prototype of the selected direction.
- Compare the browser rendering against the design at explicit viewports.

### Acceptance criteria

- The selected direction is recognizably the platform's brand, not a generic SaaS template.
- The design still works with realistic Turkish copy and real menu screenshots.
- Mobile is designed directly rather than derived by stacking desktop sections.

## 6. Phase M3 — public-site implementation

- Replace the root redirect with the marketing homepage.
- Build bespoke marketing sections and responsive navigation.
- Integrate live or safely curated published-menu examples.
- Prefer controlled screenshots or a dedicated non-interactive preview mode over raw menu iframes that can be obscured by cookie dialogs.
- Add a clear operator login without presenting the dashboard as the main product experience.
- Keep restaurant template CSS and marketing-site CSS isolated.
- Add loading and error states for any dynamic examples.
- Ensure disabled or unpublished restaurants never appear publicly.

### Acceptance criteria

- The homepage is complete at mobile and desktop sizes.
- Existing public menus, customer subdomain routing, login, and dashboard are unaffected.
- Published examples come from an intentional, controlled query rather than leaking draft data.

## 7. Phase M4 — enquiry and conversion flow

- Add a validated contact/application form collecting name, phone, business name, city, business type/sector, optional email, optional message, and explicit privacy acknowledgement.
- Offer a direct WhatsApp contact action when an official business number is available.
- Define a reliable lead destination: database record, transactional email, or both.
- Add spam protection and rate limiting.
- Include consent language appropriate to the stored data and analytics in use.
- Provide deliberate submitting, success, validation-error, and server-error states.
- Track meaningful events such as primary CTA, example-menu open, form start, and successful submission.

### Acceptance criteria

- A legitimate lead can submit successfully from a phone.
- Duplicate clicks do not create uncontrolled duplicate submissions.
- Failures are visible to the user and observable by the operator.
- No sensitive lead data is included in client logs or analytics payloads.

## 8. Phase M5 — SEO, accessibility, and production quality

- Add page metadata, canonical URLs, and social-sharing images.
- Add sitemap and robots behavior that excludes operator/private surfaces.
- Add appropriate structured data where it accurately represents the business.
- Review heading structure, landmarks, keyboard navigation, focus, contrast, and reduced motion.
- Optimize responsive images, fonts, JavaScript, and layout stability.
- Add error monitoring and privacy-conscious analytics.
- Add a cookie-consent interface only if the selected analytics or integrations require it.

### Playwright coverage

- Homepage top, middle, and footer at mobile and desktop viewports.
- Navigation open/closed states.
- Menu-example interaction.
- Contact form default, validation, submitting, success, and failure states.
- Long Turkish content and any enabled alternate language.
- Public-menu and operator-route regressions.

### Acceptance criteria

- Core pages are indexable while private/operator routes are not advertised to search engines.
- The site remains usable with keyboard input, reduced motion, and slower connections.
- Visual regression captures are stable and reviewed before deployment.

## 9. Phase M6 — launch and evidence-based iteration

- Deploy the marketing site without changing customer hostnames or restaurant URLs.
- Verify forms, notifications, analytics, metadata, and social previews in production.
- Observe which examples visitors open and where form abandonment occurs.
- Collect recurring questions from restaurant owners.
- Improve copy, section order, proof, and CTA treatment based on actual behavior.
- Avoid adding features solely to make the homepage appear more substantial.

## 10. Definition of done

- The main domain presents a coherent public brand and clear managed-service proposition.
- Visitors can inspect real examples and understand how onboarding works.
- The primary enquiry flow works reliably and safely.
- The marketing site is visually distinct from customer restaurant templates.
- Mobile, desktop, accessibility, performance, metadata, and form regression checks pass.
- Operator and customer routes continue to function without leaking draft/private information.

## 11. Explicitly deferred

- Customer self-service accounts.
- Automated subscription checkout and billing.
- A large blog or content-marketing system before there is a publishing plan.
- An oversized template marketplace before enough real templates exist.
- Search, filtering, and pagination for a catalog that does not yet contain enough published restaurants to benefit from them.
- Claims, testimonials, or performance figures that cannot be substantiated.

## 12. Relationship to the customer launch plan

The customer launch comes first. It creates the first credible public example and tests subdomain routing, public-menu quality, content management, and production operations.

The main website may reuse that proven infrastructure and approved screenshots, but it should not delay the first customer or force the customer's visual design into the platform's brand system.
