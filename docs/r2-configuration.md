# Cloudflare R2 Bucket Configuration

This document describes the required configuration for the Cloudflare R2 bucket used by the portfolio application for file storage (project thumbnails, resume PDFs, and other uploaded assets).

## Overview

The application uses Cloudflare R2 (S3-compatible object storage) to store uploaded files. Files are served directly from R2 via a public URL, with appropriate CORS and caching policies to ensure fast, secure delivery.

## Environment Variables

The following environment variables are required for R2 integration. Set them in your `.env` file (see `.env.example`):

| Variable | Description | Example |
|----------|-------------|---------|
| `R2_ACCOUNT_ID` | Your Cloudflare account ID | `a1b2c3d4e5f6...` |
| `R2_ACCESS_KEY_ID` | R2 API token access key ID | `abc123def456...` |
| `R2_SECRET_ACCESS_KEY` | R2 API token secret access key | `secret-key-value` |
| `R2_BUCKET_NAME` | Name of the R2 bucket | `portfolio-uploads` |
| `R2_PUBLIC_URL` | Public URL for serving files (custom domain or r2.dev URL) | `https://cdn.yourdomain.com` |

### Generating R2 API Tokens

1. Go to Cloudflare Dashboard → R2 → Manage R2 API Tokens
2. Create a new API token with **Object Read & Write** permissions
3. Scope the token to the specific bucket used by the application
4. Copy the Access Key ID and Secret Access Key into your environment

## Bucket Setup

### 1. Create the Bucket

```bash
# Via Wrangler CLI
npx wrangler r2 bucket create portfolio-uploads

# Or via Cloudflare Dashboard: R2 → Create bucket
```

### 2. Enable Public Access

Public access is required so uploaded files can be served directly to site visitors without going through the application server.

**Option A: R2.dev subdomain (development/staging)**
1. Go to Cloudflare Dashboard → R2 → your bucket → Settings
2. Under "Public access", enable the `r2.dev` subdomain
3. Use the generated URL as `R2_PUBLIC_URL` (e.g., `https://pub-abc123.r2.dev`)

**Option B: Custom domain (production, recommended)**
1. Go to Cloudflare Dashboard → R2 → your bucket → Settings
2. Under "Public access" → "Custom Domains", add your domain (e.g., `cdn.yourdomain.com`)
3. Ensure the domain is proxied through Cloudflare (orange cloud)
4. Use `https://cdn.yourdomain.com` as `R2_PUBLIC_URL`

Using a custom domain enables Cloudflare's CDN caching layer automatically.

## CORS Configuration

CORS must be configured on the R2 bucket to allow the application to upload files from the browser (if client-side uploads are used in the future) and to allow the public site to load assets.

### Required CORS Rules

Apply this configuration via Cloudflare Dashboard → R2 → your bucket → Settings → CORS Policy:

```json
[
  {
    "AllowedOrigins": [
      "https://yourdomain.com",
      "https://www.yourdomain.com",
      "http://localhost:3000"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "HEAD"
    ],
    "AllowedHeaders": [
      "Content-Type",
      "Content-Length",
      "x-amz-content-sha256",
      "x-amz-date",
      "Authorization"
    ],
    "ExposeHeaders": [
      "ETag",
      "Content-Length",
      "Content-Type"
    ],
    "MaxAgeSeconds": 86400
  }
]
```

### CORS Rules Explained

| Field | Value | Rationale |
|-------|-------|-----------|
| `AllowedOrigins` | App domains + localhost | Restricts access to your application's origins only |
| `AllowedMethods` | GET, PUT, HEAD | GET for serving files, PUT for uploads, HEAD for preflight/existence checks |
| `AllowedHeaders` | Content-Type, auth headers | Required headers for S3-compatible upload requests |
| `ExposeHeaders` | ETag, Content-Length, Content-Type | Allows the browser to read these response headers |
| `MaxAgeSeconds` | 86400 (24 hours) | Caches preflight responses to reduce OPTIONS requests |

> **Note:** Replace `https://yourdomain.com` with your actual production domain. Remove `http://localhost:3000` in production-only configurations.

