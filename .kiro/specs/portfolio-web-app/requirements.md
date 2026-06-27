# Requirements Document

## Introduction

A full-stack, CMS-backed portfolio web application serving dual purposes: a public-facing site presenting the owner (a professional spanning cybersecurity, cloud infrastructure, and web development) to recruiters, collaborators, and clients; and a private owner dashboard (CMS) for managing all content without touching code. The application prioritizes credibility, technical precision, accessibility, performance, and maintainability.

## Glossary

- **Application**: The complete portfolio web application system including the Public_Site and the CMS_Dashboard
- **Public_Site**: The publicly accessible, server-rendered portion of the Application that visitors see
- **CMS_Dashboard**: The authenticated, owner-only administration interface for managing all content
- **Owner**: The single authenticated user who administers the Application via the CMS_Dashboard
- **Visitor**: An unauthenticated user browsing the Public_Site
- **Project**: A portfolio item representing work done by the Owner, categorized by domain
- **Section**: An editable rich-content block representing a named area of the Public_Site (e.g., About, Skills, Contact)
- **Social_Link**: A reference to the Owner's presence on an external platform (e.g., GitHub, LinkedIn)
- **Site_Config**: A runtime-editable configuration record controlling theme, SEO metadata, and branding
- **Resume**: A downloadable PDF file representing the Owner's current résumé
- **Auth_System**: The authentication and session management subsystem
- **File_Storage**: The subsystem responsible for storing and serving uploaded binary assets (images, PDFs)
- **Theme_System**: The subsystem controlling visual appearance including light/dark mode and accent colors
- **Renderer**: The server-side rendering or static generation subsystem responsible for producing HTML pages
- **API_Layer**: The backend interface (REST, tRPC, or GraphQL) mediating between the CMS_Dashboard and the database
- **ORM**: The Object-Relational Mapping layer providing type-safe database access
- **Validation_Layer**: The subsystem responsible for client-side and server-side input validation
- **Contact_Form**: The public-facing form allowing Visitors to send messages to the Owner
- **Experience**: A record representing a professional work experience entry in the Owner's career history
- **Certification**: A record representing a professional certification or license held by the Owner

## Requirements

### Requirement 1: Owner Authentication

**User Story:** As the Owner, I want to securely log into the CMS Dashboard with my credentials, so that only I can manage site content.

#### Acceptance Criteria

1. WHEN the Owner submits valid email and password credentials, THE Auth_System SHALL create an authenticated session and redirect the Owner to the CMS_Dashboard home page.
2. WHEN the Owner submits invalid credentials, THE Auth_System SHALL reject the login attempt and display a generic error message without revealing which credential was incorrect.
3. WHILE the Owner has an active session, THE Auth_System SHALL allow access to all CMS_Dashboard routes.
4. WHEN a session expires or the Owner logs out, THE Auth_System SHALL invalidate the session and redirect to the login page.
5. IF an unauthenticated request is made to any CMS_Dashboard route, THEN THE Auth_System SHALL redirect the request to the login page.
6. THE Auth_System SHALL enforce CSRF protection on all state-changing requests.
7. THE Auth_System SHALL restrict account creation to a single Owner account with no public registration endpoint.

### Requirement 2: Project Management via CMS

**User Story:** As the Owner, I want to create, edit, delete, reorder, and publish projects from the CMS Dashboard, so that I can showcase my work without modifying code.

#### Acceptance Criteria

1. WHEN the Owner submits a valid project creation form, THE CMS_Dashboard SHALL persist a new Project record with title, slug, description, long_description, tech_stack list, category, github_url, live_url, thumbnail_url, is_featured flag, display_order, and status fields.
2. WHEN the Owner edits an existing Project and saves, THE CMS_Dashboard SHALL update the corresponding record and set the updated_at timestamp.
3. WHEN the Owner deletes a Project, THE CMS_Dashboard SHALL remove the record from the database after confirmation.
4. WHEN the Owner changes a Project's status from draft to published, THE CMS_Dashboard SHALL make the Project visible on the Public_Site.
5. WHEN the Owner changes a Project's status from published to draft, THE CMS_Dashboard SHALL hide the Project from the Public_Site.
6. WHEN the Owner reorders Projects via drag-and-drop, THE CMS_Dashboard SHALL persist the new display_order values for all affected Projects.
7. THE Validation_Layer SHALL validate all Project form inputs on both client and server, rejecting submissions with missing required fields or invalid data formats.
8. THE CMS_Dashboard SHALL display Projects in a table view with columns for title, category, status, and display_order.
9. THE CMS_Dashboard SHALL auto-generate a URL-safe slug from the Project title, allowing the Owner to override the slug manually.

