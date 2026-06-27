# Implementation Plan: Portfolio Web App

## Overview

This updated implementation plan focuses on remaining gaps identified after the initial build. The core application (Next.js 14 App Router, tRPC, Drizzle ORM, PostgreSQL, NextAuth.js v5, Cloudflare R2, Tailwind + shadcn/ui) is functional. Remaining work covers: testing infrastructure and property-based tests, extracting inline admin components into reusable modules, adding missing admin UI components specified in the design, and final integration hardening.

## Tasks

- [x] 1. Set up testing infrastructure
  - [x] 1.1 Install Vitest, fast-check, @testing-library/react, and jsdom as dev dependencies with pinned versions
    - Install: vitest, @vitejs/plugin-react, fast-check, @testing-library/react, @testing-library/jest-dom, jsdom
    - Create vitest.config.ts with path aliases matching tsconfig, jsdom environment, and setup files
    - Add `"test": "vitest --run"` and `"test:watch": "vitest"` scripts to package.json
    - _Requirements: 16.3_

  - [x] 1.2 Create test setup file and shared test utilities
    - Create tests/setup.ts with @testing-library/jest-dom matchers
    - Create tests/utils/ with mock factories for DB records (project, experience, certification, etc.)
    - Create tests/utils/trpc-test-helpers.ts with helper to create test tRPC callers with mocked context
    - _Requirements: 16.1, 16.4_

- [x] 2. Validate and harden Zod validation schemas with property tests
  - [x] 2.1 Write unit tests for project validator schema
    - Test valid project creation input acceptance
    - Test slug regex enforcement (a-z, 0-9, hyphens only)
    - Test enum constraint on category field
    - Test required field rejection when missing
    - _Requirements: 2.7, 2.9_

  - [x] 2.2 Write property test for input validation round-trip (Property 6)
    - **Property 6: Input Validation Round-Trip**
    - Generate arbitrary valid inputs conforming to project schema, verify both client and server schemas accept them identically
    - **Validates: Requirements 2.7, 8.4, 18.8, 19.8**

  - [x] 2.3 Write unit tests for experience validator schema
    - Test valid experience creation acceptance
    - Test start_date must be before end_date when end_date is provided
    - Test null end_date is valid (current position)
    - _Requirements: 18.8, 18.9_

  - [x] 2.4 Write property test for date range invariant (Property 11)
    - **Property 11: Date Range Invariant**
    - Generate arbitrary date pairs, verify the validator rejects entries where start_date > end_date for Experience, and where expiry_date < issue_date for Certifications
    - **Validates: Requirements 18.9, 19.9**

  - [x] 2.5 Write unit tests for certification validator schema
    - Test valid certification creation acceptance
    - Test expiry_date must be after issue_date when expiry_date is provided
    - Test credential_url format validation
    - Test nullable fields (credential_id, credential_url, expiry_date)
    - _Requirements: 19.8, 19.9_

  - [x] 2.6 Write unit tests for contact form validator schema
    - Test valid submission acceptance
    - Test email format validation
    - Test required fields (name, email, message) rejection when missing
    - _Requirements: 8.2, 8.4_

