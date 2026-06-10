'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
  BookOpen,
  Users,
  LayoutDashboard,
  LogIn,
  Menu,
  X,
  GraduationCap,
  Bot,
  User,
  LogOut,
  Type,
  Globe,
} from 'lucide-react';
import { BRAND } from '@mentora/shared';
import { useAuth } from '@/lib/auth';
import { useAccessibility } from '@/lib/accessibility';
import { useT } from '@/i18n';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

/** The Mentora logo mark — a gradient rounded square with a graduation cap. */
function LogoMark({ size = 38 }: { size?: number }) {
  return (
    <span
      className="relative inline-flex items-center justify-center rounded-2xl bg-brand-gradient shadow-glow"
      style={{ width: size, height: size }}
    >
      <GraduationCap size={size * 0.55} className="text-white" />
      <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-accent-400 ring-2 ring-white" />
    </span>
  );
}

export function Navbar() {
  const { user, isAuthenticated, logout, isTeacher } = useAuth();
  const { toggleFontSize, isLarge } = useAccessibility();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = useT();

  const navLinks = [
    { href: '/teachers', label: t('nav.findTeacher'), icon: <Users size={18} />, authRequired: false },
    { href: '/courses', label: t('nav.courses'), icon: <BookOpen size={18} />, authRequired: false },
    { href: '/pricing', label: t('nav.pricing'), icon: <GraduationCap size={18} />, authRequired: false },
    { href: '/tutor', label: t('nav.aiTutor'), icon: <Bot size={18} />, authRequired: true },
    { href: '/dashboard', label: t('nav.dashboard'), icon: <LayoutDashboard size={18} />, authRequired: true },
  ];

  const visibleLinks = navLinks.filter((link) => !(link.authRequired && !isAuthenticated));

  const linkClass = (active: boolean) =>
    clsx(
      'flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold no-underline whitespace-nowrap transition-all',
      active
        ? 'bg-brand-50 text-brand-700 shadow-soft'
        : 'text-ink-700 hover:bg-surface-100 hover:text-ink-900',
    );

  return (
    <header className="sticky top-0 z-40 glass border-b border-surface-200/70">
      <nav className="page-container flex items-center justify-between gap-2 h-18" aria-label="Main navigation">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 no-underline group shrink-0" aria-label={`${BRAND.name} home`}>
          <span className="transition-transform group-hover:scale-105">
            <LogoMark />
          </span>
          <span className="font-display font-semibold text-2xl text-ink-900 tracking-tight">
            {BRAND.name}
          </span>
        </Link>

        {/* Desktop nav — only at lg+ so it never crowds at mid widths */}
        <div className="hidden lg:flex items-center gap-1">
          {visibleLinks.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(pathname === link.href)}>
              <span aria-hidden="true">{link.icon}</span>
              {link.label}
            </Link>
          ))}

          {isAuthenticated && isTeacher && (
            <>
              <Link
                href="/teach/upload"
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold no-underline whitespace-nowrap transition-all',
                  'text-teal-700 hover:bg-teal-50',
                )}
              >
                <BookOpen size={18} aria-hidden="true" />
                {t('nav.teach')}
              </Link>
              <Link href="/teach/research" className={linkClass(pathname === '/teach/research')}>
                <Globe size={18} aria-hidden="true" />
                {t('nav.research')}
              </Link>
            </>
          )}
        </div>

        {/* Right cluster */}
        <div className="hidden lg:flex items-center gap-1.5 shrink-0">
          <LanguageSwitcher />

          <button
            onClick={toggleFontSize}
            className="rounded-full text-ink-700 hover:bg-surface-100 hover:text-ink-900 transition-colors min-h-[40px] min-w-[40px] px-2 flex items-center justify-center"
            aria-label={isLarge ? t('nav.switchToNormal') : t('nav.switchToLarger')}
            title={isLarge ? t('nav.normalText') : t('nav.largerText')}
          >
            <Type size={18} />
            {isLarge && <span className="ml-1 text-xs font-bold text-brand-600">A+</span>}
          </button>

          <span className="mx-1 h-6 w-px bg-surface-200" aria-hidden="true" />

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link href="/account" aria-label="Your account" className="no-underline rounded-full hover:ring-2 hover:ring-brand-200 transition">
                <Avatar src={user?.avatarUrl} name={user?.name} size="sm" />
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold whitespace-nowrap text-ink-700 hover:text-coral-600 hover:bg-coral-50 transition-colors"
                aria-label={t('nav.signOut')}
              >
                <LogOut size={17} aria-hidden="true" />
                {t('nav.signOut')}
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="no-underline">
                <Button variant="ghost" size="sm" icon={<LogIn size={17} />}>
                  {t('nav.signIn')}
                </Button>
              </Link>
              <Link href="/signup" className="no-underline">
                <Button size="sm" className="btn-sheen shadow-glow">{t('nav.getStartedFree')}</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden rounded-xl text-ink-800 hover:bg-surface-100 transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
          onClick={() => setMobileOpen((o) => !o)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? t('nav.closeMenu') : t('nav.openMenu')}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-surface-200 bg-surface-50 animate-slide-up">
          <div className="page-container py-4 flex flex-col gap-1">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-semibold no-underline min-h-[52px] transition-colors',
                  pathname === link.href ? 'bg-brand-50 text-brand-700' : 'text-ink-800 hover:bg-surface-100',
                )}
              >
                <span aria-hidden="true">{link.icon}</span>
                {link.label}
              </Link>
            ))}

            {isAuthenticated && isTeacher && (
              <>
                <Link
                  href="/teach/upload"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-semibold no-underline min-h-[52px] text-teal-700 hover:bg-teal-50 transition-colors"
                >
                  <BookOpen size={20} aria-hidden="true" />
                  {t('nav.teach')}
                </Link>
                <Link
                  href="/teach/research"
                  onClick={() => setMobileOpen(false)}
                  className={clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-semibold no-underline min-h-[52px] transition-colors',
                    pathname === '/teach/research' ? 'bg-brand-50 text-brand-700' : 'text-ink-800 hover:bg-surface-100',
                  )}
                >
                  <Globe size={20} aria-hidden="true" />
                  {t('nav.researchATopic')}
                </Link>
              </>
            )}

            <div className="pt-4 mt-2 border-t border-surface-200 flex flex-col gap-2">
              <div className="flex items-center gap-3 px-4 py-1">
                <LanguageSwitcher />
              </div>

              <button
                onClick={() => { toggleFontSize(); setMobileOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-semibold text-ink-700 hover:bg-surface-100 transition-colors min-h-[52px]"
              >
                <Type size={20} aria-hidden="true" />
                {isLarge ? t('nav.normalTextSize') : t('nav.largerTextSize')}
              </button>

              {isAuthenticated ? (
                <>
                  <Link
                    href="/account"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl no-underline text-base font-semibold text-ink-800 hover:bg-surface-100 transition-colors min-h-[52px]"
                  >
                    <User size={20} aria-hidden="true" />
                    {t('nav.myAccount')}
                  </Link>
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-semibold text-coral-600 hover:bg-coral-50 transition-colors min-h-[52px]"
                  >
                    <LogOut size={20} aria-hidden="true" />
                    {t('nav.signOut')}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="no-underline">
                    <Button variant="outline" fullWidth icon={<LogIn size={18} />}>{t('nav.signIn')}</Button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileOpen(false)} className="no-underline">
                    <Button fullWidth>{t('nav.getStartedFree')}</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