### Requirement 3: Public Projects Display

**User Story:** As a Visitor, I want to browse and filter the Owner's projects by domain category, so that I can quickly find work relevant to my interest.

#### Acceptance Criteria

1. THE Public_Site SHALL display all published Projects in a card-based grid layout, ordered by display_order.
2. WHEN a Visitor selects a category filter (cybersecurity, cloud, web, or other), THE Public_Site SHALL display only Projects matching that category.
3. WHEN a Visitor navigates to /projects/[slug], THE Public_Site SHALL render a detail page showing the Project's full information including long_description, tech_stack, links, and thumbnail.
4. IF a Visitor navigates to a Project slug that does not exist or is in draft status, THEN THE Public_Site SHALL return a 404 response.
5. THE Public_Site SHALL mark featured Projects with a visual indicator in the grid view.
6. THE Renderer SHALL generate static or incrementally-regenerated pages for Project detail pages to optimize load performance.

### Requirement 4: Content Sections Management

**User Story:** As the Owner, I want to edit the About, Hero tagline, and other content sections from the CMS Dashboard, so that I can update my narrative without code changes.

#### Acceptance Criteria

1. WHEN the Owner edits the About section content and saves, THE CMS_Dashboard SHALL persist the updated rich text content.
2. WHEN the Owner edits the Hero tagline and saves, THE CMS_Dashboard SHALL persist the updated tagline text.
3. THE Public_Site SHALL render the About section using the current persisted content from the Section record.
4. THE Public_Site SHALL render the Hero section using the current persisted tagline from the Site_Config record.
5. THE Validation_Layer SHALL sanitize all rich text input to prevent stored cross-site scripting attacks.

### Requirement 5: Social Links Management

**User Story:** As the Owner, I want to manage my social media links from the CMS Dashboard, so that Visitors can find me on relevant platforms.

#### Acceptance Criteria

1. WHEN the Owner adds a new Social_Link with platform name and URL, THE CMS_Dashboard SHALL persist the record with the next available display_order.
2. WHEN the Owner removes a Social_Link, THE CMS_Dashboard SHALL delete the record from the database.
3. WHEN the Owner reorders Social_Links via drag-and-drop, THE CMS_Dashboard SHALL persist the new display_order values.
4. WHEN the Owner toggles a Social_Link's visibility to hidden, THE CMS_Dashboard SHALL set is_visible to false and THE Public_Site SHALL exclude that link from rendering.
5. THE Public_Site SHALL display all visible Social_Links in display_order in the site footer and Contact section.

### Requirement 6: Resume Management

**User Story:** As the Owner, I want to upload, replace, and manage my resume PDF from the CMS Dashboard, so that Visitors can download the latest version.

#### Acceptance Criteria

1. WHEN the Owner uploads a new resume file, THE File_Storage SHALL store the PDF and THE CMS_Dashboard SHALL create a Resume record with file_url, uploaded_at, and is_active set to true.
2. WHEN a new Resume is uploaded, THE CMS_Dashboard SHALL set all previous Resume records to is_active false.
3. THE Public_Site SHALL display a download button linking to the currently active Resume file_url.
4. IF no active Resume record exists, THEN THE Public_Site SHALL hide the resume download button.
5. THE Validation_Layer SHALL reject file uploads that are not PDF format or exceed 10 MB in size.

### Requirement 7: Site Configuration and Theming

**User Story:** As the Owner, I want to configure the site's theme, accent color, SEO metadata, and branding from the CMS Dashboard, so that I can control the site's appearance and discoverability without rebuilding.

#### Acceptance Criteria

