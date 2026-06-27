/**
 * Component tests for ContactForm validation.
 *
 * Covers contact form behavior:
 *  - Required field error messages display on empty submit (Requirement 8.2)
 *  - Email format validation feedback (Requirement 8.2)
 *  - Success state rendering after submission (Requirement 8.3)
 *
 * The form validates with react-hook-form + Zod (shared contactFormSchema),
 * and posts valid submissions to /api/contact. Tests use fireEvent (user-event
 * is not installed) and stub global.fetch to drive the network outcomes.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContactForm } from '@/components/public/contact-form';

/** Fills the contact form fields with the provided values. */
function fillForm({
  name,
  email,
  message,
}: {
  name?: string;
  email?: string;
  message?: string;
}) {
  if (name !== undefined) {
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: name } });
  }
  if (email !== undefined) {
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: email },
    });
  }
  if (message !== undefined) {
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: message },
    });
  }
}

function submitForm() {
  fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
}

describe('ContactForm', () => {
  beforeEach(() => {
    // Default: no network call expected unless a test sets up a resolution.
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  describe('required field validation (Requirement 8.2)', () => {
    it('displays field-level error messages for every required field on empty submit', async () => {
      render(<ContactForm />);

      submitForm();

      expect(await screen.findByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(
        screen.getByText('Message must be at least 10 characters'),
      ).toBeInTheDocument();
    });

    it('does not submit to the API when required fields are empty', async () => {
      render(<ContactForm />);

      submitForm();

      // Wait for validation to settle and produce error messages.
      await screen.findByText('Name is required');
      expect(fetch).not.toHaveBeenCalled();
    });

    it('does not show validation errors before the first submit', () => {
      render(<ContactForm />);

      expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
      expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
      expect(
        screen.queryByText('Message must be at least 10 characters'),
      ).not.toBeInTheDocument();
    });

    it('reports a too-short message as invalid', async () => {
      render(<ContactForm />);

      fillForm({ name: 'Jane', email: 'jane@example.com', message: 'Hi' });
      submitForm();

      expect(
        await screen.findByText('Message must be at least 10 characters'),
      ).toBeInTheDocument();
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('email format validation (Requirement 8.2)', () => {
    it('shows a feedback message when the email format is invalid', async () => {
      render(<ContactForm />);

      fillForm({
        name: 'Jane',
        email: 'not-an-email',
        message: 'This is a valid message body with enough length.',
      });
      submitForm();

      expect(
        await screen.findByText('Please enter a valid email address'),
      ).toBeInTheDocument();
      expect(fetch).not.toHaveBeenCalled();
    });

    it('marks the email input as aria-invalid when validation fails', async () => {
      render(<ContactForm />);

      fillForm({
        name: 'Jane',
        email: 'bad@',
        message: 'This is a valid message body with enough length.',
      });
      submitForm();

      await screen.findByText('Please enter a valid email address');
      expect(screen.getByLabelText('Email')).toHaveAttribute(
        'aria-invalid',
        'true',
      );
    });

    it('clears the invalid email error once a valid email is submitted', async () => {
      vi.mocked(fetch).mockResolvedValue(
        new Response(null, { status: 200 }),
      );

      render(<ContactForm />);

      fillForm({
        name: 'Jane',
        email: 'not-an-email',
        message: 'This is a valid message body with enough length.',
      });
      submitForm();
      await screen.findByText('Please enter a valid email address');

      fillForm({ email: 'jane@example.com' });
      submitForm();

      await waitFor(() =>
        expect(
          screen.queryByText('Please enter a valid email address'),
        ).not.toBeInTheDocument(),
      );
    });
  });

  describe('success state after submission (Requirement 8.3)', () => {
    it('renders the success message after a valid submission is accepted', async () => {
      vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 200 }));

      render(<ContactForm />);

      fillForm({
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'I would love to discuss a collaboration opportunity.',
      });
      submitForm();

      expect(await screen.findByText('Message sent!')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Send another message' }),
      ).toBeInTheDocument();
    });

    it('posts the form values to the contact API endpoint', async () => {
      vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 200 }));

      render(<ContactForm />);

      const payload = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'I would love to discuss a collaboration opportunity.',
      };
      fillForm(payload);
      submitForm();

      await screen.findByText('Message sent!');

      expect(fetch).toHaveBeenCalledTimes(1);
      const [url, init] = vi.mocked(fetch).mock.calls[0];
      expect(url).toBe('/api/contact');
      expect(init?.method).toBe('POST');
      expect(JSON.parse(init?.body as string)).toEqual(payload);
    });

    it('returns to the form when "Send another message" is clicked', async () => {
      vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 200 }));

      render(<ContactForm />);

      fillForm({
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'I would love to discuss a collaboration opportunity.',
      });
      submitForm();
      await screen.findByText('Message sent!');

      fireEvent.click(
        screen.getByRole('button', { name: 'Send another message' }),
      );

      expect(
        screen.getByRole('button', { name: 'Send message' }),
      ).toBeInTheDocument();
      expect(screen.queryByText('Message sent!')).not.toBeInTheDocument();
    });

    it('shows an error banner instead of success when the server rejects the submission', async () => {
      vi.mocked(fetch).mockResolvedValue(
        new Response(JSON.stringify({ error: 'Server unavailable' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      render(<ContactForm />);

      fillForm({
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'I would love to discuss a collaboration opportunity.',
      });
      submitForm();

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Server unavailable',
      );
      expect(screen.queryByText('Message sent!')).not.toBeInTheDocument();
    });
  });
});
