# Future Integrations Guide

This document provides detailed instructions for implementing the future features that are stubbed in the codebase. Each section covers the required dependencies, configuration, and code changes.

---

## 1. RAG Chatbot (`/api/chat`)

An AI-powered portfolio assistant that can answer questions about your projects, experience, and skills using Retrieval-Augmented Generation (RAG).

### Architecture Overview

```
Visitor Question → /api/chat route → Embed query → Vector DB similarity search
  → Retrieve relevant content → LLM generates answer with context → Response
```

### Step 1: Choose and Set Up a Vector Database

#### Option A: Pinecone (Managed, serverless-friendly)

```bash
npm install @pinecone-database/pinecone
```

Add to `.env`:

```env
PINECONE_API_KEY=your-api-key
PINECONE_INDEX=portfolio-embeddings
PINECONE_ENVIRONMENT=us-east-1-aws
```

Create the index in Pinecone dashboard with dimension `1536` (for OpenAI `text-embedding-3-small`) and cosine similarity metric.

#### Option B: Weaviate (Self-hosted or cloud)

```bash
npm install weaviate-ts-client
```

Add to `.env`:

```env
WEAVIATE_URL=https://your-cluster.weaviate.network
WEAVIATE_API_KEY=your-api-key
```

#### Option C: pgvector (PostgreSQL extension — no extra service)

Since the project already uses PostgreSQL (Neon), pgvector avoids adding a new service. Neon supports pgvector natively.

```bash
npm install pgvector
```

Add a migration to enable the extension and create an embeddings table:

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  source_type VARCHAR(50) NOT NULL,  -- 'project', 'experience', 'about', etc.
  source_id UUID,
  embedding VECTOR(1536) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ON embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

### Step 2: Generate Embeddings

#### Using OpenAI Embeddings

```bash
npm install openai
```

Add to `.env`:

```env
OPENAI_API_KEY=your-api-key
```

Create an embedding service at `src/server/services/embedding.service.ts`:

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}
```

#### Using Cohere Embeddings (alternative)

```bash
npm install cohere-ai
```

```env
COHERE_API_KEY=your-api-key
```

### Step 3: Index Content

Create a script at `scripts/index-embeddings.ts` that:

1. Fetches all published projects, experiences, certifications, and about content
2. Chunks long content into ~500-token segments
3. Generates embeddings for each chunk
4. Stores them in your chosen vector DB with metadata (source_type, source_id)

Run this script after content changes or on a schedule.

### Step 4: Update the `/api/chat` Route Handler

Replace the stub at `src/app/api/chat/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding } from '@/server/services/embedding.service';
// Import your vector DB client

export async function POST(request: NextRequest) {
  const { message } = await request.json();

  // 1. Generate embedding for the user's question
  const queryEmbedding = await generateEmbedding(message);

  // 2. Search vector DB for relevant content
  const results = await vectorSearch(queryEmbedding, { topK: 5 });

  // 3. Build context from retrieved documents
  const context = results.map(r => r.content).join('\n\n');

  // 4. Generate response using LLM with context
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: `You are a portfolio assistant. Answer based on this context:\n\n${context}` },
      { role: 'user', content: message },
    ],
    max_tokens: 500,
  });

  return NextResponse.json({ reply: response.choices[0].message.content });
}
```

### Step 5: Frontend Chat Widget

Create `src/components/public/chat-widget.tsx`:

- Floating button in bottom-right corner
- Expandable chat panel with message history
- Streaming responses (optional, using `ReadableStream`)
- Rate limiting on the client side (debounce rapid sends)

Suggested libraries:
- `ai` (Vercel AI SDK) for streaming chat UI patterns
- `framer-motion` for smooth expand/collapse animation

### Environment Variables Summary

```env
# Vector DB (choose one)
PINECONE_API_KEY=
PINECONE_INDEX=
PINECONE_ENVIRONMENT=

# OR
WEAVIATE_URL=
WEAVIATE_API_KEY=

# Embeddings + LLM
OPENAI_API_KEY=
```

---

## 2. Analytics Provider

The root layout includes a placeholder `<Analytics />` component at `src/components/analytics.tsx`. Update this component to integrate your preferred analytics provider.

### Option A: Vercel Analytics (Simplest)

Zero-config analytics for Vercel-deployed apps.

```bash
npm install @vercel/analytics @vercel/speed-insights
```

Update `src/components/analytics.tsx`:

```typescript
'use client';

