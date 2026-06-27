/**
 * Component tests for ProjectGrid with category filtering.
 *
 * Covers public projects display behavior:
 *  - All published projects display by default (Requirement 3.1)
 *  - Category filter shows only matching projects (Requirement 3.2)
 *  - Featured projects have a visual indicator (Requirement 3.5)
 */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { ProjectGrid, type Project } from '@/components/public/project-grid';
import { createMockProject, type MockProject } from '../utils/mock-factories';

/**
 * Adapt the DB-shaped mock project to the ProjectGrid `Project` prop shape.
 * They are structurally identical, so this is a straightforward cast helper
 * that also lets callers override fields conveniently.
 */
function makeProject(overrides: Partial<MockProject> = {}): Project {
  return createMockProject(overrides) as Project;
}

describe('ProjectGrid', () => {
  it('renders all provided projects by default (Requirement 3.1)', () => {
    const projects = [
      makeProject({ title: 'Cyber Project', category: 'cybersecurity' }),
      makeProject({ title: 'Cloud Project', category: 'cloud' }),
      makeProject({ title: 'Web Project', category: 'web' }),
      makeProject({ title: 'Other Project', category: 'other' }),
    ];

    render(<ProjectGrid projects={projects} />);

    expect(screen.getByText('Cyber Project')).toBeInTheDocument();
    expect(screen.getByText('Cloud Project')).toBeInTheDocument();
    expect(screen.getByText('Web Project')).toBeInTheDocument();
    expect(screen.getByText('Other Project')).toBeInTheDocument();
  });

  it('defaults to the "All" tab being selected', () => {
    const projects = [makeProject({ title: 'Some Project' })];

    render(<ProjectGrid projects={projects} />);

    const allTab = screen.getByRole('tab', { name: 'All' });
    expect(allTab).toHaveAttribute('aria-selected', 'true');
  });

  it('renders project cards in the order they are provided', () => {
    const projects = [
      makeProject({ title: 'First' }),
      makeProject({ title: 'Second' }),
      makeProject({ title: 'Third' }),
    ];

    render(<ProjectGrid projects={projects} />);

    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings.map((h) => h.textContent)).toEqual(['First', 'Second', 'Third']);
  });

  it('shows only matching projects when a category filter is selected (Requirement 3.2)', () => {
    const projects = [
      makeProject({ title: 'Cyber Project', category: 'cybersecurity' }),
      makeProject({ title: 'Cloud Project', category: 'cloud' }),
      makeProject({ title: 'Web Project', category: 'web' }),
    ];

    render(<ProjectGrid projects={projects} />);

    fireEvent.click(screen.getByRole('tab', { name: 'Cloud' }));

    expect(screen.getByText('Cloud Project')).toBeInTheDocument();
    expect(screen.queryByText('Cyber Project')).not.toBeInTheDocument();
    expect(screen.queryByText('Web Project')).not.toBeInTheDocument();
  });

  it('marks the selected category tab as active via aria-selected', () => {
    const projects = [makeProject({ category: 'web' })];

    render(<ProjectGrid projects={projects} />);

    const webTab = screen.getByRole('tab', { name: 'Web' });
    fireEvent.click(webTab);

    expect(webTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'All' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  it('returns to all projects when the "All" tab is reselected', () => {
    const projects = [
      makeProject({ title: 'Cyber Project', category: 'cybersecurity' }),
      makeProject({ title: 'Web Project', category: 'web' }),
    ];

    render(<ProjectGrid projects={projects} />);

    fireEvent.click(screen.getByRole('tab', { name: 'Cybersecurity' }));
    expect(screen.queryByText('Web Project')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'All' }));
    expect(screen.getByText('Cyber Project')).toBeInTheDocument();
    expect(screen.getByText('Web Project')).toBeInTheDocument();
  });

  it('renders an empty-state message when no projects match the filter', () => {
    const projects = [makeProject({ title: 'Web Project', category: 'web' })];

    render(<ProjectGrid projects={projects} />);

    // Filter by a category that has no projects.
    fireEvent.click(screen.getByRole('tab', { name: 'Cloud' }));

    expect(screen.getByText('No projects found')).toBeInTheDocument();
    expect(screen.queryByText('Web Project')).not.toBeInTheDocument();
  });

  it('renders an empty-state message when given no projects', () => {
    render(<ProjectGrid projects={[]} />);

    expect(screen.getByText('No projects found')).toBeInTheDocument();
  });

  it('displays a visual indicator on featured projects (Requirement 3.5)', () => {
    const projects = [
      makeProject({ title: 'Featured Project', isFeatured: true }),
      makeProject({ title: 'Regular Project', isFeatured: false }),
    ];

    render(<ProjectGrid projects={projects} />);

    const indicators = screen.getAllByLabelText('Featured project');
    expect(indicators).toHaveLength(1);

    // The indicator must belong to the featured project's card.
    const featuredHeading = screen.getByText('Featured Project');
    const featuredCard = featuredHeading.closest('article');
    expect(featuredCard).not.toBeNull();
    expect(
      within(featuredCard as HTMLElement).getByLabelText('Featured project'),
    ).toBeInTheDocument();

    // The non-featured project's card must not have the indicator.
    const regularHeading = screen.getByText('Regular Project');
    const regularCard = regularHeading.closest('article');
    expect(regularCard).not.toBeNull();
    expect(
      within(regularCard as HTMLElement).queryByLabelText('Featured project'),
    ).not.toBeInTheDocument();
  });

  it('keeps the featured indicator visible after filtering to that project', () => {
    const projects = [
      makeProject({ title: 'Featured Cloud', category: 'cloud', isFeatured: true }),
      makeProject({ title: 'Plain Web', category: 'web', isFeatured: false }),
    ];

    render(<ProjectGrid projects={projects} />);

    fireEvent.click(screen.getByRole('tab', { name: 'Cloud' }));

    expect(screen.getByText('Featured Cloud')).toBeInTheDocument();
    expect(screen.getByLabelText('Featured project')).toBeInTheDocument();
  });
});
