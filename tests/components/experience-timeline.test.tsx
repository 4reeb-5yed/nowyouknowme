import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import {
  ExperienceTimeline,
  type Experience,
} from '@/components/public/experience-timeline';
import { createMockExperience, resetFactoryCounter } from '../utils/mock-factories';

/**
 * Component tests for ExperienceTimeline rendering.
 *
 * Covers:
 * - Entries display in chronological order (most recent first) — Requirement 18.6
 * - Null end_date displays "Present" — Requirement 18.7
 * - tech_stack tags render correctly — Requirement 18.6
 */

/**
 * Adapts a MockExperience record to the component's Experience prop shape by
 * dropping the timestamp fields the component does not consume.
 */
function toExperienceProp(overrides: Partial<Experience> = {}): Experience {
  const mock = createMockExperience();
  return {
    id: mock.id,
    companyName: mock.companyName,
    roleTitle: mock.roleTitle,
    startDate: mock.startDate,
    endDate: mock.endDate,
    description: mock.description,
    techStack: mock.techStack,
    displayOrder: mock.displayOrder,
    isVisible: mock.isVisible,
    ...overrides,
  };
}

describe('ExperienceTimeline', () => {
  beforeEach(() => {
    resetFactoryCounter();
  });

  it('renders an empty-state message when there are no entries', () => {
    render(<ExperienceTimeline experiences={[]} />);

    expect(
      screen.getByText('No experience entries to display.'),
    ).toBeInTheDocument();
    // No list should be rendered for an empty timeline.
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('renders one timeline item per experience entry', () => {
    const experiences = [
      toExperienceProp({ roleTitle: 'Staff Engineer', companyName: 'Acme' }),
      toExperienceProp({ roleTitle: 'Senior Engineer', companyName: 'Globex' }),
      toExperienceProp({ roleTitle: 'Engineer', companyName: 'Initech' }),
    ];

    render(<ExperienceTimeline experiences={experiences} />);

    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('displays entries in the chronological order provided (most recent first)', () => {
    // Entries arrive pre-sorted most recent first; the component must preserve
    // that DOM order. (Requirement 18.6)
    const experiences = [
      toExperienceProp({
        roleTitle: 'Current Role',
        companyName: 'Recent Co',
        startDate: '2023-01-01',
        endDate: null,
      }),
      toExperienceProp({
        roleTitle: 'Middle Role',
        companyName: 'Middle Co',
        startDate: '2020-01-01',
        endDate: '2022-12-31',
      }),
      toExperienceProp({
        roleTitle: 'Oldest Role',
        companyName: 'Old Co',
        startDate: '2017-01-01',
        endDate: '2019-12-31',
      }),
    ];

    render(<ExperienceTimeline experiences={experiences} />);

    const renderedTitles = screen
      .getAllByRole('heading', { level: 3 })
      .map((heading) => heading.textContent);

    expect(renderedTitles).toEqual([
      'Current Role',
      'Middle Role',
      'Oldest Role',
    ]);
  });

  it('renders the role title as an h3 and the company name for each entry', () => {
    const experiences = [
      toExperienceProp({
        roleTitle: 'Security Engineer',
        companyName: 'CyberCorp',
      }),
    ];

    render(<ExperienceTimeline experiences={experiences} />);

    expect(
      screen.getByRole('heading', { level: 3, name: 'Security Engineer' }),
    ).toBeInTheDocument();
    expect(screen.getByText('CyberCorp')).toBeInTheDocument();
  });

  it('displays "Present" as the end date when end_date is null', () => {
    // Requirement 18.7
    const experiences = [
      toExperienceProp({
        roleTitle: 'Current Role',
        startDate: '2023-01-01',
        endDate: null,
      }),
    ];

    render(<ExperienceTimeline experiences={experiences} />);

    const timeEl = screen.getByText(/Present/);
    expect(timeEl).toBeInTheDocument();
    // Start date is still formatted alongside "Present".
    expect(timeEl.textContent).toContain('Jan 2023');
    expect(timeEl.textContent).toContain('Present');
  });

  it('formats the end date instead of "Present" when end_date is provided', () => {
    const experiences = [
      toExperienceProp({
        roleTitle: 'Past Role',
        startDate: '2020-03-01',
        endDate: '2022-08-01',
      }),
    ];

    render(<ExperienceTimeline experiences={experiences} />);

    const timeEl = screen.getByText(/Mar 2020/);
    expect(timeEl.textContent).toContain('Mar 2020');
    expect(timeEl.textContent).toContain('Aug 2022');
    expect(screen.queryByText(/Present/)).not.toBeInTheDocument();
  });

  it('sets the time element dateTime attribute to the start date', () => {
    const experiences = [
      toExperienceProp({
        roleTitle: 'Dated Role',
        startDate: '2021-05-10',
        endDate: null,
      }),
    ];

    const { container } = render(
      <ExperienceTimeline experiences={experiences} />,
    );

    const timeEl = container.querySelector('time');
    expect(timeEl).not.toBeNull();
    expect(timeEl).toHaveAttribute('dateTime', '2021-05-10');
  });

  it('renders each tech_stack entry as a tag', () => {
    const experiences = [
      toExperienceProp({
        companyName: 'StackCo',
        techStack: ['TypeScript', 'AWS', 'Terraform'],
      }),
    ];

    render(<ExperienceTimeline experiences={experiences} />);

    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('AWS')).toBeInTheDocument();
    expect(screen.getByText('Terraform')).toBeInTheDocument();

    // The tags live inside the labelled tech-stack container for the company.
    const techGroup = screen.getByLabelText('Technologies used at StackCo');
    expect(within(techGroup).getByText('TypeScript')).toBeInTheDocument();
    expect(within(techGroup).getByText('AWS')).toBeInTheDocument();
    expect(within(techGroup).getByText('Terraform')).toBeInTheDocument();
  });

  it('does not render a tech-stack container when tech_stack is empty', () => {
    const experiences = [
      toExperienceProp({ companyName: 'NoTechCo', techStack: [] }),
    ];

    render(<ExperienceTimeline experiences={experiences} />);

    expect(
      screen.queryByLabelText('Technologies used at NoTechCo'),
    ).not.toBeInTheDocument();
  });

  it('renders the description when provided and omits it when null', () => {
    const withDescription = [
      toExperienceProp({
        roleTitle: 'Described Role',
        description: 'Led the security program.',
      }),
    ];

    const { rerender } = render(
      <ExperienceTimeline experiences={withDescription} />,
    );
    expect(screen.getByText('Led the security program.')).toBeInTheDocument();

    const withoutDescription = [
      toExperienceProp({ roleTitle: 'Bare Role', description: null }),
    ];
    rerender(<ExperienceTimeline experiences={withoutDescription} />);
    expect(screen.queryByText('Led the security program.')).not.toBeInTheDocument();
  });
});
