# Architecture Guide

This document provides a deep dive into the codebase architecture, design patterns, and technical decisions.

---

## Overview

NowYouKnowMe is a full-stack portfolio application with a built-in CMS. The architecture follows a **layered design** with strict separation of concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                        UI Layer                                  │
│  ┌─────────────────────┐         ┌─────────────────────────┐   │
│  │  Server Components  │         │   Client Components     │   │
│  │  (SSR + ISR)        │         │   ("use client")       │   │
│  └─────────────────────┘         └─────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                        API Layer                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    tRPC v11                              │   │
│  │  Public Procedures (SSR) │ Protected Procedures (Auth)   │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                     Service Layer                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Business Logic (Services)                    │   │
│  │  Validation → Processing → Audit Logging → Response      │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                   Data Access Layer                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   Drizzle ORM                            │   │
│  │         Type-safe queries → PostgreSQL                   │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                  External Services                               │
│     PostgreSQL (Neon)  │  Cloudflare R2  │  Resend (Email)    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
src/
├── app/                        # Next.js App Router
│   ├── (public)/              # Public site routes
│   │   ├── page.tsx          # Homepage (multi-section)
│   │   ├── projects/          # Projects listing & detail
│   │   ├── experience/        # Experience timeline
│   │   ├── certifications/    # Certifications display
│   │   ├── about/            # About page
│   │   ├── contact/          # Contact page
│   │   └── writing/          # Blog (future)
│   │
│   ├── admin/                 # CMS Dashboard (auth-protected)
│   │   ├── login/            # Authentication
│   │   ├── dashboard/        # Overview & stats
│   │   ├── projects/         # Projects CRUD
│   │   ├── experience/       # Experience CRUD
│   │   ├── certifications/   # Certifications CRUD
│   │   ├── pages/           # Content sections (About, Skills)
│   │   ├── social-links/     # Social links manager
│   │   ├── resume/          # Resume management
│   │   ├── media/           # File manager
│   │   ├── site-config/     # Theme & SEO settings
│   │   └── revisions/       # Version history
│   │
│   └── api/                   # API Routes
│       ├── trpc/[trpc]/      # tRPC HTTP handler
│       ├── auth/[...nextauth]/ # NextAuth.js handlers
│       ├── contact/          # Contact form endpoint
│       ├── upload/           # File upload endpoint
│       └── subscribe/         # Newsletter (stub)
│
├── components/                 # React Components
│   ├── ui/                   # shadcn/ui primitives
│   ├── public/              # Public site components
│   ├── admin/               # CMS dashboard components
│   └── editor/              # Rich text editor
│
├── server/                    # Server-Side Code
│   ├── api/
│   │   ├── routers/         # tRPC routers
│   │   ├── trpc.ts          # tRPC configuration
│   │   └── root.ts          # Root router
│   │
│   ├── services/            # Business logic
│   │   ├── project.service.ts
│   │   ├── experience.service.ts
│   │   ├── certification.service.ts
│   │   ├── content.service.ts   # Pages/sections
│   │   ├── social-link.service.ts
│   │   ├── resume.service.ts
│   │   ├── site-config.service.ts
│   │   ├── activity-log.service.ts
│   │   ├── revision.service.ts
│   │   ├── upload.service.ts
│   │   └── email.service.ts
│   │
│   └── db/
│       ├── schema/          # Drizzle schema definitions
│       └── index.ts         # Database client
│
├── lib/                      # Client-Side Utilities
│   ├── trpc/                # tRPC client setup
│   ├── validators/           # Zod validation schemas
│   ├── auth.ts              # NextAuth configuration
│   ├── rate-limit.ts        # Rate limiting
│   ├── sanitize.ts          # HTML sanitization
│   └── utils.ts             # General utilities
│
├── types/                    # TypeScript Types
├── styles/                  # Global Styles
└── config/                  # Configuration
```

---

## tRPC Architecture

### Router Structure

```
appRouter
├── projects
│   ├── list              (public) - Published projects
│   ├── getBySlug         (public) - Single project by slug
│   ├── getFeatured       (public) - Featured projects only
│   ├── getAll            (protected) - All projects for admin
│   ├── create            (protected) - Create project
│   ├── update            (protected) - Update project
│   ├── delete            (protected) - Delete project
│   └── reorder           (protected) - Update display order
│
├── experience
│   ├── listVisible       (public) - Visible experiences
│   ├── getAll            (protected) - All for admin
│   ├── create            (protected)
│   ├── update            (protected)
│   ├── delete            (protected)
│   └── reorder           (protected)
│
├── certifications
│   ├── listVisible       (public) - Visible certs
│   ├── getAll            (protected)
│   ├── create            (protected)
│   ├── update            (protected)
│   └── delete            (protected)
│
├── pages
│   ├── getSection        (public) - Get section by key
│   └── upsert            (protected) - Create/update section
│
├── socialLinks
│   ├── listVisible       (public)
│   ├── getAll            (protected)
│   ├── create            (protected)
│   ├── update            (protected)
│   ├── delete            (protected)
│   └── toggleVisibility  (protected)
│
├── resume
│   ├── getActive         (public)
│   ├── getAll            (protected)
│   ├── upload            (protected)
│   ├── setActive         (protected)
│   └── delete            (protected)
│
├── siteConfig
│   ├── get               (public)
│   └── update            (protected)
│
├── search
│   └── search            (protected) - Global search
│
├── activityLog
│   ├── getRecent         (protected)
│   └── create            (internal)
│
└── revisions
    ├── getByEntity       (protected)
    └── restore           (protected)