import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export function Analytics() {
  return (
    <>
      <VercelAnalytics />
      <SpeedInsights />
    </>
  );
}
```

No environment variables needed — Vercel injects the required configuration automatically.

### Option B: Google Analytics 4

```bash
npm install @next/third-parties
```

Add to `.env`:

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Update `src/components/analytics.tsx`:

```typescript
'use client';

import { GoogleAnalytics } from '@next/third-parties/google';

export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!gaId) return null;

  return <GoogleAnalytics gaId={gaId} />;
}
```

### Option C: Plausible (Privacy-focused, no cookies)

```bash
npm install next-plausible
```

Add to `.env`:

```env
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=yourdomain.com
```

Update `src/components/analytics.tsx`:

```typescript
'use client';

import PlausibleProvider from 'next-plausible';

export function Analytics() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return null;

  return <PlausibleProvider domain={domain} />;
}
```

### Option D: Fathom (Privacy-focused, simple)

```bash
npm install fathom-client
```

Add to `.env`:

```env
NEXT_PUBLIC_FATHOM_SITE_ID=XXXXXXXX
```

Update `src/components/analytics.tsx`:

```typescript
'use client';

import { useEffect } from 'react';
import { load, trackPageview } from 'fathom-client';
import { usePathname } from 'next/navigation';

export function Analytics() {
  const pathname = usePathname();
  const siteId = process.env.NEXT_PUBLIC_FATHOM_SITE_ID;

  useEffect(() => {
    if (!siteId) return;
    load(siteId, { auto: false });
  }, [siteId]);

  useEffect(() => {
    if (!siteId) return;
    trackPageview();
  }, [pathname, siteId]);

  return null;
}
```

### Choosing a Provider

| Provider | Privacy | Setup | Cost | Best For |
|----------|---------|-------|------|----------|
| Vercel Analytics | Good | Zero-config | Free tier, then paid | Vercel-deployed sites |
| Google Analytics 4 | Low (cookies) | Moderate | Free | Detailed behavior analysis |
| Plausible | High (no cookies) | Easy | Paid (self-host free) | GDPR compliance, simplicity |
| Fathom | High (no cookies) | Easy | Paid | Privacy-first, clean dashboard |

---

## 3. Blog / Writing Section CMS

The database schema for `posts` is already defined in `src/server/db/schema/`. This section covers building the full blog feature on top of that foundation.

### Step 1: Create the tRPC Router

Create `src/server/api/routers/posts.ts`:

```typescript
import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import { postService } from '@/server/services/post.service';

export const postsRouter = createTRPCRouter({
  listPublished: publicProcedure.query(() => postService.listPublished()),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ input }) => postService.getBySlug(input.slug)),

  listAll: protectedProcedure.query(() => postService.listAll()),

  create: protectedProcedure
    .input(postCreateSchema)
    .mutation(({ input }) => postService.create(input)),

  update: protectedProcedure
    .input(postUpdateSchema)
    .mutation(({ input }) => postService.update(input.id, input)),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(({ input }) => postService.delete(input.id)),

  publish: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(({ input }) => postService.publish(input.id)),
});
```

Register it in `src/server/api/root.ts`:

```typescript
import { postsRouter } from './routers/posts';

