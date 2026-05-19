# Tier 3b verification checklist

Tier 3b bumped Servora's web stack from Next 14 + React 18 + Tailwind v3 → Next 15 + React 19 + Tailwind v4. The changes compile in theory but were not smoke-tested in the migration session (no dev server running). Walk this list before deploying.

## Before you start

```powershell
cd web
rm -rf node_modules package-lock.json    # mismatch with new majors
npm install
npm run typecheck
npm run dev
```

Open http://localhost:3000 and click through the routes below. Note any visual regressions and fix them.

## Routes to click

- [ ] `/` — homepage. LCP image, hero, category grid, featured vendors. Header + footer chrome.
- [ ] `/search?q=plumber` — search input, results list, debounce, no results state
- [ ] `/services` — categories index
- [ ] `/services/[category]` — single-category landing (e.g. `/services/plumbing`)
- [ ] `/services/[category]/[city]` — category × city listing
- [ ] `/[city]` — city landing (e.g. `/hyderabad`)
- [ ] `/[city]/[category]` — city + category combo
- [ ] `/[city]/[category]/[locality]` — full geo drill-down
- [ ] `/business/[slug]` — vendor detail page, schema markup, contact buttons
- [ ] `/login` — login form
- [ ] `/admin/login` — admin login
- [ ] `/admin` — admin dashboard (requires admin token)
- [ ] `/vendor/dashboard` — vendor dashboard
- [ ] `/vendor/register` — vendor onboarding flow
- [ ] `/contact`, `/about`, `/privacy`, `/terms` — static pages
- [ ] `/api/proxy/cities` — proxy route returns valid JSON

## Specific things to verify

### Tailwind v4 visual regressions

These are the high-risk areas where v4 defaults differ from v3:

- [ ] **Borders.** v4 default border-color is `currentColor`. The migration added a base reset `*, ::before, ::after { border-color: var(--color-surface-200) }` in `globals.css` to restore the v3 default. If you see borders inheriting text color (e.g., green borders inside primary-coloured text blocks), the reset isn't taking effect — check load order.
- [ ] **Ring width.** v4 default `ring` is 1px (v3 was 3px). Check focus rings on buttons/inputs — if they look too thin, change `ring` → `ring-3` or set `--default-ring-width` in `@theme`.
- [ ] **Shadows.** `shadow-sm` was bulk-renamed to `shadow-xs` across 33 files. If anything still looks too heavy, the rename swept too aggressively somewhere.
- [ ] **Container utility.** v4's `.container` has no max-width by default. If `container mx-auto` pages look full-bleed, you may need to add `--container-...` tokens in `@theme` or switch to `max-w-7xl mx-auto`.
- [ ] **Gradient direction syntax.** v4 changed the way `bg-gradient-to-r` interprets via colors. Spot-check any gradient-heavy components.
- [ ] **Font loading.** `--font-inter` and `--font-poppins` CSS variables come from `next/font` in `layout.tsx`. The `@theme` block references them. Verify headings render in Poppins, body in Inter.

### Next 15 behaviour changes

- [ ] **Caching defaults flipped.** v15 no longer caches `fetch()` by default and no longer caches GET route handlers. SSR pages that relied on implicit caching may now re-fetch on every request — measure and explicitly opt in via `{ next: { revalidate: 60 } }` or `export const revalidate = 60` where needed.
- [ ] **Async `params` / `searchParams`.** Already migrated in commit `c7e65d2`. Verify no page throws "TypeError: params.X is undefined" — that means somewhere is still treating them as sync.
- [ ] **`use client` boundaries.** Check that `providers.tsx` (TanStack Query QueryClientProvider) wraps any client-only hooks correctly.
- [ ] **`Link` behaviour.** v15 changed `prefetch` defaults slightly; usually invisible.

### React 19 compatibility

- [ ] **Ref as prop.** v19 deprecated `React.forwardRef` for new components but still supports it. Existing forwardRef usage (in `ui/button.tsx`, `ui/input.tsx`, `ui/card.tsx`) works fine.
- [ ] **Third-party libs.** Watch the install log for React 19 peer-dep warnings. Common offenders: react-helmet, headlessui v1, older Radix versions.
- [ ] **useFormStatus / Server Actions** — not in use here, so no migration.

## If a page breaks

1. Open the browser devtools, copy the error.
2. If it's a Tailwind class: probably renamed in v4. Check the migration guide.
3. If it's a Next 15 async-params error: the page was missed in the commit-A migration — `await params` and `await searchParams`.
4. If it's a React 19 peer-dep warning during install: usually safe to ignore for production deps that haven't shipped R19 support; CI builds will still pass.

## If the rollback is needed

```powershell
git revert <commit-B-sha>            # un-bump deps
rm -rf web/node_modules
cd web && npm install
```

The Tier 3a additive layer (TanStack Query providers, shadcn primitives) survives a revert of B because it's compatible with both Next 14/Tailwind v3 and Next 15/Tailwind v4.
