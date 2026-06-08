import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../Input';

describe('Input', () => {
  it('renders without a label by default', () => {
    render(<Input placeholder="Type here" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders a visible label associated with the input', () => {
    render(<Input label="Email address" name="email" />);
    const input = screen.getByLabelText(/email address/i);
    expect(input).toBeInTheDocument();
  });

  it('marks the label with a required asterisk when required', () => {
    render(<Input label="Password" name="password" required />);
    // The asterisk span has aria-label="required"
    expect(screen.getByLabelText(/required/i)).toBeInTheDocument();
  });

  it('shows an error message with role="alert"', () => {
    render(<Input label="Email" name="email" error="Invalid email" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Invalid email');
  });

  it('sets aria-invalid when there is an error', () => {
    render(<Input label="Email" name="email" error="Required" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('links the input to its error via aria-describedby', () => {
    render(<Input id="my-email" label="Email" error="Bad email" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-describedby', 'my-email-error');
  });

  it('does not show aria-invalid when there is no error', () => {
    render(<Input label="Name" name="name" />);
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');
  });

  it('calls onChange when the user types', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Input label="Search" name="q" onChange={handleChange} />);
    await user.type(screen.getByRole('textbox'), 'hello');
    expect(handleChange).toHaveBeenCalled();
  });

  it('reflects a controlled value', () => {
    render(<Input label="Name" name="name" value="Alice" onChange={vi.fn()} />);
    expect(screen.getByRole('textbox')).toHaveValue('Alice');
  });

  it('renders a hint when provided and no error', () => {
    render(<Input label="Username" name="username" hint="Must be unique" />);
    expect(screen.getByText(/must be unique/i)).toBeInTheDocument();
  });

  it('does not show the hint when an error is present', () => {
    render(<Input label="Username" name="username" hint="Must be unique" error="Already taken" />);
    expect(screen.queryByText(/must be unique/i)).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Already taken');
  });

  it('is disabled when the disabled prop is set', () => {
    render(<Input label="Field" name="field" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});