```

### Procedure Types

```typescript
// Public procedure - no auth required
export const publicProcedure = publicProcedure;

// Protected procedure - auth required
export const protectedProcedure = publicProcedure
  .use(authMiddleware); // Checks session, throws if unauthorized

// Internal procedure - for service-to-service calls
export const internalProcedure = protectedProcedure;
```

---

## Service Layer Pattern

Each entity has a corresponding service that handles business logic:

```typescript
// Example: project.service.ts
export class ProjectService {
  // Public read operations
  async list(): Promise<Project[]> { ... }
  async getBySlug(slug: string): Promise<Project | null> { ... }
  
  // Protected write operations (called from tRPC routers)
  async create(data: CreateProjectInput): Promise<Project> {
    // 1. Validate input
    // 2. Generate slug if needed
    // 3. Insert into database
    // 4. Create revision
    // 5. Log activity
    // 6. Return result
  }
  
  async update(id: string, data: UpdateProjectInput): Promise<Project> { ... }
  async delete(id: string): Promise<void> { ... }
}
```

### Service Responsibilities

| Responsibility | Description |
|----------------|-------------|
| Validation | Validate input using Zod schemas |
| Business Logic | Transform data, generate slugs, handle defaults |
| Database Operations | CRUD via Drizzle ORM |
| Audit Trail | Create revisions and activity logs |
| Error Handling | Throw descriptive errors |

---

## Database Schema

### Core Entities

```typescript
// projects table
{
  id: uuid PK
  title: string
  slug: string unique
  description: text
  longDescription: text nullable
  techStack: jsonb
  category: enum('cybersecurity', 'cloud', 'web', 'other')
  githubUrl: string nullable
  liveUrl: string nullable
  thumbnailUrl: string nullable
  isFeatured: boolean default false
  displayOrder: integer
  status: enum('draft', 'published')
  createdAt: timestamp
  updatedAt: timestamp
}

// experiences table
{
  id: uuid PK
  companyName: string
  roleTitle: string
  startDate: date
  endDate: date nullable
  description: text nullable
  techStack: jsonb
  displayOrder: integer
  isVisible: boolean default true
  createdAt: timestamp
  updatedAt: timestamp
}

// certifications table
{
  id: uuid PK
  name: string
  issuer: string
  issueDate: date
  expirationDate: date nullable
  credentialId: string nullable
  verificationUrl: string nullable
  badgeUrl: string nullable
  displayOrder: integer
  isVisible: boolean default true
  createdAt: timestamp
  updatedAt: timestamp
}

// sections table (CMS content)
{
  id: uuid PK
  key: string unique  // 'about', 'skills', 'hero', etc.
  title: string
  content: text       // HTML or JSON depending on key
  createdAt: timestamp
  updatedAt: timestamp
}

// socialLinks table
{
  id: uuid PK
  platform: string
  url: string
  displayOrder: integer
  isVisible: boolean default true
  createdAt: timestamp
  updatedAt: timestamp
}

// resumes table
{
  id: uuid PK
  title: string
  fileUrl: string
  fileKey: string      // R2 object key
  fileSize: integer
  isActive: boolean default false
  createdAt: timestamp
  updatedAt: timestamp
}

// siteConfig table (single row)
{
  id: uuid PK
  heroTagline: string
  metaDescription: string
  ogImageUrl: string nullable
  accentColor: string
  resumeUrl: string nullable
  updatedAt: timestamp
}

// users table
{
  id: uuid PK
  email: string unique
  passwordHash: string
  createdAt: timestamp
}

// activityLog table
{
  id: uuid PK
  userId: uuid FK nullable
  entityType: string    // 'project', 'experience', etc.
  entityId: uuid
  action: enum('create', 'update', 'delete')
  changes: jsonb
  createdAt: timestamp
}

