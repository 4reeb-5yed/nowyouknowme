# NowYouKnowMe — Portfolio Web App

A full-stack portfolio web application with a built-in CMS dashboard. Manage projects, experience, certifications, social links, resume, and site configuration — all from a single admin interface. The public site renders content with ISR for fast, SEO-friendly pages.

## Table of Contents

- [Features](#features)
  - [Public Site](#public-site)
  - [CMS Dashboard](#cms-dashboard)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Management](#database-management)
- [Scripts](#scripts)
- [Project Structure](#project-structure)
  - [App Routes](#app-routes)
  - [Components](#components)
  - [Server Layer](#server-layer)
  - [Lib & Utils](#lib--utils)
- [API Reference](#api-reference)
  - [Public Routers](#public-routers)
  - [Protected Routers](#protected-routers)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Deployment](#deployment)
- [Additional Documentation](#additional-documentation)
- [Future Features](#future-features)

---

## Features

### Public Site

The public-facing portfolio with multi-page navigation:

| Page | Route | Features |
|------|-------|----------|
| Home | `/` | Hero section, featured projects preview, experience, skills, about, contact |
| Projects | `/projects` | Filterable project grid by category (Cybersecurity, Cloud, Web, Other) |
| Project Detail | `/projects/[slug]` | Full project info, tech stack, links, JSON-LD SEO |
| Experience | `/experience` | Timeline view of professional experience |
| Certifications | `/certifications` | Credential cards with verification links |
| About | `/about` | CMS-driven about content |
| Contact | `/contact` | Contact form + social links |
| Writing | `/writing` | Coming soon (blog placeholder) |

**Key Features:**
- **Theme Configurator** — Runtime accent color, light/dark mode, WCAG contrast checking
- **SEO Optimized** — Dynamic metadata, Open Graph, JSON-LD structured data, sitemap, robots.txt
- **ISR + On-Demand Revalidation** — Near-instant content updates after CMS edits
- **Responsive Design** — Mobile-first with premium animations and transitions

### CMS Dashboard

Admin-only interface at `/admin/login` with full content management:

| Section | Route | Features |
|---------|-------|----------|
| Dashboard | `/admin/dashboard` | Stats overview, recent activity, quick actions |
| Projects | `/admin/projects` | CRUD, drag-and-drop reordering, featured toggle, category management |
| Experience | `/admin/experience` | Timeline CRUD with tech stack tags |
| Certifications | `/admin/certifications` | Credential management with verification links |
| Pages | `/admin/pages` | Section content editor (About, Skills, Hero tagline) |
| Social Links | `/admin/social-links` | Social platform link management |
| Resume | `/admin/resume` | PDF upload via R2, activate/deactivate |
| Media | `/admin/media` | File management (images, documents) |
| Site Config | `/admin/site-config` | Theme colors, SEO metadata, site branding |
| Revisions | `/admin/revisions` | Version history with restore capability |

**Admin Features:**
- **Command Palette** — Quick navigation with `Cmd/Ctrl+K`
- **Global Search** — Search across all content types
- **Activity Log** — Track all content changes with timestamps
- **Revision History** — Full version control with restore
- **Live Preview** — Real-time preview in multiple device sizes
- **Keyboard Shortcuts** — `Cmd+S` to save, `Cmd+/` for help

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict mode) |
| API | tRPC v11 |
| ORM | Drizzle ORM |
| Database | PostgreSQL (Neon recommended) |
| Auth | NextAuth.js v5 (Credentials + JWT) |
| Styling | Tailwind CSS + shadcn/ui |
| File Storage | Cloudflare R2 (S3-compatible) |
| Email | Resend |
| Deployment | Vercel |

---

## Architecture

The application follows a layered architecture with strict separation of concerns:

```
┌─────────────────────────────────────────────┐
│  UI Layer                                   │
│  (React Server Components + Client Components)│
├─────────────────────────────────────────────┤
│  API Layer (tRPC)                           │
│  - Public Procedures (SSR)                  │
│  - Protected Procedures (Auth Required)      │
├─────────────────────────────────────────────┤
│  Service Layer                              │
│  (Business Logic)                            │
├─────────────────────────────────────────────┤
│  Data Access Layer (Drizzle ORM)            │
├─────────────────────────────────────────────┤
│  External Services                          │
│  (PostgreSQL, R2, Resend)                  │
└─────────────────────────────────────────────┘
```

**Data Flow:**
- Public pages → Server Components → `createServerClient()` → tRPC → Services → Drizzle → PostgreSQL
- Admin pages → Client Components → `trpc.useQuery()` / `trpc.useMutation()` → Protected Procedures
- Auth → NextAuth middleware → `/admin/*` routes protected

---

## Getting Started

### Prerequisites

- **Node.js** 20+ (LTS recommended)
- **PostgreSQL** (local or hosted — [Neon](https://neon.tech) recommended)
- **pnpm** or **npm** (package manager)
- **Cloudflare R2** bucket (for file uploads)
- **Resend** account (for contact form emails)

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd nowyouknowme

# 2. Install dependencies
pnpm install  # or npm install

# 3. Create .env file with required variables (see Environment Variables below)

# 4. Generate and run database migrations
pnpm run db:generate
pnpm run db:migrate

# 5. Seed the owner account
pnpm run db:seed

# 6. Start the development server
pnpm run dev
```

**Access URLs:**
- Public Site: [http://localhost:3000](http://localhost:3000)
- CMS Dashboard: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

**Default Seed Credentials (change immediately after first login):**
- Email: `admin@example.com`
- Password: `changeme123`

---

## Environment Variables

Create a `.env` file in the project root:

### Required Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (e.g., `postgresql://user:pass@host/db?sslmode=require`) |
| `NEXTAUTH_SECRET` | JWT signing secret. Generate with: `openssl rand -base64 32` |
| `RESEND_API_KEY` | Resend API key (starts with `re_`) |
| `CONTACT_EMAIL` | Email address to receive contact form submissions |
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 API token access key |
| `R2_SECRET_ACCESS_KEY` | R2 API token secret key |
| `R2_BUCKET_NAME` | Name of your R2 bucket |
| `R2_PUBLIC_URL` | Public URL for the R2 bucket (e.g., `https://cdn.yourdomain.com`) |

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXTAUTH_URL` | `http://localhost:3000` | Canonical app URL (required in production) |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Public-facing app URL |
| `NODE_ENV` | `development` | Environment (development/production/test) |
| `OWNER_EMAIL` | `admin@example.com` | Initial admin email |
| `OWNER_PASSWORD` | `changeme123` | Initial admin password |

---

## Database Management

```bash
# Generate migration files from schema changes
pnpm run db:generate

# Apply migrations to database
pnpm run db:migrate

# Push schema directly (development only)
pnpm run db:push

# Open Drizzle Studio (visual DB browser)
pnpm run db:studio

# Seed owner account
pnpm run db:seed
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Auto-fix lint issues |
| `pnpm lighthouse` | Run Lighthouse audit |

---

## Project Structure

```
nowyouknowme/
├── docs/                          # Documentation
│   ├── deployment.md              # Vercel deployment guide
│   ├── future-integrations.md     # Future features guide
│   ├── lighthouse-audit.md        # Performance audit results
│   ├── performance.md             # Performance optimization notes
│   ├── r2-configuration.md       # Cloudflare R2 setup
│   └── r2-cors.json               # R2 CORS policy config
├── scripts/
│   └── seed.ts                    # Database seed script
├── public/                        # Static assets
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (public)/              # Public site routes
│   │   ├── admin/                 # CMS dashboard routes
│   │   └── api/                   # API routes
│   ├── components/                # React components
│   ├── server/                    # Server-side code
│   ├── lib/                       # Client-side utilities
│   ├── types/                     # TypeScript types
│   ├── styles/                    # Global styles
│   └── config/                    # Environment config
├── drizzle.config.ts              # Drizzle ORM config
├── next.config.ts                 # Next.js config
├── tsconfig.json                  # TypeScript config
└── package.json                   # Dependencies
```

### App Routes

```
src/app/
├── (public)/                      # Public site (ISR, SSG)
│   ├── page.tsx                   # Homepage
│   ├── projects/
│   │   ├── page.tsx               # Projects listing
│   │   └── [slug]/page.tsx        # Project detail
│   ├── experience/page.tsx        # Experience timeline
│   ├── certifications/page.tsx     # Certifications
│   ├── about/page.tsx             # About page
│   ├── contact/page.tsx           # Contact form
│   ├── writing/page.tsx           # Blog (future)
│   └── layout.tsx                 # Public layout with TRPCProvider
│
├── admin/                         # CMS Dashboard (auth-protected)
│   ├── login/page.tsx             # Login page
│   ├── dashboard/page.tsx         # Dashboard home
│   ├── projects/page.tsx          # Projects CRUD
│   ├── experience/page.tsx        # Experience CRUD
│   ├── certifications/page.tsx    # Certifications CRUD
│   ├── pages/page.tsx             # Section content editor
│   ├── social-links/page.tsx      # Social links manager
│   ├── resume/page.tsx            # Resume manager
│   ├── media/page.tsx             # Media library
│   ├── site-config/page.tsx       # Theme & SEO config
│   ├── revisions/page.tsx        # Version history
│   └── layout.tsx                 # Admin layout
│
└── api/                           # API Routes
    ├── trpc/[trpc]/route.ts       # tRPC HTTP handler
    ├── auth/[...nextauth]/route.ts # NextAuth handlers
    ├── contact/route.ts           # Contact form submission
    ├── subscribe/route.ts         # Newsletter (stub)
    ├── chat/route.ts              # RAG chatbot (stub)
    └── upload/route.ts            # File upload endpoint
```

### Components

```
src/components/
├── ui/                            # shadcn/ui primitives
│   ├── button.tsx
│   ├── input.tsx
│   ├── textarea.tsx
│   ├── label.tsx
│   ├── badge.tsx
│   └── sonner.tsx (toast notifications)
│
├── public/                        # Public site components
│   ├── hero-v3.tsx               # Hero section
│   ├── featured-projects.tsx     # Featured projects preview
│   ├── project-grid.tsx           # Filterable project grid
│   ├── project-card.tsx           # Individual project card
│   ├── experience-section.tsx     # Experience preview
│   ├── experience-timeline.tsx    # Timeline component
│   ├── skills-section.tsx         # Skills preview
│   ├── about-section.tsx          # About preview
│   ├── contact-section.tsx        # Contact form
│   ├── contact-form.tsx           # Form component
│   ├── social-links.tsx           # Social links display
│   ├── site-header-v3.tsx         # Navigation header
│   ├── site-footer-v3.tsx         # Footer
│   ├── scroll-progress.tsx        # Reading progress bar
│   ├── grain-overlay.tsx          # Visual effect
│   └── theme-toggle.tsx           # Light/dark mode toggle
│
├── admin/                         # CMS components
│   ├── project-form.tsx           # Project CRUD form
│   ├── project-table.tsx          # Project list table
│   ├── experience-form.tsx       # Experience CRUD form
│   ├── experience-table.tsx       # Experience list table
│   ├── certification-form.tsx      # Certification CRUD form
│   ├── certification-table.tsx    # Certification list table
│   ├── social-link-list.tsx       # Social links editor
│   ├── theme-configurator.tsx     # Theme settings
│   ├── accent-color-preview.tsx   # Color picker
│   ├── command-palette.tsx        # Cmd+K search
│   ├── keyboard-shortcuts-help.tsx # Shortcut reference
│   ├── live-preview.tsx           # Device preview
│   ├── media-library.tsx          # File manager
│   ├── section-reorder.tsx        # Drag-drop reordering
│   ├── revision-history.tsx      # Version history
│   ├── sortable-list.tsx          # Reorderable list
│   └── use-keyboard-save.ts       # Cmd+S hook
│
├── editor/                        # Rich text editor
│   ├── rich-text-editor.tsx
│   ├── toolbar.tsx
│   └── extensions.ts
│
├── theme-provider.tsx            # Theme context provider
├── theme-injector.tsx             # CSS variable injection
└── page-transition.tsx           # Page transition wrapper
```

### Server Layer

```
src/server/
├── api/
│   ├── routers/                   # tRPC routers
│   │   ├── projects.ts            # Projects CRUD + queries
│   │   ├── experience.ts          # Experience CRUD + queries
│   │   ├── certifications.ts      # Certifications CRUD + queries
│   │   ├── pages.ts               # Section content (About, Skills)
│   │   ├── social-links.ts        # Social links CRUD
│   │   ├── resume.ts              # Resume management
│   │   ├── site-config.ts         # Site settings
│   │   ├── search.ts              # Global search
│   │   ├── activity-log.ts        # Change tracking
│   │   ├── revisions.ts           # Version history
│   │   └── index.ts               # Router exports
│   ├── trpc.ts                    # tRPC configuration
│   └── root.ts                    # Root router
│
├── services/                     # Business logic
│   ├── project.service.ts
│   ├── experience.service.ts
│   ├── certification.service.ts
│   ├── content.service.ts         # Pages/sections
│   ├── social-link.service.ts
│   ├── resume.service.ts
│   ├── site-config.service.ts
│   ├── activity-log.service.ts
│   ├── revision.service.ts
│   ├── upload.service.ts
│   ├── email.service.ts
│   └── index.ts
│
└── db/
    ├── schema/                   # Drizzle schema definitions
    │   ├── user.ts               # Admin user
    │   ├── project.ts            # Projects table
    │   ├── experience.ts          # Experience table
    │   ├── certification.ts       # Certifications table
    │   ├── section.ts             # Content sections
    │   ├── social-link.ts         # Social links table
    │   ├── resume.ts              # Resume files table
    │   ├── site-config.ts         # Site settings
    │   ├── activity-log.ts        # Change log
    │   ├── revision.ts            # Version history
    │   ├── post.ts                # Blog posts (future)
    │   ├── subscriber.ts          # Newsletter subscribers
    │   ├── testimonial.ts         # Testimonials (future)
    │   └── index.ts               # Schema exports
    └── index.ts                   # DB client
```

### Lib & Utils

```
src/lib/
├── trpc/
│   ├── client.ts                 # Client-side tRPC
│   ├── server.ts                 # Server-side tRPC
│   └── provider.tsx              # React provider
│
├── validators/                   # Zod validation schemas
│   ├── project.ts
│   ├── experience.ts
│   ├── certification.ts
│   ├── section.ts
│   ├── social-link.ts
│   ├── resume.ts
│   ├── site-config.ts
│   └── contact.ts
│
├── auth.ts                       # NextAuth configuration
├── rate-limit.ts                 # Rate limiting middleware
├── sanitize.ts                   # HTML sanitization
├── theme.ts                      # Theme utilities
├── utils.ts                      # General utilities
└── index.ts                      # Re-exports
```

---

## API Reference

### Public Routers

Available without authentication (used by public pages):

| Router | Procedures | Description |
|--------|------------|-------------|
| `projects` | `list`, `getBySlug`, `getFeatured` | Fetch published projects |
| `experience` | `listVisible` | Fetch visible experience entries |
| `certifications` | `listVisible` | Fetch visible certifications |
| `pages` | `getSection` | Fetch page content (About, Skills) |
| `socialLinks` | `listVisible` | Fetch visible social links |
| `siteConfig` | `get` | Fetch site configuration |

### Protected Routers

Require authentication (used by CMS dashboard):

| Router | Procedures | Description |
|--------|------------|-------------|
| `projects` | `create`, `update`, `delete`, `reorder`, `getAll`, `getById` | Full CRUD |
| `experience` | `create`, `update`, `delete`, `reorder`, `getAll`, `getById` | Full CRUD |
| `certifications` | `create`, `update`, `delete`, `getAll`, `getById` | Full CRUD |
| `pages` | `upsert` | Create/update page content |
| `socialLinks` | `create`, `update`, `delete`, `getAll`, `getById`, `toggleVisibility` | Full CRUD |
| `resume` | `upload`, `getAll`, `getActive`, `setActive`, `delete` | Resume management |
| `siteConfig` | `update` | Update site settings |
| `search` | `search` | Global search across content |
| `activityLog` | `getRecent`, `create` | Activity tracking |
| `revisions` | `getByEntity`, `restore` | Version history |

---

## Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| `users` | Admin user accounts |
| `projects` | Portfolio projects (title, slug, description, techStack, etc.) |
| `experiences` | Work experience (companyName, roleTitle, dates, description) |
| `certifications` | Credentials (name, issuer, issueDate, verificationUrl) |
| `sections` | CMS content sections (key, title, content) |
| `socialLinks` | Social media links (platform, url, displayOrder, isVisible) |
| `resumes` | Resume files (title, fileUrl, isActive) |
| `siteConfig` | Single-row site settings (metaDescription, accentColor, etc.) |

### Audit Tables

| Table | Description |
|-------|-------------|
| `activityLog` | Tracks all content changes |
| `revisions` | Stores previous versions for restore |

---

## Authentication

The application uses NextAuth.js v5 with credentials provider:

- **Single-user mode** — Only the owner can log in
- **JWT sessions** — Stateless authentication with secure cookies
- **Middleware protection** — All `/admin/*` routes require authentication
- **Protected tRPC procedures** — Use `protectedProcedure` for admin-only operations

**Login Flow:**
1. User visits `/admin/login`
2. Enters credentials (email/password)
3. NextAuth validates against stored password hash (bcrypt)
4. JWT token issued with session
5. Protected routes accessible for 30 days

---

## Deployment

See [docs/deployment.md](docs/deployment.md) for detailed deployment instructions.

### Quick Vercel Setup

1. Push repository to GitHub
2. Import in [Vercel](https://vercel.com/new)
3. Add environment variables in Vercel dashboard
4. Deploy

**Environment Scoping:**
- Development: Local `.env` file
- Preview: Vercel preview env vars
- Production: Vercel production env vars

**Automatic Features:**
- ISR with on-demand revalidation
- Edge caching
- Image optimization (for R2 images)
- Preview deployments on PRs
- Custom domain + SSL

---

## Additional Documentation

| Document | Description |
|----------|-------------|
| [Deployment Guide](docs/deployment.md) | Vercel deployment, environment setup |
| [R2 Configuration](docs/r2-configuration.md) | Cloudflare R2 bucket setup, CORS |
| [Performance](docs/performance.md) | Core Web Vitals, caching strategies |
| [Future Integrations](docs/future-integrations.md) | RAG chatbot, blog, analytics setup |

---

## Future Features

The following are stubbed and ready for implementation:

| Feature | Location | Description |
|---------|----------|-------------|
| RAG Chatbot | `/api/chat` | AI-powered portfolio Q&A |
| Blog | `/writing` | Full blog with MDX support |
| Analytics | Root layout | Pluggable analytics (Plausible, etc.) |
| Newsletter | `/api/subscribe` | Email subscriptions |
| Testimonials | Database schema | Customer quotes section |

See [docs/future-integrations.md](docs/future-integrations.md) for implementation guides.

---

## License

This project is private and proprietary. All rights reserved.
