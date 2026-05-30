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
} from 'lucide-react';
import { BRAND } from '@mentora/shared';
import { useAuth } from '@/lib/auth';
import { useAccessibility } from '@/lib/accessibility';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';

interface NavLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  authRequired?: boolean;
  roles?: string[];
  guestOnly?: boolean;
}

const navLinks: NavLink[] = [
  { href: '/teachers', label: 'Find a Teacher', icon: <Users size={18} /> },
  { href: '/courses', label: 'Courses', icon: <BookOpen size={18} /> },
  { href: '/pricing', label: 'Pricing', icon: <GraduationCap size={18} /> },
  { href: '/tutor', label: 'AI Tutor', icon: <Bot size={18} />, authRequired: true },
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, authRequired: true },
];

export function Navbar() {
  const { user, isAuthenticated, logout, isTeacher } = useAuth();
  const { toggleFontSize, isLarge } = useAccessibility();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleLinks = navLinks.filter((link) => {
    if (link.authRequired && !isAuthenticated) return false;
    return true;
  });

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-surface-200 shadow-soft">
      <nav className="page-container flex items-center justify-between h-18" aria-label="Main navigation">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 no-underline group" aria-label={`${BRAND.name} home`}>
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center shadow-sm group-hover:bg-brand-600 transition-colors">
            <GraduationCap size={20} className="text-white" />
          </div>
          <span className="font-bold text-xl text-stone-900 tracking-tight">
            {BRAND.name}
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold no-underline transition-colors',
                pathname === link.href
                  ? 'bg-brand-50 text-brand-600'
                  : 'text-stone-600 hover:bg-surface-100 hover:text-stone-900',
              )}
            >
              <span aria-hidden="true">{link.icon}</span>
              {link.label}
            </Link>
          ))}

          {isAuthenticated && isTeacher && (
            <Link
              href="/teach/upload"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold no-underline text-teal-600 hover:bg-teal-50 transition-colors"
            >
              <BookOpen size={18} aria-hidden="true" />
              Teach
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          {/* Accessibility: text size toggle */}
          <button
            onClick={toggleFontSize}
            className="p-2 rounded-lg text-stone-500 hover:bg-surface-100 hover:text-stone-700 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label={isLarge ? 'Switch to normal text size' : 'Switch to larger text size'}
            title={isLarge ? 'Normal text' : 'Larger text'}
          >
            <Type size={18} />
            {isLarge && <span className="ml-1 text-xs font-bold text-brand-600">A+</span>}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link href="/account" aria-label="Your account" className="no-underline">
                <Avatar src={user?.avatarUrl} name={user?.name} size="sm" />
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-stone-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                aria-label="Sign out"
              >
                <LogOut size={17} aria-hidden="true" />
                Sign out
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="no-underline">
                <Button variant="ghost" size="sm" icon={<LogIn size={17} />}>
                  Sign in
                </Button>
              </Link>
              <Link href="/signup" className="no-underline">
                <Button size="sm">Get started free</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-surface-100 transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
          onClick={() => setMobileOpen((o) => !o)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-surface-200 bg-white animate-slide-up">
          <div className="page-container py-4 flex flex-col gap-1">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold no-underline',
                  'min-h-[52px] transition-colors',
                  pathname === link.href
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-stone-700 hover:bg-surface-100',
                )}
              >
                <span aria-hidden="true">{link.icon}</span>
                {link.label}
              </Link>
            ))}

            <div className="pt-4 border-t border-surface-200 flex flex-col gap-2">
              <button
                onClick={() => { toggleFontSize(); setMobileOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-stone-600 hover:bg-surface-100 transition-colors min-h-[52px]"
              >
                <Type size={20} aria-hidden="true" />
                {isLarge ? 'Normal text size' : 'Larger text size'}
              </button>

              {isAuthenticated ? (
                <>
                  <Link
                    href="/account"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl no-underline text-base font-semibold text-stone-700 hover:bg-surface-100 transition-colors min-h-[52px]"
                  >
                    <User size={20} aria-hidden="true" />
                    My Account
                  </Link>
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-red-600 hover:bg-red-50 transition-colors min-h-[52px]"
                  >
                    <LogOut size={20} aria-hidden="true" />
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="no-underline">
                    <Button variant="outline" fullWidth icon={<LogIn size={18} />}>Sign in</Button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileOpen(false)} className="no-underline">
                    <Button fullWidth>Get started free</Button>
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