// revisions table
{
  id: uuid PK
  entityType: string
  entityId: uuid
  data: jsonb
  createdAt: timestamp
}
```

---

## Authentication Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                        Login Flow                                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. User submits credentials at /admin/login                      │
│                              ↓                                     │
│  2. NextAuth validates against bcrypt hash in users table         │
│                              ↓                                     │
│  3. JWT issued with session payload (userId, email)              │
│                              ↓                                     │
│  4. Session cookie set (httpOnly, secure, sameSite)              │
│                              ↓                                     │
│  5. Redirect to /admin/dashboard                                 │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│                        Request Flow                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Request → Middleware (match /admin/*)                            │
│                    ↓                                              │
│         Check session cookie                                       │
│                    ↓                                              │
│         Valid? → Continue to page/router                          │
│            │                                                      │
│            ↓ No                                                    │
│         Redirect to /admin/login                                   │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│                    tRPC Auth Check                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Protected procedure called                                         │
│                    ↓                                              │
│  authMiddleware extracts session from headers                      │
│                    ↓                                              │
│  Session valid? → Execute procedure                                │
│            │                                                      │
│            ↓ No                                                    │
│  throw new TRPCError({ code: 'UNAUTHORIZED' })                   │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## File Upload Flow (R2)

```
┌──────────────────────────────────────────────────────────────────┐
│                      Upload Flow                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. Admin selects file in Media Library or Resume Manager         │
│                              ↓                                     │
│  2. File sent to /api/upload with auth cookie                     │
│                              ↓                                     │
│  3. API validates:                                                 │
│     - File type (magic bytes)                                     │
│     - File size (max 10MB)                                        │
│     - User session (must be authenticated)                        │
│     - Rate limit check                                            │
│                              ↓                                     │
│  4. Generate unique key: {type}/{uuid}-{filename}                  │
│     Example: images/a1b2c3d4-project-thumb.png                    │
│                              ↓                                     │
│  5. Upload to R2 with Cache-Control header                         │
│     Cache-Control: public, max-age=31536000, immutable            │
│                              ↓                                     │
│  6. Store metadata in resumes table                               │
│                              ↓                                     │
│  7. Return { url, key, fileSize }                                │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│                      Serving Flow                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Browser requests: https://cdn.yourdomain.com/images/...         │
│                              ↓                                     │
│  R2 serves file directly (no app server involvement)              │
│                              ↓                                     │
│  Cache-Control headers enable CDN caching                          │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## ISR and Caching Strategy

### Revalidation Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    Content Update Flow                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. Admin updates content in CMS                                  │
│                              ↓                                     │
│  2. tRPC mutation called → Service processes                      │
│                              ↓                                     │
│  3. Database updated                                               │
│                              ↓                                     │
│  4. Activity logged, revision created                              │
│                              ↓                                     │
│  5. On success, client calls revalidatePath()                     │
│                              ↓                                     │
│  6. Next.js marks page as stale                                   │
│                              ↓                                     │
│  7. Next request generates fresh HTML                              │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Cache Headers

| Route | Cache-Control | Notes |
|-------|--------------|-------|
| Static pages | ISR 60s | `s-maxage=60, stale-while-revalidate` |
| Static assets | `max-age=31536000, immutable` | Fingerprinted filenames |
| API routes | `no-store` | Dynamic content |
| R2 files | `max-age=31536000, immutable` | UUID-keyed, immutable |

---

## Component Architecture

### Public Site Components

```
src/components/public/
├── hero-v3.tsx           # Hero section (uses tRPC client)
├── featured-projects.tsx  # Projects preview (uses tRPC client)
├── project-grid.tsx       # Filterable project list (client component)
├── project-card.tsx       # Individual project card
├── experience-section.tsx # Experience preview (tRPC client)
├── experience-timeline.tsx # Timeline display
├── skills-section.tsx     # Skills preview (tRPC client)
├── about-section.tsx     # About preview (tRPC client)
├── contact-section.tsx   # Contact form section
├── contact-form.tsx      # Form component
├── social-links.tsx      # Social links display
├── site-header-v3.tsx    # Navigation header
├── site-footer-v3.tsx    # Footer (tRPC client for social links)
├── scroll-progress.tsx   # Reading progress bar
├── grain-overlay.tsx      # Visual effect
└── theme-toggle.tsx      # Dark/light mode toggle
```

### CMS Dashboard Components

```
src/components/admin/
├── project-form.tsx           # Create/edit project
├── project-table.tsx          # Project list with actions
├── experience-form.tsx        # Create/edit experience
├── experience-table.tsx       # Experience list
├── certification-form.tsx      # Create/edit certification
├── certification-table.tsx    # Certification list
├── social-link-list.tsx       # Social links editor
├── theme-configurator.tsx     # Theme settings UI
├── accent-color-preview.tsx   # Color picker with contrast check
├── command-palette.tsx       # Cmd+K search
├── keyboard-shortcuts-help.tsx # Shortcut reference modal
├── live-preview.tsx           # Device preview panel
├── media-library.tsx          # File manager UI
├── section-reorder.tsx        # Drag-drop section reorder
├── revision-history.tsx       # Version history viewer
├── sortable-list.tsx          # Reorderable list wrapper
└── use-keyboard-save.ts       # Cmd+S hook
```

