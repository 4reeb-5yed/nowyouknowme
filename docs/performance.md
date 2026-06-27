# Performance & Core Web Vitals

This document describes the performance optimizations in place targeting Core Web Vitals thresholds, and provides a checklist for auditing the production deployment with Lighthouse.

## Target Thresholds

| Metric | Target | Description |
|--------|--------|-------------|
| LCP (Largest Contentful Paint) | < 2.5s | Time until the largest visible content element renders |
| CLS (Cumulative Layout Shift) | < 0.1 | Visual stability — how much content shifts during load |
| INP (Interaction to Next Paint) | < 200ms | Responsiveness — delay between user input and visual update |

---

## Current Optimizations

### LCP (Largest Contentful Paint < 2.5s)

| Optimization | Implementation | Impact |
|--------------|----------------|--------|
| ISR/SSR pre-rendered pages | All public pages use ISR with 60s revalidation | HTML delivered fully rendered, no client-side data fetching delay |
| Font preloading with `display: swap` | `next/font/google` with `display: "swap"` and `subsets: ["latin"]` in `src/app/layout.tsx` | Fonts self-hosted by Next.js, preloaded via `<link rel="preload">`, fallback text visible immediately |
| Critical CSS inlined | Tailwind CSS purges unused styles; Next.js inlines critical CSS in `<head>` | No render-blocking external stylesheets |
| Image optimization | Next.js `<Image>` with AVIF/WebP, responsive `srcset`, `deviceSizes` configured in `next.config.ts` | Optimally-sized images served from Vercel's image CDN |
| Server Components (default) | All pages are RSC by default, only interactive parts use `"use client"` | HTML streams from the server with minimal JS needed for paint |

### CLS (Cumulative Layout Shift < 0.1)

| Optimization | Implementation | Impact |
|--------------|----------------|--------|
| Explicit image dimensions | `<Image>` with `fill` + aspect-ratio containers, or explicit `width`/`height` | Browser reserves space before images load — no layout shift |
| `font-display: swap` | Configured in `next/font/google` setup | Text renders immediately in fallback font, swap is near-invisible with matched metrics |
| No FOUT/FOIT | `next/font` self-hosts and preloads fonts, metrics matched automatically | Eliminates flash of unstyled/invisible text that causes reflow |
| Static layout shell | Navigation, footer, and page structure render server-side | No late-loading skeleton that repositions content |
| Theme injection via `<head>` | `ThemeInjector` component in `<head>` applies CSS variables before paint | No flash or reflow from theme application |

### INP (Interaction to Next Paint < 200ms)

| Optimization | Implementation | Impact |
|--------------|----------------|--------|
| Minimal client-side JS | React Server Components by default; no heavy client-side framework overhead | Less JavaScript to parse and execute on interaction |
| Small bundle size | Only interactive components marked `"use client"`; tree-shaking removes unused code | Fast hydration, quick event handler registration |
| No heavy client libraries | No client-side routing animations, no large charting/viz libraries on public pages | Event handlers respond without competing for main thread |
| `disableTransitionOnChange` | Theme provider disables CSS transitions during theme switch | Prevents jank during theme toggling |
| Efficient event handling | Form submissions use native form actions + server actions where possible | No client-side state machines blocking the main thread |

---

## Lighthouse Audit Checklist

Use this checklist when running Lighthouse on the production deployment (see task 6.14).

### Pre-Audit Setup

- [ ] Deploy to production on Vercel (not preview/dev)
- [ ] Ensure ISR has warmed up (visit each page at least once)
- [ ] Clear CDN cache if testing after a new deployment
- [ ] Use an incognito/private browser window (no extensions)
- [ ] Test on a stable network connection

### Running Lighthouse

**CLI (recommended for CI/repeatable results):**

```bash
npx lighthouse https://yoursite.com --output=html --output-path=./lighthouse-report.html --view
```

**Per-page audits:**

```bash
# Homepage
npx lighthouse https://yoursite.com --output=html --output-path=./reports/home.html

# Projects listing
npx lighthouse https://yoursite.com/projects --output=html --output-path=./reports/projects.html

# Project detail (use a real published project slug)
npx lighthouse https://yoursite.com/projects/your-project-slug --output=html --output-path=./reports/project-detail.html

# About page
npx lighthouse https://yoursite.com/about --output=html --output-path=./reports/about.html

# Contact page
npx lighthouse https://yoursite.com/contact --output=html --output-path=./reports/contact.html
```

**Chrome DevTools (for visual debugging):**

1. Open Chrome DevTools → Lighthouse tab
2. Select "Navigation" mode, "Mobile" device
3. Check all categories: Performance, Accessibility, Best Practices, SEO
4. Click "Analyze page load"

### Post-Audit Verification

- [ ] **Performance score ≥ 90**
- [ ] **LCP < 2.5s** (green in Lighthouse)
- [ ] **CLS < 0.1** (green in Lighthouse)
- [ ] **INP < 200ms** (verify via Chrome UX Report or field data)
- [ ] **Accessibility score ≥ 90**
- [ ] **Best Practices score ≥ 90**
- [ ] **SEO score ≥ 90**
- [ ] No render-blocking resources flagged
- [ ] All images have appropriate sizing and modern formats
- [ ] No unused JavaScript exceeding 20KB flagged

### Common Issues & Fixes

| Issue | Likely Cause | Fix |
|-------|-------------|-----|
| LCP > 2.5s | Large hero image not optimized | Ensure hero uses `<Image>` with `priority` prop |
| CLS > 0.1 | Dynamic content loading without reserved space | Add explicit dimensions or skeleton placeholders |
| INP > 200ms | Heavy client-side computation on interaction | Move logic to server actions or Web Workers |
| Render-blocking resources | External scripts or stylesheets | Ensure no `<link>` or `<script>` without `async`/`defer` |

---

## Expected Scores

Based on the optimizations currently in place, the following scores are expected on a production Vercel deployment:

| Category | Expected Score | Notes |
|----------|---------------|-------|
| Performance | 90–100 | SSR/ISR, optimized images, minimal JS |
| Accessibility | 95–100 | WCAG 2.1 AA compliance, semantic HTML, ARIA |
| Best Practices | 95–100 | Security headers, HTTPS, no deprecated APIs |
| SEO | 95–100 | Sitemap, robots.txt, meta tags, structured data |

---

## Field Data Monitoring

After deployment, monitor real-user CWV data via:

- **Vercel Analytics** — Built-in Web Vitals reporting (if enabled)
- **Chrome UX Report (CrUX)** — Real-world performance data from Chrome users
- **Google Search Console** — Core Web Vitals report for indexed pages
- **web-vitals library** — Client-side reporting to your own analytics

---

## Related Tasks

- **Task 6.14**: Final Lighthouse audit on production deployment (run the checklist above)
- **Task 6.1**: Image optimization configuration
- **Task 6.2**: Font preloading strategy
- **Task 6.8**: Cache-control headers for static assets
