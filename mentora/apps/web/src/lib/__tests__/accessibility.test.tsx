import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccessibilityProvider, useAccessibility } from '../accessibility';

const STORAGE_KEY = 'mentora_font_size';

// A tiny consumer component that exposes the context values.
function FontSizeToggle() {
  const { fontSize, isLarge, toggleFontSize } = useAccessibility();
  return (
    <div>
      <span data-testid="font-size-value">{fontSize}</span>
      <span data-testid="is-large">{String(isLarge)}</span>
      <button
        onClick={toggleFontSize}
        aria-label={isLarge ? 'Switch to normal text' : 'Switch to larger text'}
      >
        Toggle font size
      </button>
    </div>
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return <AccessibilityProvider>{children}</AccessibilityProvider>;
}

describe('AccessibilityProvider + useAccessibility', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-font-size');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-font-size');
  });

  it('starts with fontSize="normal" by default', () => {
    render(<FontSizeToggle />, { wrapper: Wrapper });
    expect(screen.getByTestId('font-size-value')).toHaveTextContent('normal');
  });

  it('starts with isLarge=false by default', () => {
    render(<FontSizeToggle />, { wrapper: Wrapper });
    expect(screen.getByTestId('is-large')).toHaveTextContent('false');
  });

  it('hydrates "large" from localStorage on mount', () => {
    localStorage.setItem(STORAGE_KEY, 'large');
    render(<FontSizeToggle />, { wrapper: Wrapper });
    expect(screen.getByTestId('font-size-value')).toHaveTextContent('large');
    expect(screen.getByTestId('is-large')).toHaveTextContent('true');
  });

  it('sets data-font-size="large" on <html> when hydrating from storage', () => {
    localStorage.setItem(STORAGE_KEY, 'large');
    render(<FontSizeToggle />, { wrapper: Wrapper });
    expect(document.documentElement.getAttribute('data-font-size')).toBe('large');
  });

  it('toggles fontSize from normal to large when the button is clicked', async () => {
    const user = userEvent.setup();
    render(<FontSizeToggle />, { wrapper: Wrapper });
    await user.click(screen.getByRole('button', { name: /larger text/i }));
    expect(screen.getByTestId('font-size-value')).toHaveTextContent('large');
  });

  it('persists "large" to localStorage after toggling on', async () => {
    const user = userEvent.setup();
    render(<FontSizeToggle />, { wrapper: Wrapper });
    await user.click(screen.getByRole('button', { name: /larger text/i }));
    expect(localStorage.getItem(STORAGE_KEY)).toBe('large');
  });

  it('sets data-font-size attribute on <html> after toggling to large', async () => {
    const user = userEvent.setup();
    render(<FontSizeToggle />, { wrapper: Wrapper });
    await user.click(screen.getByRole('button', { name: /larger text/i }));
    expect(document.documentElement.getAttribute('data-font-size')).toBe('large');
  });

  it('toggles back to normal from large', async () => {
    const user = userEvent.setup();
    render(<FontSizeToggle />, { wrapper: Wrapper });
    // Toggle on
    await user.click(screen.getByRole('button', { name: /larger text/i }));
    // Toggle off
    await user.click(screen.getByRole('button', { name: /normal text/i }));
    expect(screen.getByTestId('font-size-value')).toHaveTextContent('normal');
  });

  it('removes data-font-size attribute after toggling back to normal', async () => {
    const user = userEvent.setup();
    render(<FontSizeToggle />, { wrapper: Wrapper });
    await user.click(screen.getByRole('button', { name: /larger text/i }));
    await user.click(screen.getByRole('button', { name: /normal text/i }));
    expect(document.documentElement.hasAttribute('data-font-size')).toBe(false);
  });

  it('persists "normal" to localStorage after toggling off', async () => {
    const user = userEvent.setup();
    render(<FontSizeToggle />, { wrapper: Wrapper });
    await user.click(screen.getByRole('button', { name: /larger text/i }));
    await user.click(screen.getByRole('button', { name: /normal text/i }));
    expect(localStorage.getItem(STORAGE_KEY)).toBe('normal');
  });

  it('the toggle button has an accessible name', () => {
    render(<FontSizeToggle />, { wrapper: Wrapper });
    const btn = screen.getByRole('button', { name: /larger text/i });
    // accessible name must be non-empty
    expect(btn).toHaveAccessibleName();
  });

  it('throws when useAccessibility is used outside the provider', () => {
    // Suppress the expected console.error from React
    const consoleError = console.error;
    console.error = () => {};
    expect(() => {
      render(<FontSizeToggle />);
    }).toThrow('useAccessibility must be used within AccessibilityProvider');
    console.error = consoleError;
  });
});
