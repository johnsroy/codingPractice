import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('renders the title', () => {
    render(<EmptyState title="Nothing here" />);
    expect(screen.getByRole('heading', { name: 'Nothing here' })).toBeInTheDocument();
  });

  it('renders an optional description', () => {
    render(<EmptyState title="Empty" description="Add something to get started" />);
    expect(screen.getByText('Add something to get started')).toBeInTheDocument();
  });

  it('does not render a description when omitted', () => {
    render(<EmptyState title="No description" />);
    // Only the heading should be present; no stray paragraph
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
  });

  it('renders an icon when provided', () => {
    render(
      <EmptyState
        title="With icon"
        icon={<svg data-testid="test-icon" />}
      />,
    );
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('does not render an icon container when icon is omitted', () => {
    const { container } = render(<EmptyState title="No icon" />);
    // There should be no rounded-full icon wrapper
    expect(container.querySelector('.rounded-full')).not.toBeInTheDocument();
  });

  it('renders an action button when onClick is provided', () => {
    render(
      <EmptyState
        title="Click me"
        action={{ label: 'Add item', onClick: vi.fn() }}
      />,
    );
    expect(screen.getByRole('button', { name: 'Add item' })).toBeInTheDocument();
  });

  it('fires the onClick handler when the action button is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <EmptyState
        title="Clickable"
        action={{ label: 'Do it', onClick }}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Do it' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders an action link when href is provided', () => {
    render(
      <EmptyState
        title="Link action"
        action={{ label: 'Go somewhere', href: '/courses' }}
      />,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/courses');
  });

  it('shows the link label text', () => {
    render(
      <EmptyState
        title="Link"
        action={{ label: 'Browse courses', href: '/courses' }}
      />,
    );
    expect(screen.getByText('Browse courses')).toBeInTheDocument();
  });

  it('does not render any action when action prop is omitted', () => {
    render(<EmptyState title="No action" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('merges extra className onto the root element', () => {
    const { container } = render(<EmptyState title="Custom" className="my-spacing" />);
    expect((container.firstChild as HTMLElement).className).toMatch(/my-spacing/);
  });
});
