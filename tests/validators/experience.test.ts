import { describe, it, expect } from 'vitest';
import { experienceCreateSchema } from '@/lib/validators/experience';

describe('experienceCreateSchema', () => {
  const validInput = {
    companyName: 'Acme Corp',
    roleTitle: 'Senior Engineer',
    startDate: '2022-01-15',
    endDate: '2023-06-30',
    description: 'Built scalable services.',
    techStack: ['TypeScript', 'AWS'],
    isVisible: true,
  };

  it('accepts a valid experience creation input', () => {
    const result = experienceCreateSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('rejects when start_date is after end_date', () => {
    const result = experienceCreateSchema.safeParse({
      ...validInput,
      startDate: '2023-06-30',
      endDate: '2022-01-15',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const endDateError = result.error.issues.find((i) => i.path.includes('endDate'));
      expect(endDateError).toBeDefined();
      expect(endDateError!.message).toBe('End date must be after start date');
    }
  });

  it('rejects when start_date equals end_date', () => {
    const result = experienceCreateSchema.safeParse({
      ...validInput,
      startDate: '2023-01-01',
      endDate: '2023-01-01',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const endDateError = result.error.issues.find((i) => i.path.includes('endDate'));
      expect(endDateError).toBeDefined();
    }
  });

  it('accepts null end_date for a current position', () => {
    const result = experienceCreateSchema.safeParse({
      ...validInput,
      endDate: null,
    });
    expect(result.success).toBe(true);
  });

  it('accepts undefined end_date (field omitted)', () => {
    const { endDate, ...withoutEndDate } = validInput;
    const result = experienceCreateSchema.safeParse(withoutEndDate);
    expect(result.success).toBe(true);
  });
});
