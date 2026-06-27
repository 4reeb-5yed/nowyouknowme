/**
 * Mock factories for database records.
 *
 * Each factory generates realistic test data with sensible defaults.
 * All fields can be overridden via partial input.
 */
import { randomUUID } from 'crypto';

// ─── Types matching Drizzle schema inference ───────────────────────────────

type ProjectCategory = 'cybersecurity' | 'cloud' | 'web' | 'other';
type ProjectStatus = 'draft' | 'published';

export interface MockUser {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockProject {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription: string | null;
  techStack: string[];
  category: ProjectCategory;
  githubUrl: string | null;
  liveUrl: string | null;
  thumbnailUrl: string | null;
  isFeatured: boolean;
  displayOrder: number;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockExperience {
  id: string;
  companyName: string;
  roleTitle: string;
  startDate: string;
  endDate: string | null;
  description: string | null;
  techStack: string[];
  displayOrder: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockCertification {
  id: string;
  certificationName: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate: string | null;
  credentialId: string | null;
  credentialUrl: string | null;
  displayOrder: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockSocialLink {
  id: string;
  userId: string;
  platform: string;
  url: string;
  displayOrder: number;
  isVisible: boolean;
}

export interface MockResume {
  id: string;
  userId: string;
  fileUrl: string;
  uploadedAt: Date;
  isActive: boolean;
}

export interface MockSection {
  id: string;
  key: string;
  content: string;
  updatedAt: Date;
}

export interface MockSiteConfig {
  id: string;
  theme: string;
  accentColor: string;
  heroTagline: string;
  metaDescription: string;
  ogImageUrl: string | null;
}

// ─── Counter for unique sequential values ──────────────────────────────────

let counter = 0;

function nextId(): number {
  return ++counter;
}

/**
 * Reset the internal counter. Call in beforeEach if you need deterministic IDs.
 */
export function resetFactoryCounter(): void {
  counter = 0;
}

// ─── Factories ─────────────────────────────────────────────────────────────

export function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
  const n = nextId();
  return {
    id: randomUUID(),
    email: `user${n}@example.com`,
    passwordHash: '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    ...overrides,
  };
}

export function createMockProject(overrides: Partial<MockProject> = {}): MockProject {
  const n = nextId();
  return {
    id: randomUUID(),
    title: `Project ${n}`,
    slug: `project-${n}`,
    description: `Description for project ${n}`,
    longDescription: `Detailed description for project ${n} with more context.`,
    techStack: ['TypeScript', 'React', 'Node.js'],
    category: 'web',
    githubUrl: `https://github.com/user/project-${n}`,
    liveUrl: `https://project-${n}.example.com`,
    thumbnailUrl: `https://cdn.example.com/thumbnails/project-${n}.webp`,
    isFeatured: false,
    displayOrder: n,
    status: 'published',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    ...overrides,
  };
}

export function createMockExperience(overrides: Partial<MockExperience> = {}): MockExperience {
  const n = nextId();
  return {
    id: randomUUID(),
    companyName: `Company ${n}`,
    roleTitle: `Senior Engineer ${n}`,
    startDate: '2022-01-01',
    endDate: '2023-12-31',
    description: `Worked on various projects at Company ${n}.`,
    techStack: ['TypeScript', 'AWS', 'Docker'],
    displayOrder: n,
    isVisible: true,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    ...overrides,
  };
}

export function createMockCertification(overrides: Partial<MockCertification> = {}): MockCertification {
  const n = nextId();
  return {
    id: randomUUID(),
    certificationName: `AWS Solutions Architect ${n}`,
    issuingOrganization: 'Amazon Web Services',
    issueDate: '2023-06-15',
    expiryDate: '2026-06-15',
    credentialId: `CERT-${n}-ABCDEF`,
    credentialUrl: `https://www.credly.com/badges/${randomUUID()}`,
    displayOrder: n,
    isVisible: true,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    ...overrides,
  };
}

export function createMockSocialLink(overrides: Partial<MockSocialLink> = {}): MockSocialLink {
  const n = nextId();
  return {
    id: randomUUID(),
    userId: randomUUID(),
    platform: 'GitHub',
    url: `https://github.com/user${n}`,
    displayOrder: n,
    isVisible: true,
    ...overrides,
  };
}

export function createMockResume(overrides: Partial<MockResume> = {}): MockResume {
  const n = nextId();
  return {
    id: randomUUID(),
    userId: randomUUID(),
    fileUrl: `https://cdn.example.com/resumes/resume-${n}.pdf`,
    uploadedAt: new Date('2024-01-01T00:00:00Z'),
    isActive: true,
    ...overrides,
  };
}

export function createMockSection(overrides: Partial<MockSection> = {}): MockSection {
  const n = nextId();
  return {
    id: randomUUID(),
    key: `section-${n}`,
    content: `<p>Content for section ${n}</p>`,
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    ...overrides,
  };
}

export function createMockSiteConfig(overrides: Partial<MockSiteConfig> = {}): MockSiteConfig {
  return {
    id: randomUUID(),
    theme: 'system',
    accentColor: '#2563eb',
    heroTagline: 'Building secure, scalable solutions',
    metaDescription: 'Portfolio of a full-stack developer specializing in cybersecurity and cloud.',
    ogImageUrl: 'https://cdn.example.com/og-image.png',
    ...overrides,
  };
}