1. WHEN the Owner updates the accent color in Site_Config, THE Theme_System SHALL apply the new color to the Public_Site at runtime without requiring a rebuild or redeployment.
2. WHEN the Owner updates the meta_description or og_image_url in Site_Config, THE Renderer SHALL use the updated values in the next page render.
3. WHEN the Owner switches the theme between light and dark mode defaults, THE Theme_System SHALL persist the preference in Site_Config.
4. THE Theme_System SHALL respect the Visitor's system-level prefers-color-scheme preference as the default, allowing manual override via a toggle on the Public_Site.
5. THE Theme_System SHALL apply theme changes without causing layout shift or flash of unstyled content.
6. THE CMS_Dashboard SHALL provide a live preview of accent color changes before the Owner saves.

### Requirement 8: Contact Form

**User Story:** As a Visitor, I want to send a message to the Owner via a contact form, so that I can inquire about opportunities or collaboration.

#### Acceptance Criteria

1. WHEN a Visitor submits the Contact_Form with valid name, email, and message fields, THE Application SHALL deliver the message to the Owner's configured email address.
2. WHEN a Visitor submits the Contact_Form with missing or invalid fields, THE Validation_Layer SHALL display specific field-level error messages without submitting.
3. IF the email delivery service is unavailable, THEN THE Application SHALL inform the Visitor that the message could not be sent and suggest an alternative contact method.
4. THE Validation_Layer SHALL validate Contact_Form input on both client and server.
5. THE Application SHALL implement rate limiting on the contact form endpoint to prevent abuse.

### Requirement 9: SEO and Metadata

**User Story:** As the Owner, I want the Public Site to be fully optimized for search engines, so that my portfolio ranks well and displays correctly when shared on social platforms.

#### Acceptance Criteria

1. THE Renderer SHALL generate unique, dynamic meta title and description tags for each page using Site_Config and page-specific data.
2. THE Renderer SHALL generate OpenGraph and Twitter Card meta tags for every public page.
3. THE Application SHALL serve a dynamically generated sitemap.xml including all published Project URLs and static pages.
4. THE Application SHALL serve a robots.txt file permitting indexing of all Public_Site pages and disallowing CMS_Dashboard routes.
5. THE Renderer SHALL use server-side rendering or static generation for all Public_Site pages to ensure content is crawlable.
6. THE Renderer SHALL generate JSON-LD structured data on the homepage and Project detail pages.

### Requirement 10: Performance and Core Web Vitals

**User Story:** As the Owner, I want the Public Site to load fast and score well on Core Web Vitals, so that Visitors have a smooth experience and SEO ranking is not penalized.

#### Acceptance Criteria

1. THE Public_Site SHALL achieve a Largest Contentful Paint (LCP) of less than 2.5 seconds on a simulated 4G connection.
2. THE Public_Site SHALL achieve a Cumulative Layout Shift (CLS) of less than 0.1.
3. THE Public_Site SHALL achieve an Interaction to Next Paint (INP) of less than 200 milliseconds.
4. THE Renderer SHALL lazy-load all images below the initial viewport fold.
5. THE Renderer SHALL preload critical fonts and serve them with font-display swap to prevent Flash of Unstyled Text.
6. THE Renderer SHALL generate optimized image formats (WebP or AVIF) and responsive srcset attributes for all uploaded images.

### Requirement 11: Accessibility

**User Story:** As a Visitor using assistive technology, I want the Public Site to be fully navigable and understandable, so that I can access the Owner's portfolio content.

#### Acceptance Criteria

1. THE Public_Site SHALL conform to WCAG 2.1 Level AA success criteria across all pages.
2. THE Public_Site SHALL provide a logical heading hierarchy (h1 through h6) on every page.
3. THE Public_Site SHALL ensure all interactive elements are reachable and operable via keyboard alone.
4. THE Public_Site SHALL provide visible focus indicators on all focusable elements.
5. THE Public_Site SHALL include descriptive alt text for all images, sourced from CMS-managed data.
6. WHILE the Visitor has enabled prefers-reduced-motion, THE Public_Site SHALL disable all non-essential animations and transitions.
7. THE Public_Site SHALL maintain a minimum color contrast ratio of 4.5:1 for normal text and 3:1 for large text against all background colors, including custom accent colors.

### Requirement 12: Security

**User Story:** As the Owner, I want the Application to follow security best practices, so that the CMS and visitor data are protected from common attacks.

#### Acceptance Criteria

