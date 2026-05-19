# SEO checklist

Servora's SEO is split between the Next.js web app (rendering) and the CodeIgniter API (data).

## What's already wired

### Sitemap

- `/api/sitemap/urls` (CI3) returns the URL list + lastmod data — businesses, categories, cities, locality combinations.
- `/api/sitemap/xml` returns the full sitemap.xml.
- `web/src/app/sitemap.ts` (or `robots.txt` route) is expected to either proxy these or generate from the same data. Confirm per route.

### Per-page meta

- `/api/seo/meta?path=/<path>` returns `title`, `description`, `og_image`, `canonical`, structured-data JSON for a given route.
- Admin manages overrides via `/admin/seo` (table: `seo_meta`).
- `web/src/lib/seo.ts` (`SITE_NAME = "Servora"`, `SITE_DESCRIPTION`, `SITE_TAGLINE`) supplies defaults.

### Structured data

- Business detail pages should emit `LocalBusiness` JSON-LD with `name`, `address`, `aggregateRating`, `priceRange`, `image`, `telephone`, `url`, `openingHoursSpecification`.
- Listing pages should emit `BreadcrumbList`.
- Search results should emit `ItemList` of the visible businesses.

### Server rendering

- Listing and detail pages must be SSR or ISR — never client-only — so search engines index them.
- ISR with `revalidate: 3600` is the default; bumped to `revalidate: 60` for high-traffic city/category combinations.

### Breadcrumbs

- `/api/seo/breadcrumbs?path=...` returns the breadcrumb chain.

## Per-page checklist

For every public route, verify:

- [ ] `<title>` is unique and under 60 chars
- [ ] `<meta name="description">` is unique, 140-160 chars, includes the primary keyword
- [ ] Canonical link tag matches the URL the user is on (or the preferred variant)
- [ ] `<h1>` exists, contains the primary keyword, and is the only h1 on the page
- [ ] Open Graph: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`
- [ ] Twitter card: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- [ ] JSON-LD structured data (LocalBusiness / BreadcrumbList / ItemList / Service / Review as relevant)
- [ ] Internal links use server-rendered `<a>` (not client `onClick` navigation)
- [ ] Image `alt` text exists and is descriptive (not just the filename)
- [ ] Page renders without JS — view source must show the visible content

## Routes to audit (web/)

| Route                                       | Page type           | Notes                                        |
| ------------------------------------------- | ------------------- | -------------------------------------------- |
| `/`                                         | Homepage            | LocalBusiness + Organization JSON-LD         |
| `/services`                                 | Categories index    | BreadcrumbList                               |
| `/services/{category}`                      | Category landing    | ItemList of services                         |
| `/services/{category}/{city}`               | Category × city     | ItemList of vendors in that combo            |
| `/businesses/{slug}`                        | Vendor detail       | LocalBusiness + Review JSON-LD               |
| `/search?q=...`                             | Search results      | noindex (parameterised queries)              |
| `/cities/{slug}`                            | City landing        | BreadcrumbList                               |
| `/about`, `/contact`, `/privacy`, `/terms`  | Static              | Article / WebPage JSON-LD                    |
| `/vendor/register`                          | Lead-gen            | noindex (form page)                          |
| `/login`, `/admin/login`                    | Auth                | noindex                                      |

## Performance

- LCP target: < 2.5s on mobile 4G — measured via PageSpeed Insights monthly
- CLS target: < 0.1
- Total page weight: < 500KB for landing pages (excluding images)
- Use `next/image` with `priority` on the LCP image, lazy load the rest
- Tailwind purge is on by default in production builds

## Indexing

- robots.txt: allow `/`, disallow `/admin/`, `/login`, `/vendor/register`, `/api/`, `/_next/`
- Submit `sitemap.xml` URL in Google Search Console
- Verify domain ownership via DNS TXT (preferred) or HTML file
- Set up Search Console + Bing Webmaster Tools alerts for indexing errors

## Local SEO (vendor pages)

Each vendor detail page should be optimised for "{vendor name} {city}" and "{category} in {city}":

- Title: `{Vendor Name} - {Primary Category} in {City} | Servora`
- Description: lead with rating + review count, location, hours
- LocalBusiness schema with full address, phone, geo coordinates
- Embed Google Maps iframe (lazy-loaded via Intersection Observer)
- Internal links to category landing and city landing