- [x] 3. Checkpoint - Ensure all validation tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Service layer tests and property tests
  - [x] 4.1 Write unit tests for project service (create, update, delete, reorder)
    - Test project creation persists all fields correctly
    - Test slug uniqueness enforcement on create/update
    - Test status transitions (draft → published, published → draft)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 4.2 Write property test for project slug uniqueness (Property 1)
    - **Property 1: Project Slug Uniqueness**
    - Generate arbitrary slug strings, verify that creating two projects with the same slug always results in a constraint violation
    - **Validates: Requirements 15.2**

  - [x] 4.3 Write property test for display order consistency (Property 2)
    - **Property 2: Display Order Consistency**
    - Generate arbitrary permutations of items, verify that after reorder the result has unique display_order values with no gaps and unchanged item count
    - **Validates: Requirements 2.6, 5.3, 18.4, 19.4**

  - [x] 4.4 Write unit tests for experience service (create, update, delete, reorder, listVisible)
    - Test listVisible returns only is_visible=true entries
    - Test listVisible returns entries sorted most recent start_date first
    - Test reorder updates display_order for all affected entries
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6_

  - [x] 4.5 Write property test for draft visibility invariant (Property 4)
    - **Property 4: Draft Visibility Invariant**
    - Generate mixed sets of published/draft projects and visible/hidden experiences and certifications, verify public queries never return hidden items
    - **Validates: Requirements 2.4, 2.5, 3.4, 18.5, 19.5**

  - [x] 4.6 Write unit tests for certification service (create, update, delete, reorder, listVisible)
    - Test listVisible returns only is_visible=true entries in display_order
    - Test reorder updates display_order for all affected entries
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6_

  - [x] 4.7 Write unit tests for resume service (upload, setActive, deactivation logic)
    - Test uploading a new resume sets previous resumes to is_active=false
    - Test at most one resume is active at any time
    - _Requirements: 6.1, 6.2_

  - [x] 4.8 Write property test for active resume singleton (Property 5)
    - **Property 5: Active Resume Singleton**
    - Generate arbitrary sequences of resume uploads, verify that at all intermediate states at most one resume is active
    - **Validates: Requirements 6.2**

  - [x] 4.9 Write unit tests for upload service (MIME type validation, size limits)
    - Test acceptance of valid types: application/pdf, image/jpeg, image/png, image/webp
    - Test rejection of invalid MIME types regardless of file extension
    - Test rejection of files exceeding 10 MB
    - _Requirements: 12.5, 14.3, 14.4_

  - [x] 4.10 Write property test for file upload type safety (Property 8)
    - **Property 8: File Upload Type Safety**
    - Generate arbitrary MIME type strings, verify only the allowed set is accepted regardless of extension
    - **Validates: Requirements 12.5, 14.4**

  - [x] 4.11 Write unit tests for content service (sanitization of rich text)
    - Test that script tags are stripped from saved content
    - Test that event handler attributes (onclick, onerror) are removed
    - Test that safe HTML (p, strong, em, a) is preserved
    - _Requirements: 4.5, 12.1_

  - [x] 4.12 Write property test for XSS prevention on rich text (Property 9)
    - **Property 9: XSS Prevention on Rich Text**
    - Generate arbitrary HTML strings with script tags and event handlers, verify sanitized output contains no executable elements
    - **Validates: Requirements 4.5, 12.1**

- [ ] 5. Checkpoint - Ensure all service tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. tRPC router integration tests
  - [x] 6.1 Write integration tests for projects router (auth enforcement, input validation)
    - Test unauthenticated calls to protected procedures return UNAUTHORIZED
    - Test public procedures (list, getBySlug) work without auth
    - Test invalid input returns validation error
    - _Requirements: 1.5, 12.6_

  - [x] 6.2 Write property test for authentication gate invariant (Property 3)
    - **Property 3: Authentication Gate Invariant**
    - Generate arbitrary procedure names from protected routers, verify all reject unauthenticated calls
    - **Validates: Requirements 1.5**

  - [x] 6.3 Write integration tests for experience router (auth, CRUD, visibility filtering)
    - Test listVisible excludes hidden entries
    - Test create/update/delete require authentication
    - Test chronological sort order of listVisible results
    - _Requirements: 18.1, 18.5, 18.6_

  - [x] 6.4 Write property test for experience chronological display order (Property 12)
    - **Property 12: Experience Chronological Display Order**
    - Generate arbitrary sets of visible experiences with varied start_dates, verify listVisible always returns them in reverse chronological order
    - **Validates: Requirements 18.6**

  - [x] 6.5 Write integration tests for certifications router (auth, CRUD, visibility filtering)
    - Test listVisible excludes hidden entries and returns in display_order
    - Test create/update/delete require authentication
    - _Requirements: 19.1, 19.5, 19.6_

  - [x] 6.6 Write integration tests for site-config router
    - Test get returns current config for public access
    - Test update requires authentication
    - _Requirements: 7.1, 7.2_

  - [x] 6.7 Write integration tests for contact form API route (validation, rate limiting)
    - Test valid submissions are accepted
    - Test invalid submissions return field-level errors
    - Test rate limiting rejects after threshold exceeded
    - _Requirements: 8.1, 8.2, 8.5_

