# NowYouKnowMe — Portfolio Web App

A full-stack portfolio web application with a built-in CMS dashboard. Manage projects, experience, certifications, social links, resume, and site configuration — all from a single admin interface. The public site renders content with ISR for fast, SEO-friendly pages.

## Features

### Public Site
- **Project Showcase** — CRUD, drag-and-drop reordering, category filtering, featured indicators
- **Work Experience Timeline** — Chronological display with tech stack tags
- **Certifications** — Credential management with verification links
- **Resume Management** — Upload, activate/deactivate PDF resumes via Cloudflare R2
- **Contact Form** — Server-validated, rate-limited, delivered via Resend
- **Theme Configurator** — Runtime accent color, light/dark mode, WCAG contrast checking
- **SEO** — Dynamic metadata, Open Graph, JSON-LD structured data, sitemap, robots.txt
- **Single-User Auth** — Owner-only login with JWT sessions (no public registration)
- **ISR + On-Demand Revalidation** — Near-instant content updates after CMS edits

### Advanced CMS Dashboard
- **Command Palette** — Quick navigation and search with `Cmd/Ctrl+K`
- **Global Search** — Search across all content types (projects, experience, certifications, pages)
- **Activity Log** — Track all content changes with timestamps and user info
- **Revision History** — Full version control with restore capability
- **Live Preview** — Real-time preview of content changes in multiple device sizes
- **Visual Section Reordering** — Drag-and-drop page sections with preview
- **Media Library** — Centralized file management for images and documents
- **Keyboard Shortcuts** — `Cmd+S` to save, `Cmd+/` for help, full shortcut support
- **Bulk Actions** — Multi-select and batch operations on content
- **Real-time Dashboard** — Live activity feed, stats overview, quick actions

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| API | tRPC v11 |
| ORM | Drizzle ORM |
| Database | PostgreSQL (Neon) |
| Auth | NextAuth.js v5 (Credentials + JWT) |
| Styling | Tailwind CSS + shadcn/ui |
| File Storage | Cloudflare R2 (S3-compatible) |
| Email | Resend |
| Deployment | Vercel |

## Architecture Overview

The application follows a layered architecture with strict separation of concerns:

```
┌─────────────────────────────────────────────┐
│  UI Layer (React Server/Client Components)  │
├─────────────────────────────────────────────┤
│  API Layer (tRPC Routers)                   │
├─────────────────────────────────────────────┤
│  Service Layer (Business Logic)             │
├─────────────────────────────────────────────┤
│  Data Access Layer (Drizzle ORM)            │
├─────────────────────────────────────────────┤
│  External Services (PostgreSQL, R2, Resend) │
└─────────────────────────────────────────────┘
```

- **UI → API**: Public pages use tRPC queries via React Server Components. Admin pages use tRPC client hooks with auth context.
- **API → Service**: Each tRPC router delegates to a corresponding service module.
- **Service → Data**: Services interact with the database exclusively through Drizzle query builders.
- **Auth**: NextAuth middleware protects all `/admin/*` routes. tRPC procedures use a shared auth context.

## Getting Started

### Prerequisites

