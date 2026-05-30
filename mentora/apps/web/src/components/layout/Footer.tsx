import React from 'react';
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { BRAND } from '@mentora/shared';

const footerLinks = {
  'Learn': [
    { href: '/teachers', label: 'Find a Teacher' },
    { href: '/courses', label: 'Browse Courses' },
    { href: '/pricing', label: 'Plans & Pricing' },
    { href: '/tutor', label: 'AI Tutor' },
  ],
  'Teach': [
    { href: '/signup?role=TEACHER', label: 'Become a Mentor' },
    { href: '/teach/upload', label: 'Upload Materials' },
    { href: '/teach/courses/new', label: 'Create a Course' },
    { href: '/pricing#teachers', label: 'Teacher Plans' },
  ],
  'Company': [
    { href: '/pricing', label: 'Pricing' },
    { href: `mailto:${BRAND.supportEmail}`, label: 'Support' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 mt-auto">
      <div className="page-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
                <GraduationCap size={20} className="text-white" />
              </div>
              <span className="font-bold text-xl text-white">{BRAND.name}</span>
            </div>
            <p className="text-sm leading-relaxed text-stone-400 max-w-xs">
              {BRAND.tagline}
            </p>
            <p className="mt-4 text-sm text-stone-500">
              <a
                href={`mailto:${BRAND.supportEmail}`}
                className="text-stone-400 hover:text-white no-underline transition-colors"
              >
                {BRAND.supportEmail}
              </a>
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">
                {title}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-stone-400 hover:text-white no-underline transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-stone-500">
          <p>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
          <p className="text-center">{BRAND.shortTagline}</p>
        </div>
      </div>
    </footer>
  );
}
