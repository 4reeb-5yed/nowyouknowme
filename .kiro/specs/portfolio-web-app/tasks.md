# Implementation Plan: Portfolio Web App

## Overview

This implementation plan covers the full-stack portfolio web application with a public-facing site and CMS dashboard. The app uses Next.js 14 (App Router), Tailwind CSS with shadcn/ui, tRPC for the API layer, Drizzle ORM with PostgreSQL, NextAuth.js for authentication, and Cloudflare R2 for file storage. Tasks are organized into phases progressing from scaffolding through feature implementation, polish, and deployment.

## Tasks

### Phase 1: Scaffold, DB Schema, Auth, Empty CMS Shell

- [x] 1.1 Initialize Next.js 14 project with App Router, TypeScript strict mode, Tailwind CSS, and ESLint configuration
- [x] 1.2 Install and configure core dependencies: tRPC v11, Drizzle ORM, NextAuth.js v5, Zod, next-themes, shadcn/ui
- [x] 1.3 Set up directory structure following the design document (app/, components/, server/, lib/, types/, styles/, config/)
- [x] 1.4 Configure Tailwind CSS with design tokens (CSS custom properties for theme colors, spacing, typography)
- [x] 1.5 Create Drizzle ORM configuration and database connection module (src/server/db/index.ts)
- [x] 1.6 Define all database schemas: User, Project, Section, Social_Link, Resume, Site_Config (src/server/db/schema/)
- [x] 1.7 Define Experience and Certification database schemas (src/server/db/schema/experience.ts, src/server/db/schema/certification.ts)
  - Experience schema: id, company_name, role_title, start_date, end_date (nullable), description, tech_stack (JSON), display_order, is_visible, created_at, updated_at
  - Certification schema: id, certification_name, issuing_organization, issue_date, expiry_date (nullable), credential_id, credential_url, display_order, is_visible, created_at, updated_at
  - _Requirements: 15.8, 15.9, 18.1, 19.1_