- [ ] 7. Checkpoint - Ensure all router tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Extract and refine admin components
  - [-] 8.1 Extract ExperienceTable and ExperienceForm into dedicated component files (src/components/admin/experience-table.tsx, src/components/admin/experience-form.tsx)
    - Move inline components from src/app/admin/experience/page.tsx into separate files
    - Ensure proper TypeScript interfaces for props
    - Import extracted components back into the page
    - _Requirements: 16.1, 16.2, 18.10_

  - [ ] 8.2 Extract CertificationTable and CertificationForm into dedicated component files (src/components/admin/certification-table.tsx, src/components/admin/certification-form.tsx)
    - Move inline components from src/app/admin/certifications/page.tsx into separate files
    - Ensure proper TypeScript interfaces for props
    - Import extracted components back into the page
    - _Requirements: 16.1, 16.2, 19.10_

  - [ ] 8.3 Create dedicated ContentEditor component (src/components/admin/content-editor.tsx)
    - Extract rich text editing logic from admin content page into a reusable component
    - Support Section key prop and content save callback
    - Include XSS sanitization on submit
    - _Requirements: 4.1, 4.2, 4.5, 16.1_

  - [ ] 8.4 Create dedicated SocialLinkList component (src/components/admin/social-link-list.tsx)
    - Extract social link management UI into a dedicated component
    - Support add, remove, reorder, toggle visibility actions
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 16.1_

  - [ ] 8.5 Create dedicated ResumeUploader component (src/components/admin/resume-uploader.tsx)
    - Extract resume upload UI into a dedicated component
    - Show current active resume, upload new, and replace functionality
    - Client-side validation for PDF type and 10MB size limit
    - _Requirements: 6.1, 6.5, 16.1_

  - [x] 8.6 Create dedicated ThemeConfigurator component (src/components/admin/theme-configurator.tsx)
    - Extract theme/accent color configuration UI into a dedicated component
    - Include live accent color preview before save
    - Include contrast ratio validation (4.5:1 minimum)
    - _Requirements: 7.1, 7.6, 11.7, 16.1_