export const appRouter = createTRPCRouter({
  // ...existing routers
  posts: postsRouter,
});
```

### Step 2: Create the Post Service

Create `src/server/services/post.service.ts` following the same pattern as `project.service.ts`:

- `listPublished()` — published posts sorted by `publishedAt` descending
- `getBySlug(slug)` — single post lookup (only published unless admin)
- `listAll()` — all posts for admin, sorted by `createdAt`
- `create(data)` — create with auto-generated slug
- `update(id, data)` — update content, title, slug
- `publish(id)` — set status to 'published' and `publishedAt` to now
- `delete(id)` — remove post

### Step 3: Add Admin Pages

Create `src/app/admin/posts/page.tsx`:

- Table listing all posts with title, status, published date, actions
- Create/Edit form with title, slug (auto-generated), content editor
- Publish/Unpublish toggle
- Delete with confirmation

### Step 4: MDX Support for Content

```bash
npm install @next/mdx @mdx-js/loader @mdx-js/react rehype-highlight remark-gfm
```

Add MDX rendering to the public post pages. Store raw MDX in the `content` column and render at display time:

```typescript
import { compileMDX } from 'next-mdx-remote/rsc';

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  const { content } = await compileMDX({
    source: post.content,
    options: { mdxOptions: { rehypePlugins: [rehypeHighlight], remarkPlugins: [remarkGfm] } },
  });

  return <article className="prose dark:prose-invert max-w-none">{content}</article>;
}
```

### Step 5: Create Public Writing Pages

- `src/app/(public)/writing/page.tsx` — Blog listing with title, date, excerpt
- `src/app/(public)/writing/[slug]/page.tsx` — Full post view with MDX rendering
- Add `generateMetadata` for SEO on each page
- Add `generateStaticParams` for ISR

### Step 6: Update Navigation

Enable the "Writing" link in the public navigation (currently disabled/hidden). Add the route to `sitemap.ts` generation.

### File Structure After Implementation

```
src/
├── app/
│   ├── (public)/writing/
│   │   ├── page.tsx              # Blog listing
│   │   └── [slug]/page.tsx       # Post detail (MDX rendered)
│   └── admin/posts/
│       └── page.tsx              # Post management CRUD
├── server/
│   ├── api/routers/posts.ts      # tRPC router
│   └── services/post.service.ts  # Business logic
└── lib/validators/post.ts        # Zod schemas
```

---

## 4. Newsletter (`/api/subscribe`)

Email subscription with form on the public site and delivery via a third-party provider.

### Step 1: Choose a Provider

#### Option A: Buttondown (Simple, developer-friendly)

```bash
npm install # No SDK needed — uses REST API
```

```env
BUTTONDOWN_API_KEY=your-api-key
```

#### Option B: ConvertKit (Creator-focused)

```bash
npm install # REST API, no SDK needed
```

```env
CONVERTKIT_API_KEY=your-api-key
CONVERTKIT_FORM_ID=your-form-id
```

#### Option C: Mailchimp (Full-featured)

```bash
npm install @mailchimp/mailchimp_marketing
```

```env
MAILCHIMP_API_KEY=your-api-key
MAILCHIMP_SERVER_PREFIX=us1
MAILCHIMP_LIST_ID=your-list-id
```

### Step 2: Update the `/api/subscribe` Route

Replace the stub at `src/app/api/subscribe/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const subscribeSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = subscribeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  }

  const { email } = parsed.data;

  // Example: Buttondown
  const response = await fetch('https://api.buttondown.email/v1/subscribers', {
    method: 'POST',
    headers: {
      Authorization: `Token ${process.env.BUTTONDOWN_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, type: 'regular' }),
  });

  if (!response.ok) {
    const error = await response.json();
    if (error.code === 'email_already_exists') {
      return NextResponse.json({ message: 'Already subscribed' }, { status: 200 });
    }
    return NextResponse.json({ error: 'Subscription failed' }, { status: 500 });
  }

  // Optionally store in local subscribers table for tracking
  // await db.insert(subscribers).values({ email });

  return NextResponse.json({ message: 'Subscribed successfully' }, { status: 201 });
}
```

### Step 3: Add Subscribe Form Component

Create `src/components/public/subscribe-form.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');

    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    setStatus(res.ok ? 'success' : 'error');
    if (res.ok) setEmail('');
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-md">
      <Input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        aria-label="Email address for newsletter"
      />
      <Button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
      </Button>
      {status === 'success' && <p className="text-sm text-green-600">Subscribed!</p>}
      {status === 'error' && <p className="text-sm text-red-600">Something went wrong.</p>}
    </form>
  );
}
```

### Step 4: Place the Form

Add the `<SubscribeForm />` component to:
- The homepage footer area
- The blog listing page (when blog is implemented)
- A dedicated newsletter page (optional)

### Choosing a Provider

| Provider | Free Tier | API Quality | Best For |
|----------|-----------|-------------|----------|
| Buttondown | 100 subscribers | Excellent REST API | Developers, simplicity |
| ConvertKit | 1,000 subscribers | Good REST API | Creators, automation |
| Mailchimp | 500 subscribers | Complex but powerful | Large lists, templates |

---

## General Notes

### Feature Flags

Consider adding feature flags to `src/config/site.ts` to progressively enable features:

```typescript
export const features = {
  chatbot: process.env.NEXT_PUBLIC_FEATURE_CHAT === 'true',
  blog: process.env.NEXT_PUBLIC_FEATURE_BLOG === 'true',
  newsletter: process.env.NEXT_PUBLIC_FEATURE_NEWSLETTER === 'true',
  analytics: process.env.NEXT_PUBLIC_FEATURE_ANALYTICS === 'true',
};
```

### Database Migrations

All future features that extend the schema (posts, subscribers) already have stub tables created. When implementing, you may need to add columns or indexes — generate a new migration:

```bash
npm run db:generate
npm run db:migrate
```

### Testing

Each integration should include:
- Unit tests for the service layer (mock external APIs)
- Integration tests for the API routes
- E2E tests for critical user flows (subscribe, chat)