- [x] 1.8 Define future stub schemas: Post, Subscriber, Testimonial (src/server/db/schema/)
- [x] 1.9 Generate and run initial database migration to create all tables with constraints and enums
- [x] 1.10 Configure NextAuth.js v5 with Credentials provider, JWT session strategy, and single-user model (src/lib/auth.ts)
- [x] 1.11 Create auth middleware to protect all /admin/* routes (src/middleware.ts)
- [x] 1.12 Create the NextAuth route handler (src/app/api/auth/[...nextauth]/route.ts)
- [x] 1.13 Create login page with email/password form, client-side validation, and generic error messaging (src/app/admin/login/page.tsx)
- [x] 1.14 Create seed script to insert the Owner account with hashed password (scripts/seed.ts)
- [x] 1.15 Set up tRPC initialization with auth context, create root router, and HTTP handler route (src/server/api/)
- [x] 1.16 Create the CMS Dashboard layout shell with sidebar navigation, auth check, and placeholder pages (src/app/admin/)
- [x] 1.17 Create root layout with theme provider (next-themes), font preloading, and analytics component slot (src/app/layout.tsx)
- [x] 1.18 Configure environment variables schema with Zod validation (src/config/env.ts)
- [x] 1.19 Configure security headers in next.config.js (CSP, HSTS, X-Frame-Options, etc.)
- [x] 1.20 Create shared utility functions: cn(), slugify(), formatDate() (src/lib/utils.ts)
- [x] 1.21 Set up CSS theme tokens for light/dark mode and accent color custom properties (src/styles/globals.css, src/styles/themes.css)

### Phase 2: Projects CRUD in CMS + Public Projects Page + Detail Page

- [x] 2.1 Create Zod validation schemas for Project create/update operations (src/lib/validators/project.ts)
- [x] 2.2 Create project service layer with CRUD operations, slug generation, and reorder logic (src/server/services/project.service.ts)
- [x] 2.3 Create tRPC projects router with all procedures: list, getBySlug, listAll, create, update, delete, reorder (src/server/api/routers/projects.ts)
- [x] 2.4 Create Project form component with all fields, client-side validation, and slug auto-generation (src/components/admin/project-form.tsx)
- [x] 2.5 Create Projects table component with columns for title, category, status, display_order, and action buttons (src/components/admin/project-table.tsx)
- [x] 2.6 Implement drag-and-drop reordering for projects using @dnd-kit (src/components/admin/sortable-list.tsx)
- [x] 2.7 Create CMS Projects page integrating table, form modal, reorder, and publish/draft toggle (src/app/admin/projects/page.tsx)
- [x] 2.8 Create public ProjectCard component with thumbnail, title, category badge, description, and featured indicator (src/components/public/project-card.tsx)
- [x] 2.9 Create public ProjectGrid component with category filter tabs (src/components/public/project-grid.tsx)
- [x] 2.10 Create public Projects listing page with ISR, category filtering, and grid layout (src/app/(public)/projects/page.tsx)
- [x] 2.11 Create public Project detail page with full content, tech stack tags, links, and ISR (src/app/(public)/projects/[slug]/page.tsx)
- [x] 2.12 Add dynamic metadata generation for project listing and detail pages (title, description, OG tags)
- [x] 2.13 Handle 404 for non-existent or draft project slugs with notFound() (src/app/(public)/projects/[slug]/page.tsx)

### Phase 3: About, Hero, Social Links, Resume, Experience, Certifications — CMS Editors + Public Rendering

- [x] 3.1 Create Zod validation schemas for Section content updates and Social Link operations (src/lib/validators/)
- [x] 3.2 Create Zod validation schemas for Experience entries (src/lib/validators/experience.ts)
  - Validate company_name, role_title, start_date, end_date, description, tech_stack, is_visible
  - Enforce start_date must be before end_date when end_date is provided
  - _Requirements: 18.8, 18.9_
- [x] 3.3 Create Zod validation schemas for Certification entries (src/lib/validators/certification.ts)
  - Validate certification_name, issuing_organization, issue_date, expiry_date, credential_id, credential_url, is_visible
  - Enforce expiry_date must be after issue_date when expiry_date is provided
  - Validate credential_url as a valid URL format when provided
  - _Requirements: 19.8, 19.9_
- [x] 3.4 Create content service layer for Section CRUD with sanitization (src/server/services/content.service.ts)
- [x] 3.5 Create social link service layer with CRUD and reorder (src/server/services/social-link.service.ts)
- [x] 3.6 Create resume service layer with upload, activation, and deactivation logic (src/server/services/resume.service.ts)
- [x] 3.7 Create experience service layer with CRUD and reorder (src/server/services/experience.service.ts)
  - Implement listVisible (ordered most recent first), listAll, create, update, delete, reorder
  - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_
- [x] 3.8 Create certification service layer with CRUD and reorder (src/server/services/certification.service.ts)
  - Implement listVisible (ordered by display_order), listAll, create, update, delete, reorder
  - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5_
- [x] 3.9 Create tRPC content router: getSection, updateSection (src/server/api/routers/content.ts)
- [x] 3.10 Create tRPC social links router: listVisible, listAll, create, update, delete, reorder (src/server/api/routers/social-links.ts)
- [x] 3.11 Create tRPC resume router: getActive, listAll, setActive (src/server/api/routers/resume.ts)
- [x] 3.12 Create tRPC experience router: listVisible, listAll, create, update, delete, reorder (src/server/api/routers/experience.ts)
  - Public procedure: listVisible returns visible entries sorted most recent first
  - Protected procedures: listAll, create, update, delete, reorder require auth
  - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6_
- [x] 3.13 Create tRPC certifications router: listVisible, listAll, create, update, delete, reorder (src/server/api/routers/certifications.ts)
  - Public procedure: listVisible returns visible entries in display_order
  - Protected procedures: listAll, create, update, delete, reorder require auth
  - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6_
- [x] 3.14 Create CMS content editor page for About section and Hero tagline with rich text support (src/app/admin/content/page.tsx)
- [x] 3.15 Create CMS social links manager with add/remove/reorder/toggle visibility (src/app/admin/social-links/page.tsx)
- [x] 3.16 Create CMS resume manager with upload, current file display, and replace functionality (src/app/admin/resume/page.tsx)
- [x] 3.17 Create CMS experience manager page with table, form, reorder, and visibility toggle (src/app/admin/experience/page.tsx)
  - Table columns: company_name, role_title, date range, visibility status, action buttons
  - Form with all fields, client-side Zod validation, drag-and-drop reorder
  - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.10_
- [x] 3.18 Create CMS certifications manager page with table, form, reorder, and visibility toggle (src/app/admin/certifications/page.tsx)
  - Table columns: certification_name, issuing_organization, issue_date, expiry status, visibility status, action buttons
  - Form with all fields, client-side Zod validation, drag-and-drop reorder
  - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.10_
- [x] 3.19 Create upload service for file validation and R2 storage (src/server/services/upload.service.ts)
- [x] 3.20 Create file upload API route with MIME type validation and size limits (src/app/api/upload/route.ts)
- [x] 3.21 Create Zod validation schema for resume uploads (src/lib/validators/resume.ts)
- [x] 3.22 Create public Hero component rendering the hero tagline from Site_Config (src/components/public/hero.tsx)
- [x] 3.23 Create public About page rendering the About section content with ISR (src/app/(public)/about/page.tsx)
- [x] 3.24 Create public SocialLinks component rendering visible links in order (src/components/public/social-links.tsx)
- [x] 3.25 Create public ResumeButton component with conditional rendering based on active resume (src/components/public/resume-button.tsx)
- [x] 3.26 Create public experience timeline component (src/components/public/experience-timeline.tsx)
  - Display entries chronologically with most recent first
  - Show "Present" for entries with null end_date
  - Show tech_stack tags and description for each entry
  - _Requirements: 18.6, 18.7_
- [x] 3.27 Create public certification card component (src/components/public/certification-card.tsx)
  - Display certification_name, issuing_organization, issue_date, expiry info
  - Render credential_url as verifiable link opening in new tab when available
  - _Requirements: 19.6, 19.7_
- [x] 3.28 Create public Experience page with timeline layout and ISR (src/app/(public)/experience/page.tsx)
  - Fetch visible experiences via tRPC, render using experience-timeline component
  - Include dynamic metadata generation
  - _Requirements: 18.6, 18.7_
- [x] 3.29 Create public Certifications page with card layout and ISR (src/app/(public)/certifications/page.tsx)
  - Fetch visible certifications via tRPC, render using certification-card component
  - Include dynamic metadata generation
  - _Requirements: 19.6, 19.7_
- [x] 3.30 Create public Homepage composing Hero, About preview, and Featured projects (src/app/(public)/page.tsx)
- [x] 3.31 Add input sanitization for rich text content to prevent stored XSS (src/lib/sanitize.ts)

### Phase 4: Contact Form, Skills Section, SEO Metadata, Sitemap

- [x] 4.1 Create Zod validation schema for contact form submissions (src/lib/validators/contact.ts)
- [x] 4.2 Create email service using Resend for contact form delivery (src/server/services/email.service.ts)
- [x] 4.3 Create contact form API route with server validation and rate limiting (src/app/api/contact/route.ts)
- [x] 4.4 Create public ContactForm component with client-side validation, error display, and success state (src/components/public/contact-form.tsx)
- [x] 4.5 Create public Contact page with form and social links (src/app/(public)/contact/page.tsx)
- [x] 4.6 Create public SkillsDisplay component with domain grouping and filter functionality (src/components/public/skills-display.tsx)
- [x] 4.7 Add Skills section to CMS content editor for managing skills by domain (src/app/admin/content/page.tsx)
- [x] 4.8 Create dynamic sitemap.ts generating URLs for all published projects and static pages (src/app/sitemap.ts)
- [x] 4.9 Create robots.ts allowing public pages and disallowing /admin/* routes (src/app/robots.ts)
- [x] 4.10 Create site-config service layer for reading and updating Site_Config (src/server/services/site-config.service.ts)
- [x] 4.11 Create tRPC site-config router: get, update (src/server/api/routers/site-config.ts)
- [x] 4.12 Implement dynamic metadata generation for all public pages using Site_Config values (generateMetadata in each page)
- [x] 4.13 Add OpenGraph and Twitter Card meta tags to all public pages
- [x] 4.14 Add JSON-LD structured data to homepage and project detail pages
- [x] 4.15 Implement rate limiting utility for API routes (src/lib/rate-limit.ts)

### Phase 5: Theme Configurator, Layout Variants, Design Polish

- [x] 5.1 Create CMS Site Config page with theme settings, accent color picker, SEO metadata fields, and OG image (src/app/admin/site-config/page.tsx)
- [x] 5.2 Create Zod validation schema for site-config updates (src/lib/validators/site-config.ts)
- [x] 5.3 Implement live accent color preview in the theme configurator before save
- [x] 5.4 Create theme-toggle component for public site (light/dark/system) with localStorage persistence (src/components/public/theme-toggle.tsx)
- [x] 5.5 Implement CSS custom property injection from Site_Config at the root layout level for runtime theming
- [x] 5.6 Ensure accent color contrast checking — validate minimum 4.5:1 ratio against background in configurator
- [x] 5.7 Apply prefers-reduced-motion media query to disable all non-essential animations
- [x] 5.8 Polish all public page layouts: consistent spacing, typography scale, responsive breakpoints
- [x] 5.9 Polish CMS Dashboard layout: consistent form styling, loading states, toast notifications
- [x] 5.10 Add transition animations for page navigations and component state changes (motion-safe only)
- [x] 5.11 Implement error boundaries and fallback UI for all major page sections
- [x] 5.12 Create CMS Dashboard home page with quick stats (project count, last update, etc.) (src/app/admin/dashboard/page.tsx)

### Phase 6: Performance Audit, A11y Audit, Lighthouse Pass, Production Deployment

- [x] 6.1 Configure Next.js Image component for all images with proper sizing, lazy loading, and responsive srcset
- [x] 6.2 Implement font preloading strategy with font-display swap to prevent FOUT/FOIT
- [x] 6.3 Audit and fix all images for missing or inadequate alt text
- [x] 6.4 Audit and fix heading hierarchy (h1-h6) on all pages for logical document structure
- [x] 6.5 Audit and fix all interactive elements for keyboard accessibility (tab order, focus indicators, enter/space activation)
- [x] 6.6 Verify WCAG 2.1 AA color contrast compliance across all theme variants and accent colors
- [x] 6.7 Test and verify Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms using Lighthouse
- [x] 6.8 Add cache-control headers for static assets and uploaded files
- [x] 6.9 Configure Cloudflare R2 bucket with appropriate CORS and caching policies
- [x] 6.10 Create production environment variable documentation and .env.example file
- [x] 6.11 Configure Vercel deployment with environment variables, build settings, and custom domain
- [x] 6.12 Set up on-demand ISR revalidation triggered after CMS mutations for instant content updates
- [x] 6.13 Write comprehensive README with setup instructions, architecture overview, environment variables, and deployment guide
- [x] 6.14 Run final Lighthouse audit targeting 90+ scores across Performance, Accessibility, Best Practices, and SEO

### Phase 7: Future Stubs — RAG Chatbot, Analytics, Blog/Writing Section

- [x] 7.1 Create RAG chatbot API stub route returning 501 Not Implemented (src/app/api/chat/route.ts)
- [x] 7.2 Create newsletter subscribe API stub route returning 501 Not Implemented (src/app/api/subscribe/route.ts)
- [x] 7.3 Create analytics component slot in root layout with placeholder (src/components/analytics.tsx)
- [x] 7.4 Create blog/writing section stub with placeholder page and navigation link (disabled) (src/app/(public)/writing/page.tsx)
- [x] 7.5 Document future integration points in README: vector DB setup for RAG, analytics provider integration, blog CMS extension

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation between phases
- The design uses TypeScript throughout — all implementation tasks use TypeScript
- Experience and Certifications follow the same CRUD + reorder + visibility pattern as Social Links and Projects
- ISR (Incremental Static Regeneration) with 60-second revalidation is used for all public content pages
- On-demand revalidation is triggered after CMS mutations for near-instant content updates
- Authentication is single-user (Owner only) with no public registration

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["1.4", "1.5", "1.17", "1.18", "1.19", "1.20", "1.21"] },
    { "id": 3, "tasks": ["1.6", "1.7", "1.8", "1.9", "1.10"] },
    { "id": 4, "tasks": ["1.11", "1.12", "1.13", "1.14", "1.15"] },
    { "id": 5, "tasks": ["1.16"] },
    { "id": 6, "tasks": ["2.1", "2.2", "3.1", "3.2", "3.3"] },
    { "id": 7, "tasks": ["2.3", "2.4", "2.5", "2.6", "3.4", "3.5", "3.6", "3.7", "3.8"] },
    { "id": 8, "tasks": ["2.7", "2.8", "2.9", "3.9", "3.10", "3.11", "3.12", "3.13"] },
    { "id": 9, "tasks": ["2.10", "2.11", "2.12", "2.13", "3.14", "3.15", "3.16", "3.17", "3.18"] },
    { "id": 10, "tasks": ["3.19", "3.20", "3.21", "3.22", "3.24", "3.26", "3.27"] },
    { "id": 11, "tasks": ["3.23", "3.25", "3.28", "3.29", "3.30", "3.31"] },
    { "id": 12, "tasks": ["4.1", "4.2", "4.10", "4.15"] },
    { "id": 13, "tasks": ["4.3", "4.4", "4.5", "4.6", "4.7", "4.11"] },
    { "id": 14, "tasks": ["4.8", "4.9", "4.12", "4.13", "4.14"] },
    { "id": 15, "tasks": ["5.1", "5.2", "5.3", "5.4", "5.5"] },
    { "id": 16, "tasks": ["5.6", "5.7", "5.8", "5.9", "5.10", "5.11", "5.12"] },
    { "id": 17, "tasks": ["6.1", "6.2", "6.3", "6.4", "6.5", "6.6"] },
    { "id": 18, "tasks": ["6.7", "6.8", "6.9", "6.10", "6.11", "6.12"] },
    { "id": 19, "tasks": ["6.13", "6.14"] },
    { "id": 20, "tasks": ["7.1", "7.2", "7.3", "7.4", "7.5"] }
  ]
}
```
