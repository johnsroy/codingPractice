import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar } from '../Avatar';

describe('Avatar', () => {
  it('shows initials fallback when no src is provided', () => {
    render(<Avatar name="Alice Smith" />);
    // getInitials("Alice Smith") => "AS"
    expect(screen.getByText('AS')).toBeInTheDocument();
  });

  it('shows "?" when neither src nor name is provided', () => {
    render(<Avatar />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('shows single initial for a single-word name', () => {
    render(<Avatar name="Bob" />);
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('renders an img when src is provided', () => {
    render(<Avatar src="/photo.jpg" name="Carol Doe" />);
    const img = screen.getByAltText("Carol Doe's photo");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/photo.jpg');
  });

  it('has an accessible aria-label containing the name', () => {
    const { container } = render(<Avatar name="Dave Evans" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveAttribute('aria-label', 'Avatar for Dave Evans');
  });

  it('has a generic aria-label when no name is provided', () => {
    const { container } = render(<Avatar />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveAttribute('aria-label', 'User avatar');
  });

  it('applies sm size class', () => {
    const { container } = render(<Avatar name="Eve" size="sm" />);
    expect((container.firstChild as HTMLElement).className).toMatch(/w-8/);
  });

  it('applies lg size class', () => {
    const { container } = render(<Avatar name="Frank" size="lg" />);
    expect((container.firstChild as HTMLElement).className).toMatch(/w-16/);
  });

  it('applies xl size class', () => {
    const { container } = render(<Avatar name="Grace" size="xl" />);
    expect((container.firstChild as HTMLElement).className).toMatch(/w-24/);
  });

  it('hides the initials span from assistive tech via aria-hidden', () => {
    render(<Avatar name="Hank Ives" />);
    const initialsSpan = screen.getByText('HI');
    expect(initialsSpan).toHaveAttribute('aria-hidden', 'true');
  });

  it('sets a background colour only when no src is provided', () => {
    const { container } = render(<Avatar name="Jill" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.backgroundColor).toMatch(/hsl/);
  });

  it('does not set inline background colour when src is provided', () => {
    const { container } = render(<Avatar src="/img.png" name="Kim" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.backgroundColor).toBe('');
  });
});
