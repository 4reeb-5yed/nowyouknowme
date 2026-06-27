# Deployment Guide

This project is designed for zero-config deployment on [Vercel](https://vercel.com). Next.js is auto-detected — no `vercel.json` configuration file is required for standard deployments.

## Prerequisites

- A Vercel account (free tier works for personal portfolios)
- A PostgreSQL database (recommended: [Neon](https://neon.tech) for serverless compatibility)
- A Cloudflare R2 bucket for file storage
- A [Resend](https://resend.com) account for email delivery

## Connecting the Repository

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository (GitHub, GitLab, or Bitbucket)
3. Vercel will auto-detect the Next.js framework — no build settings override needed
4. Configure environment variables (see below)
5. Click "Deploy"

After initial deployment, every push to `main` triggers an automatic production build. Pull requests and branches get preview deployments automatically.

## Build Settings

Vercel auto-detects these settings for Next.js projects:

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Build Command | `next build` (from `npm run build`) |
| Output Directory | `.next` |
| Install Command | `npm install` |
| Node.js Version | 20.x (recommended) |

No manual override is needed. If you need to adjust, do so in the Vercel dashboard under Project Settings > General.

## Required Environment Variables

Set these in the Vercel dashboard under **Project Settings > Environment Variables**.

### Database

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string (with SSL) | `postgresql://user:pass@host/db?sslmode=require` |

### Authentication

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXTAUTH_SECRET` | Random string for JWT signing. Generate with `openssl rand -base64 32` | `K7gN...` |
| `NEXTAUTH_URL` | Full production URL (required in production) | `https://yourdomain.com` |

### Cloudflare R2 (File Storage)

| Variable | Description | Example |
|----------|-------------|---------|
| `R2_ACCOUNT_ID` | Cloudflare account ID | `abc123...` |
| `R2_ACCESS_KEY_ID` | R2 API token access key | `...` |
| `R2_SECRET_ACCESS_KEY` | R2 API token secret key | `...` |
| `R2_BUCKET_NAME` | Name of your R2 bucket | `portfolio-uploads` |
| `R2_PUBLIC_URL` | Public URL for the R2 bucket (custom domain or r2.dev) | `https://cdn.yourdomain.com` |

### Email (Resend)

| Variable | Description | Example |
|----------|-------------|---------|
| `RESEND_API_KEY` | Resend API key for sending contact form emails | `re_...` |
| `CONTACT_EMAIL` | Email address to receive contact form submissions | `you@example.com` |

### Client-Side

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Public-facing app URL | `https://yourdomain.com` |

### Environment Scoping

In Vercel, you can scope variables to specific environments:

- **Production**: Set all variables with production values
- **Preview**: Use a separate database branch (Neon supports this) or the same DB
- **Development**: Not needed — use your local `.env` file

## Custom Domain Setup

1. Go to **Project Settings > Domains** in the Vercel dashboard
2. Add your custom domain (e.g., `yourdomain.com`)
3. Vercel provides DNS records to configure:
   - For apex domains: Add an `A` record pointing to `76.76.21.21`
   - For subdomains: Add a `CNAME` record pointing to `cname.vercel-dns.com`
4. Vercel automatically provisions an SSL certificate via Let's Encrypt
5. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to match your custom domain

### Redirect Configuration

Vercel automatically handles `www` to non-`www` (or vice versa) redirects. Configure your preference in Project Settings > Domains.

## Preview Deployments

Every push to a non-production branch creates a preview deployment:

- Preview URLs follow the pattern: `project-git-branch-name.vercel.app`
- Pull requests get automatic comments with the preview URL
- Preview deployments use the "Preview" environment variables
- Useful for testing changes before merging to `main`

## Production Branch

By default, `main` is the production branch. Change this in **Project Settings > Git > Production Branch** if needed.

## Database Migrations

Run database migrations before or after deployment:

```bash
# Generate migrations from schema changes
npm run db:generate

# Push schema directly (development)
npm run db:push

# Run migrations (production)
npm run db:migrate
```

For production, consider running migrations as part of your CI/CD pipeline or manually before deploying schema-breaking changes.

## Seeding the Database

After first deployment, seed the owner account:

```bash
# Set DATABASE_URL to your production database
DATABASE_URL="your-production-url" npm run db:seed
```

Or run it locally with the production DATABASE_URL.

## Troubleshooting

### Build Failures

- Check that all required environment variables are set in Vercel
- Verify `DATABASE_URL` is accessible from Vercel's build environment
- Review build logs in the Vercel dashboard under Deployments

### Environment Variable Issues

- `NEXTAUTH_URL` must include the protocol (`https://`)
- `R2_PUBLIC_URL` must be a valid URL (used for image remote patterns)
- All required variables are validated at startup — check Vercel function logs for specific errors

### Function Timeout

Vercel's default function timeout is 10 seconds (hobby) or 60 seconds (pro). If operations like file uploads time out, consider upgrading your plan or optimizing the upload flow.

## Vercel Configuration File

This project does **not** require a `vercel.json` file. Next.js is auto-detected by Vercel, and all configuration (headers, redirects, rewrites) is handled in `next.config.ts`.

If you need to customize Vercel-specific behavior (e.g., regions, function settings), create a `vercel.json` at the project root:

```json
{
  "regions": ["iad1"],
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

However, this is optional and not needed for standard operation.
