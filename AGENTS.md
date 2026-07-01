<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:codebase-context -->
# NowYouKnowMe - Portfolio CMS Application

## Project Overview

A full-stack portfolio web application with a built-in CMS dashboard built with:
- **Next.js 16** (App Router with Turbopack)
- **tRPC v11** for type-safe APIs
- **Drizzle ORM** with PostgreSQL
- **NextAuth.js v5** for authentication
- **Tailwind CSS + shadcn/ui** for styling
- **Cloudflare R2** for file storage
- **Resend** for email delivery

## Key Architecture Patterns

### 1. Public Site Uses tRPC Client Components
- Public pages at `src/app/(public)/` use React Server Components with `createServerClient()`
- Individual components within pages are client components using tRPC hooks
- The public layout (`src/app/(public)/layout.tsx`) wraps content in `<TRPCProvider>`

### 2. API Router Structure
- **Public routers**: `projects.list`, `projects.getBySlug`, `projects.getFeatured`, `experience.listVisible`, `certifications.listVisible`, `pages.getSection`, `socialLinks.listVisible`, `siteConfig.get`, `resume.getActive`
- **Protected routers** (require auth): Full CRUD for all entities, plus `search`, `activityLog`, `revisions`

### 3. Database Schema Key Fields
- **Projects**: `id`, `title`, `slug`, `description`, `longDescription`, `techStack` (JSON), `category`, `githubUrl`, `liveUrl`, `thumbnailUrl`, `isFeatured`, `displayOrder`, `status`
- **Experiences**: `id`, `companyName`, `roleTitle`, `startDate`, `endDate`, `description`, `techStack`, `displayOrder`, `isVisible`
- **Sections**: `id`, `key` (e.g., 'about', 'skills'), `title`, `content`
- **SocialLinks**: `id`, `platform`, `url`, `displayOrder`, `isVisible`
- **SiteConfig**: `id`, `theme`, `accentColor`, `heroTagline`, `heroHeadline`, `heroEmphasisWord`, `heroSubhead`, `heroShowResume`, `showFeaturedProjects`, `showExperience`, `showSkills`, `showAbout`, `showContact`, `metaDescription`, `ogImageUrl`, `footerCopyright`, `footerTagline`, `sectionOrder`

### 4. Service Layer Pattern
All business logic lives in services at `src/server/services/`:
- Each entity has a corresponding service class
- Services handle validation, database operations, revision creation, and activity logging
- tRPC routers delegate to services (routers shouldn't contain business logic)

### 5. Authentication Flow
- NextAuth v5 with credentials provider
- Single admin user (owner)
- JWT sessions with httpOnly cookies
- Middleware protects all `/admin/*` routes
- tRPC uses `protectedProcedure` for admin-only operations

### 6. File Upload Flow
- Files uploaded to `/api/upload` endpoint
- Validated (magic bytes, size), uploaded to R2
- Metadata stored in `resumes` table
- Served via R2 public URL with `Cache-Control: public, max-age=31536000, immutable`

## Important File Locations

| Purpose | Path |
|---------|------|
| tRPC Client | `src/lib/trpc/client.ts` |
| tRPC Server | `src/lib/trpc/server.ts` |
| tRPC Provider | `src/lib/trpc/provider.tsx` |
| Root Router | `src/server/api/root.ts` |
| tRPC Config | `src/server/api/trpc.ts` |
| Environment Config | `src/config/env.ts` |
| Auth Config | `src/lib/auth.ts` |
| Database Schema | `src/server/db/schema/` |
| Services | `src/server/services/` |
| Validators | `src/lib/validators/` |
| Admin Layout | `src/app/admin/layout.tsx` |
| Public Layout | `src/app/(public)/layout.tsx` |

## Common Tasks

### Adding a new tRPC router:
1. Create router in `src/server/api/routers/{entity}.ts`
2. Export procedures: `publicProcedure` for reads, `protectedProcedure` for writes
3. Import and register in `src/server/api/root.ts`

### Adding a new service:
1. Create `src/server/services/{entity}.service.ts`
2. Export class with CRUD methods
3. Import in router and delegate operations

### Modifying public components:
- Components in `src/components/public/` are client components
- Use `trpc.{router}.{procedure}.useQuery()` for data fetching
- Use `trpc.{router}.{procedure}.useMutation()` for mutations
- Call `utils.{router}.{procedure}.invalidate()` after mutations

### Environment Variables:
- All server-side variables validated at startup in `src/config/env.ts`
- Required: `DATABASE_URL`, `NEXTAUTH_SECRET`, R2 variables, `RESEND_API_KEY`, `CONTACT_EMAIL`
- Client-side: `NEXT_PUBLIC_APP_URL`

## Documentation

- README.md - Full project documentation
- docs/architecture.md - Deep dive into architecture patterns
- docs/deployment.md - Vercel deployment guide
- docs/r2-configuration.md - Cloudflare R2 setup
- docs/performance.md - Core Web Vitals optimization
- docs/lighthouse-audit.md - Performance audit checklist
- docs/future-integrations.md - RAG chatbot, blog, analytics guides
<!-- END:codebase-context -->
