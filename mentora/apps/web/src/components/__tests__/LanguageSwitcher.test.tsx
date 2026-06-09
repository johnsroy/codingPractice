/**
 * LanguageSwitcher — component test
 *
 * - Wraps the switcher in LanguageProvider.
 * - Switches to Hindi (hi) and asserts a known translated string renders.
 * - Mocks next/navigation (usePathname used in Navbar; not needed here but
 *   avoids any accidental import-time crash).
 * - No network calls — locale files are synchronously bundled by Vitest.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageProvider, useT } from '@/i18n';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

// ---------------------------------------------------------------------------
// Mock next/navigation — not used by LanguageSwitcher, but avoids crashes if
// any transitive import tries to call useRouter / usePathname.
// ---------------------------------------------------------------------------
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/',
}));

// ---------------------------------------------------------------------------
// Mock localStorage for the provider
// ---------------------------------------------------------------------------
const localStorageMock: Record<string, string> = {};
beforeEach(() => {
  Object.keys(localStorageMock).forEach((k) => delete localStorageMock[k]);
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation((k) => localStorageMock[k] ?? null);
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation((k, v) => { localStorageMock[k] = v; });
});

// ---------------------------------------------------------------------------
// Helper component — renders the switcher + a translated string
// ---------------------------------------------------------------------------
function TestPage() {
  const t = useT();
  return (
    <div>
      <LanguageSwitcher />
      <p data-testid="find-teacher">{t('nav.findTeacher')}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('LanguageSwitcher', () => {
  it('renders with aria-label "Choose language"', () => {
    render(
      <LanguageProvider>
        <LanguageSwitcher />
      </LanguageProvider>,
    );
    expect(screen.getByRole('combobox', { name: /choose language/i })).toBeInTheDocument();
  });

  it('defaults to English — shows "Find a Teacher"', () => {
    render(
      <LanguageProvider>
        <TestPage />
      </LanguageProvider>,
    );
    expect(screen.getByTestId('find-teacher')).toHaveTextContent('Find a Teacher');
  });

  it('shows all 4 language options', () => {
    render(
      <LanguageProvider>
        <LanguageSwitcher />
      </LanguageProvider>,
    );
    const select = screen.getByRole('combobox', { name: /choose language/i });
    const options = Array.from(select.querySelectorAll('option'));
    expect(options).toHaveLength(4);
    const values = options.map((o) => o.getAttribute('value'));
    expect(values).toContain('en');
    expect(values).toContain('hi');
    expect(values).toContain('pa');
    expect(values).toContain('bn');
  });

  it('switching to Hindi changes nav.findTeacher to Hindi text', async () => {
    const user = userEvent.setup();
    render(
      <LanguageProvider>
        <TestPage />
      </LanguageProvider>,
    );

    // Default: English
    expect(screen.getByTestId('find-teacher')).toHaveTextContent('Find a Teacher');

    // Switch to Hindi
    const select = screen.getByRole('combobox', { name: /choose language/i });
    await user.selectOptions(select, 'hi');

    // After switch, the Hindi translation for nav.findTeacher should render
    await waitFor(() =>
      expect(screen.getByTestId('find-teacher')).toHaveTextContent('शिक्षक खोजें'),
    );
  });

  it('switching back to English restores English text', async () => {
    const user = userEvent.setup();
    render(
      <LanguageProvider>
        <TestPage />
      </LanguageProvider>,
    );

    const select = screen.getByRole('combobox', { name: /choose language/i });

    // Switch to Punjabi first
    await user.selectOptions(select, 'pa');
    await waitFor(() =>
      expect(screen.getByTestId('find-teacher')).toHaveTextContent('ਅਧਿਆਪਕ ਲੱਭੋ'),
    );

    // Switch back to English
    await user.selectOptions(select, 'en');
    await waitFor(() =>
      expect(screen.getByTestId('find-teacher')).toHaveTextContent('Find a Teacher'),
    );
  });

  it('useT() falls back to English when no LanguageProvider is present', () => {
    // Render TestPage WITHOUT a provider — must not throw
    function IsolatedComponent() {
      const t = useT();
      return <p data-testid="out">{t('nav.findTeacher')}</p>;
    }
    // Should not throw
    expect(() => render(<IsolatedComponent />)).not.toThrow();
    expect(screen.getByTestId('out')).toHaveTextContent('Find a Teacher');
  });

  it('persists language choice to localStorage key mentora_lang', async () => {
    const user = userEvent.setup();
    render(
      <LanguageProvider>
        <LanguageSwitcher />
      </LanguageProvider>,
    );
    const select = screen.getByRole('combobox', { name: /choose language/i });
    await user.selectOptions(select, 'bn');
    expect(localStorageMock['mentora_lang']).toBe('bn');
  });
});