## Caching Policies

### Cache-Control Headers for Uploaded Assets

Uploaded files use UUID-based keys (e.g., `resumes/a1b2c3d4-filename.pdf`), making them effectively immutable — when a file is replaced, a new key is generated. This allows aggressive caching.

**Set the following Cache-Control rule on the bucket:**

| Rule | Pattern | Cache-Control Header |
|------|---------|---------------------|
| All uploaded assets | `*` | `public, max-age=31536000, immutable` |

### Applying Cache-Control via Cloudflare Dashboard

1. Go to Cloudflare Dashboard → R2 → your bucket → Settings
2. Under lifecycle/caching rules, or via the Cloudflare Cache Rules for the custom domain:
   - Match: All objects in the bucket
   - Cache-Control: `public, max-age=31536000, immutable`

### Applying Cache-Control via Upload (Application-Level)

The upload service can also set `Cache-Control` per-object at upload time. To enable this, the `PutObjectCommand` in `src/server/services/upload.service.ts` includes:

```typescript
const command = new PutObjectCommand({
  Bucket: serverEnv.R2_BUCKET_NAME,
  Key: key,
  Body: file,
  ContentType: options.contentType,
  CacheControl: "public, max-age=31536000, immutable",
});
```

This ensures each uploaded object carries the correct cache headers regardless of bucket-level configuration.

### CDN Caching (Custom Domain)

When using a custom domain proxied through Cloudflare:

- Cloudflare's CDN automatically caches objects based on the `Cache-Control` header
- First request hits R2, subsequent requests are served from Cloudflare's edge cache
- Cache is purged automatically when objects are deleted/replaced (new key = new cache entry)

### Cache-Control Summary

| Asset Type | Cache-Control | Rationale |
|-----------|--------------|-----------|
| Uploaded images | `public, max-age=31536000, immutable` | UUID-keyed, never change at same URL |
| Uploaded PDFs (resumes) | `public, max-age=31536000, immutable` | UUID-keyed, new upload = new URL |
| Temporary/private files | `private, no-cache` | If any private access is added in future |

## Bucket Lifecycle Rules (Optional)

For cost optimization, consider adding lifecycle rules to clean up orphaned files:

1. **Incomplete multipart uploads**: Auto-abort after 1 day
2. **Deleted object cleanup**: Objects are immediately deleted (R2 doesn't charge for delete operations)

## Security Considerations

1. **API Token Scope**: The R2 API token should be scoped to only the specific bucket, not the entire account
2. **Write Access**: Only the application server has write access (via API token). Public access is read-only
3. **File Validation**: The upload service validates files by magic bytes, not just Content-Type headers, preventing MIME type spoofing
4. **Authentication**: The upload API route (`/api/upload`) requires authenticated sessions — only the site owner can upload files
5. **No Directory Listing**: R2 public access does not expose directory listings by default

## Applying the CORS Configuration

### Via Wrangler CLI

Save the CORS configuration to a file and apply it:

```bash
npx wrangler r2 bucket cors put portfolio-uploads --file docs/r2-cors.json
```

### Via Cloudflare Dashboard

1. Navigate to R2 → Buckets → your bucket → Settings
2. Scroll to "CORS Policy"
3. Click "Edit CORS Policy"
4. Paste the JSON configuration from `docs/r2-cors.json`
5. Save

## File Structure Reference

```
Bucket: portfolio-uploads
├── images/                    # Project thumbnails, OG images
│   └── {uuid}-{filename}.{ext}
└── resumes/                   # Resume PDF files
    └── {uuid}-{filename}.pdf
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS errors in browser console | Verify AllowedOrigins includes your app's origin (with protocol) |
| 403 on file access | Ensure public access is enabled on the bucket |
| Files not caching | Check Cache-Control header is set; verify custom domain is proxied (orange cloud) |
| Upload fails with credentials error | Verify R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY are correct and token has write permission |
| Images not loading in Next.js `<Image>` | Ensure R2_PUBLIC_URL hostname is in `next.config.ts` remotePatterns |