1. THE Application SHALL sanitize all user-provided input before storing or rendering to prevent cross-site scripting (XSS) attacks.
2. THE Application SHALL use parameterized queries or an ORM to prevent SQL injection attacks.
3. THE Auth_System SHALL hash passwords using a modern algorithm (bcrypt or argon2) with appropriate cost factor.
4. THE Application SHALL set secure HTTP headers including Content-Security-Policy, X-Content-Type-Options, X-Frame-Options, and Strict-Transport-Security.
5. THE File_Storage SHALL validate uploaded file MIME types and reject files that do not match allowed types (PDF for resumes, JPEG/PNG/WebP for images).
6. THE API_Layer SHALL enforce authentication middleware on all CMS_Dashboard endpoints, returning 401 for unauthenticated requests.
7. THE Application SHALL enforce HTTPS for all connections in production.

### Requirement 13: Skills and Tech Stack Display

**User Story:** As a Visitor, I want to see the Owner's skills organized by domain, so that I can quickly assess technical expertise and relevance.

#### Acceptance Criteria

1. THE Public_Site SHALL display skills grouped by domain categories (cybersecurity, cloud infrastructure, web development).
2. WHEN a Visitor selects a domain filter, THE Public_Site SHALL display only skills belonging to that domain.
3. THE CMS_Dashboard SHALL allow the Owner to add, edit, remove, and reorder skills within each domain group.
4. THE Public_Site SHALL render skills using a visual layout (tags, badges, or icons) that is scannable at a glance.

### Requirement 14: File Upload and Storage

**User Story:** As the Owner, I want to upload images and documents through the CMS Dashboard, so that I can manage visual assets for projects and sections.

#### Acceptance Criteria

1. WHEN the Owner uploads an image file (JPEG, PNG, or WebP) through the CMS_Dashboard, THE File_Storage SHALL store the file and return a publicly accessible URL.
2. WHEN the Owner uploads a project thumbnail, THE File_Storage SHALL generate optimized variants at multiple resolutions for responsive delivery.
3. IF a file upload exceeds 10 MB, THEN THE Validation_Layer SHALL reject the upload with a clear error message.
4. IF a file upload has an unsupported MIME type, THEN THE Validation_Layer SHALL reject the upload with a clear error message specifying allowed formats.
5. THE File_Storage SHALL serve uploaded assets with appropriate cache-control headers for performance.

### Requirement 15: Database Schema and Data Integrity

**User Story:** As the Owner, I want the database schema to enforce data integrity constraints, so that content remains consistent and valid.

#### Acceptance Criteria

1. THE ORM SHALL define a User model with id, email, password_hash, created_at, and updated_at fields with email as a unique constraint.
2. THE ORM SHALL define a Project model with all specified fields, slug as a unique constraint, and category constrained to an enum of cybersecurity, cloud, web, and other.
3. THE ORM SHALL define a Section model with a unique key field (about, skills, contact), rich text content, and updated_at timestamp.
4. THE ORM SHALL define a Social_Link model with platform, url, display_order, is_visible, and foreign key reference to User.
5. THE ORM SHALL define a Resume model with file_url, uploaded_at, is_active, and foreign key reference to User.
6. THE ORM SHALL define a Site_Config model storing theme, accent_color, hero_tagline, meta_description, and og_image_url fields.
7. THE ORM SHALL enforce NOT NULL constraints on all required fields and CASCADE delete behavior on dependent records when appropriate.
8. THE ORM SHALL define an Experience model with id, company_name, role_title, start_date, end_date (nullable for current positions), description, tech_stack (JSON array), display_order, is_visible, created_at, and updated_at fields.
9. THE ORM SHALL define a Certification model with id, certification_name, issuing_organization, issue_date, expiry_date (nullable), credential_id (nullable), credential_url (nullable), display_order, is_visible, created_at, and updated_at fields.

### Requirement 16: Application Architecture

**User Story:** As a developer maintaining the Application, I want a clean separation of concerns and modular architecture, so that the codebase remains understandable and extensible.

#### Acceptance Criteria

1. THE Application SHALL separate code into distinct UI, service, and data access layers with no direct database calls from UI components.
2. THE Application SHALL organize features into self-contained modules (projects, auth, content, social-links, resume, site-config, contact).
3. THE Application SHALL use TypeScript in strict mode with no usage of the `any` type across the entire codebase.
4. THE Application SHALL define shared types and interfaces in a dedicated types directory accessible to all layers.
5. THE Application SHALL provide extension points (stub API routes and placeholder data models) for future features: RAG chatbot, blog, analytics, newsletter, and testimonials.