---

## Design Patterns

### 1. Service Layer Pattern

All business logic lives in services, not in tRPC routers:

```typescript
// ❌ Bad: Logic in router
router.create = protectedProcedure
  .input(...)
  .mutation(async ({ input }) => {
    // Hash password, generate slug, validate, insert...
    // This belongs in a service!
  });

// ✅ Good: Router delegates to service
router.create = protectedProcedure
  .input(createProjectSchema)
  .mutation(({ input }) => projectService.create(input));
```

### 2. Repository Pattern (via Drizzle)

Services don't write raw SQL — they use Drizzle query builders:

```typescript
// ❌ Bad: Raw SQL in service
await db.execute(sql`SELECT * FROM projects WHERE status = 'published'`);

// ✅ Good: Type-safe Drizzle queries
await db.query.projects.findMany({
  where: eq(projects.status, 'published'),
  orderBy: asc(projects.displayOrder),
});
```

### 3. Audit Trail Pattern

Every mutation creates a revision and logs activity:

```typescript
async create(input: CreateProjectInput): Promise<Project> {
  // 1. Insert project
  const [project] = await db.insert(projects).values(input).returning();
  
  // 2. Create revision
  await revisionService.create({
    entityType: 'project',
    entityId: project.id,
    data: project,
  });
  
  // 3. Log activity
  await activityLogService.create({
    entityType: 'project',
    entityId: project.id,
    action: 'create',
  });
  
  return project;
}
```

### 4. Error Handling Pattern

Consistent error responses across the API:

```typescript
// Throw descriptive errors
throw new TRPCError({
  code: 'NOT_FOUND',
  message: `Project with id ${id} not found`,
  cause: new Error('Project not found in database'),
});

// Catch and transform in router
.catch(({ error }) => {
  if (error.code === 'NOT_FOUND') {
    throw new TRPCError({ code: 'NOT_FOUND', message: error.message });
  }
  throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
});
```

---

## Security Measures

| Layer | Measure | Implementation |
|-------|---------|----------------|
| Authentication | JWT sessions | NextAuth.js v5 with secure cookies |
| Authorization | Protected procedures | `authMiddleware` on all admin procedures |
| Input Validation | Zod schemas | All tRPC inputs validated |
| XSS Prevention | HTML sanitization | DOMPurify on rich text content |
| CSRF | SameSite cookies | NextAuth default |
| Rate Limiting | In-memory store | Contact form, upload endpoint |
| File Upload | Magic byte validation | File type verified, not just extension |
| CSP | Content Security Policy | Configured in next.config.ts |
| Headers | Security headers | HSTS, X-Frame-Options, etc. |

---

## Performance Optimizations

| Area | Optimization | Impact |
|------|-------------|--------|
| Rendering | React Server Components | Minimal JS shipped to client |
| Data Fetching | ISR (60s) | Pre-rendered pages, fast TTFB |
| Images | Next.js Image + AVIF/WebP | Optimized images, lazy loading |
| Fonts | next/font with swap | Self-hosted, preloaded |
| Database | Connection pooling | Neon serverless-compatible |
| CDN | Vercel Edge Network | Global distribution |
| Caching | Immutable static assets | Long-lived cache |

---

## Environment Variables

### Server-Side (Private)

```env
# Database
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_SECRET=<generate with openssl>
NEXTAUTH_URL=https://yoursite.com

# Email
RESEND_API_KEY=re_...
CONTACT_EMAIL=you@example.com

# File Storage
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=portfolio-uploads
R2_PUBLIC_URL=https://cdn.yoursite.com
```

### Client-Side (Public)

```env
NEXT_PUBLIC_APP_URL=https://yoursite.com
```

---

## Testing Strategy

| Type | Location | Purpose |
|------|----------|---------|
| Unit | `tests/lib/` | Utility functions |
| Service | `tests/services/` | Business logic |
| Router | `tests/routers/` | API endpoints |
| Component | `tests/components/` | UI components |
| E2E | `tests/app/` | Full page flows |
| API | `tests/api/` | HTTP endpoints |
| Validators | `tests/validators/` | Zod schemas |
| SEO | `tests/seo/` | Meta tags, structured data |

---

## Related Documents

- [Deployment Guide](deployment.md) - Vercel setup, environment configuration
- [R2 Configuration](r2-configuration.md) - File storage setup, CORS
- [Performance](performance.md) - Core Web Vitals, optimizations
- [Lighthouse Audit](lighthouse-audit.md) - Audit checklist, expected scores
- [Future Integrations](future-integrations.md) - RAG chatbot, blog, analytics