- [x] 9. SEO and sitemap tests
  - [x] 9.1 Write unit tests for sitemap generation
    - Test all published projects are included in sitemap
    - Test draft projects are excluded from sitemap
    - Test all static pages are included
    - _Requirements: 9.3_

  - [x] 9.2 Write property test for sitemap completeness (Property 10)
    - **Property 10: Sitemap Completeness**
    - Generate arbitrary sets of published and draft projects, verify sitemap includes exactly the published set
    - **Validates: Requirements 9.3, 9.4**

  - [x] 9.3 Write unit tests for robots.txt generation
    - Test public pages are allowed
    - Test /admin/* routes are disallowed
    - _Requirements: 9.4_

- [ ] 10. Public rendering component tests
  - [x] 10.1 Write component tests for ExperienceTimeline rendering
    - Test entries display in chronological order (most recent first)
    - Test null end_date displays "Present"
    - Test tech_stack tags render correctly
    - _Requirements: 18.6, 18.7_

  - [x] 10.2 Write property test for current position display (Property 13)
    - **Property 13: Current Position Display**
    - Generate arbitrary experience entries with null end_date, verify rendered output contains "Present" text
    - **Validates: Requirements 18.7**

  - [x] 10.3 Write component tests for CertificationCard rendering
    - Test credential_url renders as verifiable link with target="_blank" and rel="noopener noreferrer"
    - Test entries without credential_url do not render a link
    - Test expiry information displays correctly
    - _Requirements: 19.6, 19.7_

  - [x] 10.4 Write property test for credential URL rendering (Property 14)
    - **Property 14: Credential URL Rendering**
    - Generate arbitrary certifications with non-null credential_url, verify rendered anchor has target="_blank" and rel="noopener noreferrer"
    - **Validates: Requirements 19.7**

  - [x] 10.5 Write component tests for ProjectGrid with category filtering
    - Test all published projects display by default
    - Test category filter shows only matching projects
    - Test featured projects have a visual indicator
    - _Requirements: 3.1, 3.2, 3.5_

  - [x] 10.6 Write component tests for ContactForm validation
    - Test required field error messages display on empty submit
    - Test email format validation feedback
    - Test success state rendering after submission
    - _Requirements: 8.2, 8.3_

- [ ] 11. Checkpoint - Ensure all component and SEO tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Theme system and accessibility hardening
  - [ ] 12.1 Verify and fix theme toggle behavior (light/dark/system) across all pages
    - Ensure next-themes class strategy applies without FOUC
    - Verify localStorage persistence of visitor preference
    - Verify system prefers-color-scheme is respected as default
    - _Requirements: 7.4, 7.5_

  - [ ] 12.2 Write property test for theme application without layout shift (Property 7)
    - **Property 7: Theme Application Without Layout Shift**
    - Generate arbitrary accent color values, verify CSS custom property updates do not trigger reflow (validate only CSS variable changes, no layout properties mutated)
    - **Validates: Requirements 7.1, 7.5**

  - [ ] 12.3 Audit and enforce ARIA attributes on all interactive admin components
    - Ensure drag-and-drop sortable items have appropriate aria-labels
    - Ensure modals have role="dialog" and aria-modal="true"
    - Ensure form inputs have associated labels
    - _Requirements: 11.1, 11.3, 11.4_

  - [ ] 12.4 Verify prefers-reduced-motion disables all non-essential animations
    - Check page transitions, hover effects, and loading animations respect the media query
    - Ensure only essential feedback animations (form submit spinner) remain
    - _Requirements: 11.6_

- [ ] 13. Final integration and wiring
  - [ ] 13.1 Verify on-demand ISR revalidation triggers after all CMS mutations
    - Ensure project create/update/delete triggers revalidation of /projects and /projects/[slug]
    - Ensure experience/certification mutations trigger revalidation of respective public pages
    - Ensure content/site-config updates trigger homepage and about page revalidation
    - _Requirements: 17.2_

  - [ ] 13.2 Verify JSON-LD structured data on homepage and project detail pages
    - Ensure homepage has Organization/Person structured data
    - Ensure project detail pages have CreativeWork structured data
    - Validate JSON-LD output against schema.org specs
    - _Requirements: 9.6_

  - [ ] 13.3 Verify dynamic metadata generation for all public pages
    - Each page generates unique title and description
    - OpenGraph and Twitter Card tags are present on all pages
    - Experience and Certifications pages have proper metadata
    - _Requirements: 9.1, 9.2_

  - [ ] 13.4 Verify extension points for future features are in place
    - Confirm /api/chat stub returns 501
    - Confirm /api/subscribe stub returns 501
    - Confirm analytics component slot is in root layout
    - Confirm writing/blog page has placeholder content
    - _Requirements: 16.5_

- [ ] 14. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation between phases
- The design uses TypeScript throughout — all implementation tasks use TypeScript
- Testing uses Vitest + fast-check for property-based tests, @testing-library/react for component tests
- The core application (services, routers, pages, schemas) is already implemented — these tasks focus on testing, component extraction, and hardening
- Property tests validate universal correctness properties defined in the design document
- Unit tests validate specific examples and edge cases

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["2.1", "2.3", "2.5", "2.6"] },
    { "id": 3, "tasks": ["2.2", "2.4"] },
    { "id": 4, "tasks": ["4.1", "4.4", "4.6", "4.7", "4.9", "4.11"] },
    { "id": 5, "tasks": ["4.2", "4.3", "4.5", "4.8", "4.10", "4.12"] },
    { "id": 6, "tasks": ["6.1", "6.3", "6.5", "6.6", "6.7"] },
    { "id": 7, "tasks": ["6.2", "6.4"] },
    { "id": 8, "tasks": ["8.1", "8.2", "8.3", "8.4", "8.5", "8.6"] },
    { "id": 9, "tasks": ["9.1", "9.3", "10.1", "10.3", "10.5", "10.6"] },
    { "id": 10, "tasks": ["9.2", "10.2", "10.4"] },
    { "id": 11, "tasks": ["12.1", "12.3", "12.4"] },
    { "id": 12, "tasks": ["12.2"] },
    { "id": 13, "tasks": ["13.1", "13.2", "13.3", "13.4"] }
  ]
}
```
