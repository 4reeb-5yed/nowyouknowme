import { describe, it, expect, beforeEach } from 'vitest';
import {
  createMockUser,
  createMockProject,
  createMockExperience,
  createMockCertification,
  createMockSocialLink,
  createMockResume,
  createMockSection,
  createMockSiteConfig,
  resetFactoryCounter,
} from './mock-factories';

describe('Mock Factories', () => {
  beforeEach(() => {
    resetFactoryCounter();
  });

  it('creates a mock user with unique email', () => {
    const user = createMockUser();
    expect(user.id).toBeDefined();
    expect(user.email).toContain('@example.com');
    expect(user.passwordHash).toBeTruthy();
    expect(user.createdAt).toBeInstanceOf(Date);
  });

  it('creates a mock project with all fields', () => {
    const project = createMockProject();
    expect(project.title).toBe('Project 1');
    expect(project.slug).toBe('project-1');
    expect(project.category).toBe('web');
    expect(project.status).toBe('published');
    expect(project.techStack).toContain('TypeScript');
  });

  it('allows overriding fields', () => {
    const project = createMockProject({ title: 'Custom', status: 'draft' });
    expect(project.title).toBe('Custom');
    expect(project.status).toBe('draft');
  });

  it('creates a mock experience with date strings', () => {
    const exp = createMockExperience();
    expect(exp.companyName).toBe('Company 1');
    expect(exp.startDate).toBe('2022-01-01');
    expect(exp.endDate).toBe('2023-12-31');
    expect(exp.isVisible).toBe(true);
  });

  it('creates a mock experience with null endDate for current position', () => {
    const exp = createMockExperience({ endDate: null });
    expect(exp.endDate).toBeNull();
  });

  it('creates a mock certification', () => {
    const cert = createMockCertification();
    expect(cert.certificationName).toContain('AWS Solutions Architect');
    expect(cert.issuingOrganization).toBe('Amazon Web Services');
    expect(cert.credentialId).toBeTruthy();
    expect(cert.credentialUrl).toContain('credly.com');
  });

  it('creates a mock social link', () => {
    const link = createMockSocialLink();
    expect(link.platform).toBe('GitHub');
    expect(link.url).toContain('github.com');
    expect(link.isVisible).toBe(true);
  });

  it('creates a mock resume', () => {
    const resume = createMockResume();
    expect(resume.fileUrl).toContain('.pdf');
    expect(resume.isActive).toBe(true);
  });

  it('creates a mock section', () => {
    const section = createMockSection();
    expect(section.key).toBe('section-1');
    expect(section.content).toContain('<p>');
  });

  it('creates a mock site config with defaults', () => {
    const config = createMockSiteConfig();
    expect(config.theme).toBe('system');
    expect(config.accentColor).toBe('#2563eb');
    expect(config.heroTagline).toBeTruthy();
  });

  it('generates unique sequential IDs with counter', () => {
    const p1 = createMockProject();
    const p2 = createMockProject();
    expect(p1.slug).toBe('project-1');
    expect(p2.slug).toBe('project-2');
    expect(p1.id).not.toBe(p2.id);
  });
});