### Requirement 17: Deployment and Build

**User Story:** As the Owner, I want to deploy the Application with minimal friction and have content changes reflected quickly, so that I can keep the site up to date without complex processes.

#### Acceptance Criteria

1. THE Application SHALL support deployment to a platform with automatic builds triggered by git push (Vercel, Railway, or Fly.io).
2. WHEN the Owner updates content via the CMS_Dashboard, THE Public_Site SHALL reflect changes within 60 seconds through incremental static regeneration or server-side rendering.
3. THE Application SHALL provide environment variable configuration for all secrets (database URL, auth secret, file storage credentials, email service API key).
4. THE Application SHALL include a complete README documenting setup, environment variables, deployment steps, and architecture decisions.

### Requirement 18: Work Experience Management

**User Story:** As the Owner, I want to manage my professional work experience entries from the CMS Dashboard, so that Visitors can see my career history and expertise in a structured timeline.

#### Acceptance Criteria

1. WHEN the Owner submits a valid experience creation form, THE CMS_Dashboard SHALL persist a new Experience record with company_name, role_title, start_date, end_date (or null for current positions), description, tech_stack list, display_order, and is_visible fields.
2. WHEN the Owner edits an existing Experience entry and saves, THE CMS_Dashboard SHALL update the corresponding record and set the updated_at timestamp.
3. WHEN the Owner deletes an Experience entry, THE CMS_Dashboard SHALL remove the record from the database after confirmation.
4. WHEN the Owner reorders Experience entries via drag-and-drop, THE CMS_Dashboard SHALL persist the new display_order values for all affected Experience records.
5. WHEN the Owner toggles an Experience entry's visibility to hidden, THE CMS_Dashboard SHALL set is_visible to false and THE Public_Site SHALL exclude that entry from rendering.
6. THE Public_Site SHALL display all visible Experience entries in chronological order (most recent first) using a timeline or list layout.
7. THE Public_Site SHALL display "Present" as the end date for Experience entries where end_date is null.
8. THE Validation_Layer SHALL validate all Experience form inputs on both client and server, rejecting submissions with missing required fields or invalid date formats.
9. THE Validation_Layer SHALL reject Experience entries where start_date is after end_date when end_date is provided.
10. THE CMS_Dashboard SHALL display Experience entries in a table view with columns for company_name, role_title, date range, visibility status, and action buttons.

### Requirement 19: Licenses and Certifications Management

**User Story:** As the Owner, I want to manage my professional certifications and licenses from the CMS Dashboard, so that Visitors can see my verified qualifications and credentials.

#### Acceptance Criteria

1. WHEN the Owner submits a valid certification creation form, THE CMS_Dashboard SHALL persist a new Certification record with certification_name, issuing_organization, issue_date, expiry_date (nullable), credential_id (nullable), credential_url (nullable), display_order, and is_visible fields.
2. WHEN the Owner edits an existing Certification entry and saves, THE CMS_Dashboard SHALL update the corresponding record and set the updated_at timestamp.
3. WHEN the Owner deletes a Certification entry, THE CMS_Dashboard SHALL remove the record from the database after confirmation.
4. WHEN the Owner reorders Certification entries via drag-and-drop, THE CMS_Dashboard SHALL persist the new display_order values for all affected Certification records.
5. WHEN the Owner toggles a Certification entry's visibility to hidden, THE CMS_Dashboard SHALL set is_visible to false and THE Public_Site SHALL exclude that entry from rendering.
6. THE Public_Site SHALL display all visible Certification entries in display_order using a card or badge layout.
7. WHERE a Certification entry has a credential_url, THE Public_Site SHALL render the credential_url as a verifiable link opening in a new tab.
8. THE Validation_Layer SHALL validate all Certification form inputs on both client and server, rejecting submissions with missing required fields or invalid URL formats for credential_url.
9. THE Validation_Layer SHALL reject Certification entries where expiry_date is before issue_date when expiry_date is provided.
10. THE CMS_Dashboard SHALL display Certification entries in a table view with columns for certification_name, issuing_organization, issue_date, expiry status, visibility status, and action buttons.
