import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('applies the primary variant by default', () => {
    render(<Button>Primary</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toMatch(/bg-brand-500/);
  });

  it('applies secondary variant classes', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toMatch(/bg-teal-500/);
  });

  it('applies outline variant classes', () => {
    render(<Button variant="outline">Outline</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toMatch(/border-brand-500/);
  });

  it('applies ghost variant classes', () => {
    render(<Button variant="ghost">Ghost</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toMatch(/bg-transparent/);
  });

  it('applies danger variant classes', () => {
    render(<Button variant="danger">Delete</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toMatch(/bg-red-500/);
  });

  it('applies sm size classes', () => {
    render(<Button size="sm">Small</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toMatch(/text-sm/);
  });

  it('applies lg size classes', () => {
    render(<Button size="lg">Large</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toMatch(/text-lg/);
  });

  it('applies xl size classes', () => {
    render(<Button size="xl">XLarge</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toMatch(/text-xl/);
  });

  it('fires onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('does not fire onClick when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    await user.click(btn, { skipPointerEventsCheck: true });
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('is disabled and shows spinner when loading', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button loading onClick={handleClick}>Save</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-disabled', 'true');
    // The Loader2 icon is rendered; clicking should not fire
    await user.click(btn, { skipPointerEventsCheck: true });
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders a leading icon', () => {
    render(<Button icon={<span data-testid="icon-start" />}>With icon</Button>);
    expect(screen.getByTestId('icon-start')).toBeInTheDocument();
  });

  it('renders a trailing icon', () => {
    render(<Button iconEnd={<span data-testid="icon-end" />}>With icon end</Button>);
    expect(screen.getByTestId('icon-end')).toBeInTheDocument();
  });

  it('hides the trailing icon while loading', () => {
    render(<Button loading iconEnd={<span data-testid="icon-end" />}>Loading</Button>);
    expect(screen.queryByTestId('icon-end')).not.toBeInTheDocument();
  });

  it('applies fullWidth class', () => {
    render(<Button fullWidth>Full</Button>);
    expect(screen.getByRole('button').className).toMatch(/w-full/);
  });
});