- **Node.js** 20+ (LTS recommended)
- **PostgreSQL** (local or hosted — [Neon](https://neon.tech) for serverless)
- **pnpm** or **npm** (package manager)
- **Cloudflare R2** bucket (for file uploads)
- **Resend** account (for contact form delivery)

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd nowyouknowme

# 2. Install dependencies
pnpm install  # or npm install

# 3. Create environment file
# Copy the required variables from the Environment Variables section below into a .env file

# 4. Generate and run database migrations
pnpm run db:generate
pnpm run db:migrate

# 5. Seed the owner account
pnpm run db:seed

# 6. Start the development server
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public site and [http://localhost:3000/admin/login](http://localhost:3000/admin/login) for the CMS dashboard.

Default seed credentials (change immediately):
- Email: `admin@example.com`
- Password: `changeme123`

## Environment Variables

Create a `.env` file in the project root with the following variables:

### Database

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |

### Authentication

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXTAUTH_SECRET` | Yes | JWT signing secret (`bash openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Production | Canonical app URL for callbacks |

### Email (Resend)

| Variable | Required | Description |
|----------|----------|-------------|
| `RESEND_API_KEY` | Yes | Resend API key |
| `CONTACT_EMAIL` | Yes | Delivery address for contact form |

### File Storage (Cloudflare R2)

| Variable | Required | Description |
|----------|----------|-------------|
| `R2_ACCOUNT_ID` | Yes | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | Yes | R2 API access key |
| `R2_SECRET_ACCESS_KEY` | Yes | R2 API secret key |
| `R2_BUCKET_NAME` | Yes | R2 bucket name |
| `R2_PUBLIC_URL` | Yes | Public URL for file access |

### App

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | No | Public-facing URL (defaults to localhost:3000) |
| `NODE_ENV` | No | Environment (development/production/test) |

### Seed Script (runtime not required)

| Variable | Required | Description |
|----------|----------|-------------|
| `OWNER_EMAIL` | No | Admin email (defaults to admin@example.com) |
| `OWNER_PASSWORD` | No | Admin password (defaults to changeme123) |

## Database Management

```bash
# Generate migration files from schema changes
pnpm run db:generate

# Apply migrations to the database
pnpm run db:migrate

# Push schema directly (development only — skips migration files)
pnpm run db:push

# Open Drizzle Studio (visual database browser)
pnpm run db:studio

# Seed the owner account
pnpm run db:seed
```

## Scripts

```bash
pnpm run dev          # Start development server
pnpm run build        # Production build
pnpm run start        # Start production server
pnpm run lint         # Run ESLint
pnpm run lint:fix     # Auto-fix lint issues
pnpm run lighthouse   # Run Lighthouse audit
```

## Project Structure

```
nowyouknowme/
├── docs/                       # Additional documentation
│   ├── deployment.md           # Deployment guide
│   ├── future-integrations.md  # Future features implementation guide
│   ├── lighthouse-audit.md    # Lighthouse audit results
│   ├── performance.md          # Performance optimization notes
│   ├── r2-configuration.md    # Cloudflare R2 setup guide
│   └── r2-cors.json           # R2 CORS policy
├── scripts/
│   └── seed.ts                # Database seed script
├── src/
│   ├── app/
│   │   ├── (public)/          # Public site pages (SSG/ISR)
│   │   │   ├── page.tsx       # Homepage
│   │   │   ├── projects/      # Project listing + detail
│   │   │   ├── about/         # About page
│   │   │   ├── experience/    # Experience timeline
│   │   │   ├── certifications/# Certifications display
│   │   │   ├── contact/       # Contact form
│   │   │   └── writing/       # Writing/blog section (future)
│   │   ├── admin/             # CMS Dashboard (SSR, auth-protected)
│   │   │   ├── dashboard/     # Dashboard home with stats + activity log
│   │   │   ├── projects/      # Projects CRUD
│   │   │   ├── pages/         # Section content editor (About, Skills, Contact)
│   │   │   ├── social-links/  # Social links manager
│   │   │   ├── experience/    # Experience CRUD
│   │   │   ├── certifications/# Certifications CRUD
│   │   │   ├── resume/        # Resume manager
│   │   │   ├── media/        # Media library (images, documents)
│   │   │   ├── revisions/    # Revision history browser
│   │   │   └── site-config/   # Theme and SEO settings
│   │   └── api/               # API routes
│   │       ├── trpc/          # tRPC HTTP handler
│   │       ├── auth/          # NextAuth handler
│   │       ├── contact/       # Contact form endpoint
│   │       ├── subscribe/     # Newsletter subscription (stub)
│   │       ├── chat/          # RAG chatbot (stub)
│   │       └── upload/        # File upload endpoint
│   ├── components/
│   │   ├── ui/                # shadcn/ui primitives
│   │   ├── public/            # Public site components
│   │   ├── admin/             # CMS components (tables, forms, modals)
│   │   │   ├── command-palette.tsx       # Global search & navigation
│   │   │   ├── keyboard-shortcuts-help.tsx  # Shortcut reference modal
│   │   │   ├── media-library.tsx        # File management UI
│   │   │   ├── section-reorder.tsx       # Drag-drop section reordering
│   │   │   ├── live-preview.tsx         # Live preview with device sizes
│   │   │   └── revision-history.tsx     # Version history UI
│   │   ├── editor/            # Rich text editor components
│   │   └── analytics.tsx      # Analytics placeholder
│   ├── server/
│   │   ├── api/
│   │   │   ├── routers/       # tRPC routers (projects, experience, search, activity-log, revisions, etc.)
│   │   │   └── trpc.ts       # tRPC configuration
│   │   ├── services/          # Business logic layer (services for all entities)
│   │   └── db/                # Drizzle ORM (schema, migrations)
│   ├── lib/
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── validators/        # Shared Zod schemas
│   │   └── utils.ts           # Utility functions
│   ├── types/                 # TypeScript type definitions
│   ├── styles/                # CSS (globals, themes)
│   └── config/                # Static configuration
├── drizzle.config.ts          # Drizzle ORM config
├── next.config.ts             # Next.js configuration
└── tsconfig.json              # TypeScript config
```

## Deployment

For a complete deployment guide, see [docs/deployment.md](docs/deployment.md).

### Quick Vercel Deployment

1. Push your repository to GitHub/GitLab
2. Import the project in [Vercel](https://vercel.com/new)
3. Add all required environment variables (see Environment Variables above)
4. Set the build command to `pnpm run build`
5. Set the output directory to `.next`
6. Deploy

Vercel automatically handles:
- Edge caching and ISR
- Image optimization (for R2 remote images)
- Preview deployments on PRs
- Custom domain and SSL

### Additional Docs

- [Cloudflare R2 Configuration](docs/r2-configuration.md) — Bucket setup, CORS, and access policies
- [Performance Optimization](docs/performance.md) — Core Web Vitals targets and caching strategies

## Future Features

The following features are stubbed in the codebase and ready for implementation:

- **RAG Chatbot** (`/api/chat`) — AI-powered portfolio assistant using vector DB and embeddings
- **Blog / Writing Section** (`/writing`) — Full blog CMS with markdown/MDX support
- **Analytics Integration** — Pluggable analytics component slot in the root layout
- **Newsletter** (`/api/subscribe`) — Email subscription with double opt-in

For detailed integration guides including setup instructions, provider options, and code examples, see [docs/future-integrations.md](docs/future-integrations.md).

## License

This project is private and proprietary. All rights reserved.
