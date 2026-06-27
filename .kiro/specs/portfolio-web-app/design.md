# Design Document

## Overview

This design document describes the technical architecture for the portfolio web application. The system uses Next.js 14 (App Router) for SSR/SSG, Tailwind CSS with shadcn/ui for styling, tRPC for the API layer, Drizzle ORM with PostgreSQL for data persistence, NextAuth.js for authentication, and Cloudflare R2 (S3-compatible) for file storage. Deployment targets Vercel with ISR for content freshness.

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel Edge                            │
├─────────────────────────────────────────────────────────────┤
│  Next.js App Router                                          │
│  ┌──────────────────┐  ┌──────────────────────────────────┐ │
│  │  Public Pages     │  │  CMS Dashboard (/admin/*)        │ │
│  │  (SSG/ISR)        │  │  (SSR, Auth-Protected)           │ │
│  │  - /              │  │  - /admin/dashboard              │ │
│  │  - /projects      │  │  - /admin/projects               │ │
│  │  - /projects/[s]  │  │  - /admin/content                │ │
│  │  - /about         │  │  - /admin/social-links           │ │
│  │  - /contact       │  │  - /admin/resume                 │ │
│  └──────────────────┘  │  - /admin/site-config             │ │
│                         └──────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  API Layer (tRPC Routers)                                    │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐ │
│  │projects│ │content │ │social  │ │resume  │ │site-config│ │
│  │router  │ │router  │ │router  │ │router  │ │router     │ │
│  └────────┘ └────────┘ └────────┘ └────────┘ └──────────┘ │
│  ┌──────────┐ ┌──────────────┐                              │
│  │experience│ │certifications│                              │
│  │router    │ │router        │                              │
│  └──────────┘ └──────────────┘                              │
├─────────────────────────────────────────────────────────────┤
│  Service Layer                                               │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐ │
│  │project │ │content │ │social  │ │resume  │ │config    │ │
│  │service │ │service │ │service │ │service │ │service    │ │
│  └────────┘ └────────┘ └────────┘ └────────┘ └──────────┘ │
│  ┌──────────────┐ ┌──────────────────┐                      │
│  │experience    │ │certification     │                      │
│  │service       │ │service           │                      │
│  └──────────────┘ └──────────────────┘                      │
├─────────────────────────────────────────────────────────────┤
│  Data Access Layer (Drizzle ORM)                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Schema Definitions + Query Builders + Migrations     │   │
│  └──────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  External Services                                           │
│  ┌──────────┐  ┌────────────┐  ┌─────────────────────────┐ │
│  │PostgreSQL│  │Cloudflare  │  │Resend (Email Delivery)  │ │
│  │(Neon/    │  │R2 (Files)  │  │                         │ │
│  │Supabase) │  │            │  │                         │ │
│  └──────────┘  └────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Technology Choices

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | Next.js 14 (App Router) | SSR/SSG/ISR support, React Server Components, file-based routing, Vercel-optimized |
| Styling | Tailwind CSS + shadcn/ui | Design tokens via CSS variables, accessible components, themeable at runtime |
| API | tRPC v11 | End-to-end type safety, no codegen, collocated with Next.js |
| ORM | Drizzle ORM | TypeScript-first, lightweight, supports PostgreSQL, excellent migration tooling |
| Database | PostgreSQL (Neon) | Serverless-compatible, full relational support, branching for preview |
| Auth | NextAuth.js v5 (Auth.js) | Credential provider for email/password, middleware integration, session management |
| File Storage | Cloudflare R2 | S3-compatible API, no egress fees, global CDN |
| Email | Resend | Developer-friendly API, reliable delivery, React Email templates |
| Deployment | Vercel | Zero-config Next.js deployment, edge functions, ISR, preview deployments |

### Directory Structure

```
src/
├── app/
│   ├── (public)/              # Public site route group
│   │   ├── page.tsx           # Homepage (Hero, About preview, Featured projects)
│   │   ├── projects/
│   │   │   ├── page.tsx       # Project listing with filters
│   │   │   └── [slug]/
│   │   │       └── page.tsx   # Project detail page
│   │   ├── about/
│   │   │   └── page.tsx       # About page
│   │   ├── experience/
│   │   │   └── page.tsx       # Work experience timeline page
│   │   ├── certifications/
│   │   │   └── page.tsx       # Certifications display page
│   │   └── contact/
│   │       └── page.tsx       # Contact form page
│   ├── admin/                 # CMS Dashboard route group
│   │   ├── layout.tsx         # Auth-protected layout shell
│   │   ├── dashboard/
│   │   │   └── page.tsx       # Dashboard home with stats
│   │   ├── projects/
│   │   │   └── page.tsx       # Projects CRUD table
│   │   ├── content/
│   │   │   └── page.tsx       # Section content editor
│   │   ├── social-links/
│   │   │   └── page.tsx       # Social links manager
│   │   ├── experience/
│   │   │   └── page.tsx       # Work experience CRUD table
│   │   ├── certifications/
│   │   │   └── page.tsx       # Certifications CRUD table
│   │   ├── resume/
│   │   │   └── page.tsx       # Resume manager
│   │   └── site-config/
│   │       └── page.tsx       # Theme and SEO config
│   ├── api/
│   │   ├── trpc/[trpc]/
│   │   │   └── route.ts       # tRPC HTTP handler
│   │   ├── auth/[...nextauth]/
│   │   │   └── route.ts       # NextAuth route handler
│   │   ├── contact/
│   │   │   └── route.ts       # Contact form submission
│   │   ├── upload/
│   │   │   └── route.ts       # File upload endpoint
│   │   ├── chat/
│   │   │   └── route.ts       # Future: RAG chatbot stub
│   │   └── subscribe/
│   │       └── route.ts       # Future: Newsletter stub
│   ├── layout.tsx             # Root layout (theme provider, fonts, analytics slot)
│   ├── sitemap.ts             # Dynamic sitemap generation
│   └── robots.ts              # Robots.txt generation
├── components/
│   ├── ui/                    # shadcn/ui primitives
│   ├── public/                # Public site components
│   │   ├── hero.tsx
│   │   ├── project-card.tsx
│   │   ├── project-grid.tsx
│   │   ├── skills-display.tsx
│   │   ├── social-links.tsx
│   │   ├── contact-form.tsx
│   │   ├── resume-button.tsx
│   │   ├── experience-timeline.tsx
│   │   ├── certification-card.tsx
│   │   └── theme-toggle.tsx
│   └── admin/                 # CMS components
│       ├── project-table.tsx
│       ├── project-form.tsx
│       ├── content-editor.tsx
│       ├── social-link-list.tsx
│       ├── experience-table.tsx
│       ├── experience-form.tsx
│       ├── certification-table.tsx
│       ├── certification-form.tsx
│       ├── resume-uploader.tsx
│       ├── theme-configurator.tsx
│       └── sortable-list.tsx
├── server/
│   ├── api/
│   │   ├── root.ts            # tRPC root router
│   │   ├── trpc.ts            # tRPC initialization + context
│   │   └── routers/
│   │       ├── projects.ts
│   │       ├── content.ts
│   │       ├── social-links.ts
│   │       ├── experience.ts
│   │       ├── certifications.ts
│   │       ├── resume.ts
│   │       └── site-config.ts
│   ├── services/
│   │   ├── project.service.ts
│   │   ├── content.service.ts
│   │   ├── social-link.service.ts
│   │   ├── experience.service.ts
│   │   ├── certification.service.ts
│   │   ├── resume.service.ts
│   │   ├── site-config.service.ts
│   │   ├── upload.service.ts
│   │   └── email.service.ts
│   └── db/
│       ├── index.ts           # Drizzle client instance
│       ├── schema/
│       │   ├── user.ts
│       │   ├── project.ts
│       │   ├── section.ts
│       │   ├── social-link.ts
│       │   ├── experience.ts
│       │   ├── certification.ts
│       │   ├── resume.ts
│       │   ├── site-config.ts
│       │   └── index.ts       # Re-exports all schemas
│       └── migrations/        # Generated SQL migrations
├── lib/
│   ├── auth.ts                # NextAuth configuration
│   ├── validators/
│   │   ├── project.ts         # Zod schemas for projects
│   │   ├── contact.ts         # Zod schemas for contact form
│   │   ├── social-link.ts
│   │   ├── experience.ts     # Zod schemas for experience entries
│   │   ├── certification.ts  # Zod schemas for certifications
│   │   ├── resume.ts
│   │   └── site-config.ts
│   ├── utils.ts               # Shared utilities (cn, slugify, etc.)
│   └── constants.ts           # App-wide constants
├── types/
│   ├── index.ts               # Shared type definitions
│   ├── project.ts
│   ├── experience.ts
│   ├── certification.ts
│   ├── section.ts
│   └── site-config.ts
├── styles/
│   ├── globals.css            # Tailwind directives + CSS custom properties
│   └── themes.css             # Theme token definitions (light/dark/accent)
└── config/
    └── site.ts                # Static site config (fallbacks, feature flags)
```

## Components and Interfaces

### Layer Contracts

The architecture follows a strict layered approach where each layer communicates only through well-defined interfaces.

#### UI Layer → API Layer (tRPC Client)

```typescript
// All CMS components communicate with the backend via tRPC hooks
// Type-safe procedure calls with automatic inference
type ProjectRouter = {
  list: () => Project[];
  getBySlug: (slug: string) => Project | null;
  create: (input: ProjectCreateInput) => Project;
  update: (input: ProjectUpdateInput) => Project;
  delete: (id: string) => void;
  reorder: (input: { id: string; displayOrder: number }[]) => void;
};
```

#### API Layer → Service Layer

```typescript
// Each tRPC router delegates business logic to a corresponding service
interface ProjectService {
  listPublished(): Promise<Project[]>;
  listAll(): Promise<Project[]>;
  getBySlug(slug: string): Promise<Project | null>;
  create(data: ProjectCreateInput): Promise<Project>;
  update(id: string, data: ProjectUpdateInput): Promise<Project>;
  delete(id: string): Promise<void>;
  reorder(items: { id: string; displayOrder: number }[]): Promise<void>;
}

interface ExperienceService {
  listVisible(): Promise<Experience[]>;
  listAll(): Promise<Experience[]>;
  create(data: ExperienceCreateInput): Promise<Experience>;
  update(id: string, data: ExperienceUpdateInput): Promise<Experience>;
  delete(id: string): Promise<void>;
  reorder(items: { id: string; displayOrder: number }[]): Promise<void>;
}

interface CertificationService {
  listVisible(): Promise<Certification[]>;
  listAll(): Promise<Certification[]>;
  create(data: CertificationCreateInput): Promise<Certification>;
  update(id: string, data: CertificationUpdateInput): Promise<Certification>;
  delete(id: string): Promise<void>;
  reorder(items: { id: string; displayOrder: number }[]): Promise<void>;
}

interface UploadService {
  uploadFile(file: Buffer, metadata: FileMetadata): Promise<{ url: string }>;
  validateFile(file: Buffer, allowedTypes: string[], maxSize: number): ValidationResult;
}

interface EmailService {
  sendContactEmail(data: ContactFormData): Promise<{ success: boolean }>;
}
```

#### Service Layer → Data Access Layer (Drizzle ORM)

```typescript
// Services interact with the database exclusively through Drizzle query builders
// No raw SQL in service code — all queries use the type-safe Drizzle API
import { db } from '@/server/db';
import { projects, socialLinks, resumes, experiences, certifications, siteConfig } from '@/server/db/schema';
```

#### Authentication Middleware Contract

```typescript
// Middleware enforces auth at the route level before any handler executes
interface AuthMiddleware {
  protectRoute(request: NextRequest): NextResponse | void;
  getSession(request: NextRequest): Session | null;
}

// tRPC context provides auth state to all procedures
interface TRPCContext {
  session: Session | null;
  db: DrizzleClient;
}
```

#### Validation Layer Contract

```typescript
// Shared Zod schemas used by both client and server
// Located in src/lib/validators/
import { z } from 'zod';

export const projectSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().min(1),
  category: z.enum(['cybersecurity', 'cloud', 'web', 'other']),
  // ...
});

// Client: used in React Hook Form resolver
// Server: used as tRPC procedure .input() schema
```

#### File Storage Interface

```typescript
interface FileStorageClient {
  put(key: string, body: Buffer, contentType: string): Promise<{ url: string }>;
  delete(key: string): Promise<void>;
  getSignedUrl(key: string, expiresIn: number): Promise<string>;
}
```

### Component Communication Patterns

| Source | Target | Mechanism | Auth Required |
|--------|--------|-----------|---------------|
| Public Page | API | tRPC query (RSC) | No |
| Admin Page | API | tRPC query/mutation (client) | Yes |
| API Router | Service | Direct function call | N/A (internal) |
| Service | Database | Drizzle query builder | N/A (internal) |
| Service | File Storage | S3-compatible SDK | N/A (internal) |
| Service | Email | Resend SDK | N/A (internal) |
| Middleware | Auth | NextAuth session check | N/A (infrastructure) |

## Data Models

### Entity Relationship Diagram

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│   User   │────<│ Social_Link  │     │   Project    │
│          │     └──────────────┘     └──────────────┘
│          │────<│   Resume     │     
│          │     └──────────────┘     ┌──────────────┐
│          │────<│  Experience  │     │   Section    │
│          │     └──────────────┘     └──────────────┘
│          │────<│Certification │     ┌──────────────┐
│          │     └──────────────┘     │ Site_Config  │
└──────────┘                          └──────────────┘
```

### Schema Definitions (Drizzle)

#### User
```typescript
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

#### Project
```typescript
export const projectCategoryEnum = pgEnum('project_category', [
  'cybersecurity', 'cloud', 'web', 'other'
]);

export const projectStatusEnum = pgEnum('project_status', [
  'draft', 'published'
]);

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description').notNull(),
  longDescription: text('long_description'),
  techStack: json('tech_stack').$type<string[]>().default([]),
  category: projectCategoryEnum('category').notNull(),
  githubUrl: varchar('github_url', { length: 500 }),
  liveUrl: varchar('live_url', { length: 500 }),
  thumbnailUrl: varchar('thumbnail_url', { length: 500 }),
  isFeatured: boolean('is_featured').default(false).notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  status: projectStatusEnum('status').default('draft').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

#### Section
```typescript
export const sections = pgTable('sections', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: varchar('key', { length: 50 }).notNull().unique(),
  content: text('content').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

#### Social Link
```typescript
export const socialLinks = pgTable('social_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  platform: varchar('platform', { length: 100 }).notNull(),
  url: varchar('url', { length: 500 }).notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  isVisible: boolean('is_visible').default(true).notNull(),
});
```

#### Resume
```typescript
export const resumes = pgTable('resumes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  fileUrl: varchar('file_url', { length: 500 }).notNull(),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
});
```

#### Site Config
```typescript
export const siteConfig = pgTable('site_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  theme: varchar('theme', { length: 20 }).default('system').notNull(),
  accentColor: varchar('accent_color', { length: 7 }).default('#2563eb').notNull(),
  heroTagline: text('hero_tagline').default('').notNull(),
  metaDescription: text('meta_description').default('').notNull(),
  ogImageUrl: varchar('og_image_url', { length: 500 }),
});
```

#### Experience
```typescript
export const experiences = pgTable('experiences', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyName: varchar('company_name', { length: 255 }).notNull(),
  roleTitle: varchar('role_title', { length: 255 }).notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),  // nullable — null means current position
  description: text('description'),
  techStack: json('tech_stack').$type<string[]>().default([]),
  displayOrder: integer('display_order').default(0).notNull(),
  isVisible: boolean('is_visible').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

#### Certification
```typescript
export const certifications = pgTable('certifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  certificationName: varchar('certification_name', { length: 255 }).notNull(),
  issuingOrganization: varchar('issuing_organization', { length: 255 }).notNull(),
  issueDate: date('issue_date').notNull(),
  expiryDate: date('expiry_date'),  // nullable — null means no expiry
  credentialId: varchar('credential_id', { length: 255 }),
  credentialUrl: varchar('credential_url', { length: 500 }),
  displayOrder: integer('display_order').default(0).notNull(),
  isVisible: boolean('is_visible').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### Future Stubs (Data Models)

```typescript
// Blog Post (future)
export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  content: text('content'),
  status: varchar('status', { length: 20 }).default('draft'),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Subscriber (future)
export const subscribers = pgTable('subscribers', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  subscribedAt: timestamp('subscribed_at').defaultNow().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
});

// Testimonial (future)
export const testimonials = pgTable('testimonials', {
  id: uuid('id').primaryKey().defaultRandom(),
  authorName: varchar('author_name', { length: 255 }).notNull(),
  authorTitle: varchar('author_title', { length: 255 }),
  content: text('content').notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  isVisible: boolean('is_visible').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

## API Design (tRPC Routers)

### Projects Router

| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `projects.list` | query | no | List published projects (public) |
| `projects.getBySlug` | query | no | Get single project by slug (public) |
| `projects.listAll` | query | yes | List all projects inc. drafts (admin) |
| `projects.create` | mutation | yes | Create new project |
| `projects.update` | mutation | yes | Update existing project |
| `projects.delete` | mutation | yes | Delete project |
| `projects.reorder` | mutation | yes | Update display_order for multiple projects |

### Content Router

| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `content.getSection` | query | no | Get section by key (public) |
| `content.updateSection` | mutation | yes | Update section content |

### Social Links Router

| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `socialLinks.listVisible` | query | no | List visible links (public) |
| `socialLinks.listAll` | query | yes | List all links (admin) |
| `socialLinks.create` | mutation | yes | Add new social link |
| `socialLinks.update` | mutation | yes | Update link |
| `socialLinks.delete` | mutation | yes | Delete link |
| `socialLinks.reorder` | mutation | yes | Update display_order |

### Resume Router

| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `resume.getActive` | query | no | Get current active resume URL (public) |
| `resume.listAll` | query | yes | List all resumes (admin) |
| `resume.setActive` | mutation | yes | Set a resume as active |

### Site Config Router

| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `siteConfig.get` | query | no | Get site configuration (public) |
| `siteConfig.update` | mutation | yes | Update site configuration |

### Experience Router

| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `experience.listVisible` | query | no | List visible experiences sorted chronologically, most recent first (public) |
| `experience.listAll` | query | yes | List all experiences (admin) |
| `experience.create` | mutation | yes | Create new experience entry |
| `experience.update` | mutation | yes | Update existing experience entry |
| `experience.delete` | mutation | yes | Delete experience entry |
| `experience.reorder` | mutation | yes | Update display_order for multiple experiences |

### Certifications Router

| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `certifications.listVisible` | query | no | List visible certifications in display_order (public) |
| `certifications.listAll` | query | yes | List all certifications (admin) |
| `certifications.create` | mutation | yes | Create new certification entry |
| `certifications.update` | mutation | yes | Update existing certification entry |
| `certifications.delete` | mutation | yes | Delete certification entry |
| `certifications.reorder` | mutation | yes | Update display_order for multiple certifications |

## Key Design Decisions

### 1. Theme System (Runtime, No Rebuild)

The theme system uses CSS custom properties (variables) for all color tokens. The accent color from Site_Config is injected as a CSS variable at the root layout level via server-side rendering. When the Owner updates the accent color, ISR regenerates the page with the new value — no rebuild needed.

```
:root {
  --accent: <from-db>;
  --accent-foreground: <computed>;
}
.dark {
  --background: ...;
  --foreground: ...;
}
```

Light/dark mode uses `next-themes` with the `class` strategy and `prefers-color-scheme` as the default. The Visitor's choice is stored in localStorage.

### 2. ISR Strategy

| Page | Strategy | Revalidation |
|------|----------|-------------|
| Homepage | ISR | 60 seconds |
| /projects | ISR | 60 seconds |
| /projects/[slug] | ISR | 60 seconds |
| /about | ISR | 60 seconds |
| /contact | SSR | N/A (form needs CSRF) |
| /admin/* | SSR | N/A (dynamic, auth-gated) |

On-demand revalidation is triggered via tRPC mutation hooks after content changes, so the 60-second window is a fallback — content typically updates within seconds.

### 3. Authentication Flow

NextAuth.js v5 with the Credentials provider. Single-user model:
- No sign-up route exposed
- Owner account seeded via CLI script or migration
- Sessions stored in JWT (stateless, no session table needed)
- Middleware protects `/admin/*` routes
- CSRF token embedded in all forms via NextAuth's built-in protection

### 4. File Upload Flow

```
Owner → CMS Upload Form → /api/upload (validates type + size)
  → Upload Service → Cloudflare R2 (PutObject)
  → Returns public URL → Stored in DB record
```

Image optimization handled by Next.js `<Image>` component with R2 as a remote image source in `next.config.js`. Multiple sizes generated on-demand by Vercel's image optimization layer.

### 5. Contact Form Flow

```
Visitor → Contact Form (client validation via Zod)
  → /api/contact (server validation + rate limit)
  → Email Service → Resend API → Owner's email
  → Success/Error response to Visitor
```

Rate limiting: Token bucket per IP, 3 submissions per hour.

### 6. Drag-and-Drop Reorder

Uses `@dnd-kit/core` and `@dnd-kit/sortable` for accessible drag-and-drop. On drop, the client sends the full new ordering as an array of `{id, displayOrder}` pairs to the `reorder` mutation, which performs a batch update in a transaction.

### 7. Input Validation Strategy

All inputs validated twice:
1. **Client-side**: Zod schemas in React Hook Form for instant feedback
2. **Server-side**: Same Zod schemas in tRPC procedure input validation

Shared schema definitions in `src/lib/validators/` imported by both layers.

### 8. Security Headers

Configured via `next.config.js` headers:
- `Content-Security-Policy`: strict, script-src self + nonces for inline
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

## Error Handling

### API Layer (tRPC)

- **Validation errors**: tRPC input validation via Zod returns structured field-level errors (HTTP 400). Client components display these inline.
- **Authentication errors**: Unauthenticated requests to protected procedures throw `UNAUTHORIZED` (HTTP 401). The client redirects to login.
- **Not found errors**: Queries for non-existent resources throw `NOT_FOUND` (HTTP 404). Public pages render a 404 page; CMS shows a toast notification.
- **Conflict errors**: Unique constraint violations (e.g., duplicate slug) throw `CONFLICT` (HTTP 409) with a user-friendly message.
- **Internal errors**: Unhandled exceptions are caught by a global tRPC error formatter that logs the full error server-side and returns a generic message to the client.

### Service Layer

- **Database errors**: Caught and mapped to appropriate tRPC errors. Connection failures trigger retry with exponential backoff (max 3 attempts).
- **File storage errors**: Upload failures return a descriptive error to the CMS. Partial uploads are cleaned up automatically.
- **Email delivery errors**: Contact form submissions that fail to deliver inform the Visitor with an alternative contact method. Failures are logged for Owner review.

### UI Layer

- **React Error Boundaries**: Wrap major page sections to prevent full-page crashes. Fallback UI displays a friendly message with a retry action.
- **Form errors**: React Hook Form + Zod provide instant client-side validation. Server errors are caught and mapped back to form field errors where possible.
- **Network errors**: tRPC client handles network failures with retry logic and user-facing toast notifications for persistent failures.
- **404 pages**: Custom 404 page for public routes with navigation back to the homepage.

### Rate Limiting

- Contact form endpoint: Token bucket per IP, 3 submissions per hour. Exceeding the limit returns HTTP 429 with a Retry-After header.
- File uploads: 10 uploads per hour per session. Exceeding the limit returns HTTP 429.

### Logging and Monitoring

- All server-side errors are logged with request context (route, method, user ID if authenticated, timestamp).
- Critical errors (database failures, auth system errors) trigger alerts via the deployment platform's monitoring.

## Testing Strategy

### Overview

The application uses a dual testing approach combining example-based unit tests for specific scenarios and property-based tests for universal invariants. This ensures both concrete correctness and general behavioral guarantees.

### Testing Framework

- **Unit/Integration Tests**: Vitest (fast, TypeScript-native, compatible with Next.js)
- **Property-Based Tests**: fast-check (integrated with Vitest)
- **E2E Tests**: Playwright (browser-based, covers full user flows)
- **Component Tests**: React Testing Library (accessible queries, user-centric)

### Test Layers

| Layer | Tool | Focus |
|-------|------|-------|
| Data validators (Zod schemas) | Vitest + fast-check | Property tests: round-trip, invalid input rejection |
| Service functions | Vitest (mocked DB) | Business logic, state transitions, edge cases |
| tRPC routers | Vitest (integration) | Auth enforcement, input validation, response shapes |
| React components | React Testing Library | Rendering, accessibility, interaction |
| Full flows | Playwright | Auth flow, CRUD operations, public navigation |

### Property-Based Testing Configuration

- Library: `fast-check`
- Minimum iterations per property: 100
- Each property test is tagged with a comment referencing the design property
- Tag format: **Feature: portfolio-web-app, Property {number}: {property_text}**

### Unit Test Coverage Targets

- Service layer: 90%+ line coverage
- Validators: 100% schema coverage (valid and invalid inputs)
- tRPC routers: All procedures tested for auth, validation, and happy path

### E2E Test Scenarios

- Owner login → create project → publish → verify public visibility
- Owner upload resume → verify download button appears on public site
- Visitor submit contact form → verify rate limiting
- Theme toggle → verify no layout shift
- Category filter → verify correct project filtering

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Project Slug Uniqueness
FOR ALL Project creation and update operations, THE ORM SHALL enforce that no two Projects share the same slug value, returning a constraint violation error on conflict.

**Validates: Requirements 15.2**

### Property 2: Display Order Consistency  
FOR ALL reorder operations on Projects, Social_Links, Experiences, or Certifications, THE service layer SHALL produce a valid permutation where each item has a unique display_order value with no gaps, and the total count of items remains unchanged after reordering.

**Validates: Requirements 2.6, 5.3, 18.4, 19.4**

### Property 3: Authentication Gate Invariant
FOR ALL HTTP requests to /admin/* routes, THE Auth_System SHALL either have a valid session present (allowing access) or redirect to login — no CMS route is accessible without authentication.

**Validates: Requirements 1.5**

### Property 4: Draft Visibility Invariant
FOR ALL public queries, THE API_Layer SHALL return only Projects with status 'published' and only Experience and Certification entries with is_visible set to true — no draft Project or hidden entry is ever visible on the Public_Site.

**Validates: Requirements 2.4, 2.5, 3.4, 18.5, 19.5**

### Property 5: Active Resume Singleton
FOR ALL states of the Resume table, at most one Resume record SHALL have is_active set to true at any given time.

**Validates: Requirements 6.2**

### Property 6: Input Validation Round-Trip
FOR ALL valid inputs accepted by client-side Zod schemas, THE server-side validation using the same schema SHALL also accept the input (consistency between client and server validation).

**Validates: Requirements 2.7, 8.4, 18.8, 19.8**

### Property 7: Theme Application Without Layout Shift
FOR ALL theme changes (accent color or light/dark mode), THE Theme_System SHALL apply changes via CSS custom property updates that do not trigger document reflow or cause Cumulative Layout Shift.

**Validates: Requirements 7.1, 7.5**

### Property 8: File Upload Type Safety
FOR ALL file upload requests, THE Validation_Layer SHALL reject files whose detected MIME type does not match the allowed set (application/pdf for resumes, image/jpeg|image/png|image/webp for images), regardless of file extension.

**Validates: Requirements 12.5, 14.4**

### Property 9: XSS Prevention on Rich Text
FOR ALL rich text content stored via the CMS, THE sanitization layer SHALL ensure that rendering the content produces no executable script elements or event handlers in the resulting HTML.

**Validates: Requirements 4.5, 12.1**

### Property 10: Sitemap Completeness
FOR ALL published Projects, THE sitemap.xml generator SHALL include a corresponding URL entry, and FOR ALL draft Projects, THE generator SHALL exclude them.

**Validates: Requirements 9.3, 9.4**

### Property 11: Date Range Invariant
FOR ALL Experience entries where end_date is provided, THE Validation_Layer SHALL reject the entry if start_date is after end_date. FOR ALL Certification entries where expiry_date is provided, THE Validation_Layer SHALL reject the entry if expiry_date is before issue_date.

**Validates: Requirements 18.9, 19.9**

### Property 12: Experience Chronological Display Order
FOR ALL public queries of visible Experience entries, THE API_Layer SHALL return entries sorted in reverse chronological order by start_date (most recent first), regardless of display_order values.

**Validates: Requirements 18.6**

### Property 13: Current Position Display
FOR ALL Experience entries where end_date is null, THE Public_Site rendering layer SHALL display "Present" as the end date text in the timeline view.

**Validates: Requirements 18.7**

### Property 14: Credential URL Rendering
FOR ALL visible Certification entries that have a non-null credential_url, THE Public_Site rendering layer SHALL output an anchor element containing that URL with target="_blank" and rel="noopener noreferrer" attributes.

**Validates: Requirements 19.7**
