'use client';

import React from 'react';
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { BRAND } from '@mentora/shared';
import { useT } from '@/i18n';

export function Footer() {
  const t = useT();

  const footerLinks = {
    [t('footer.learnCol')]: [
      { href: '/teachers', label: t('footer.findTeacher') },
      { href: '/courses', label: t('footer.browseCourses') },
      { href: '/pricing', label: t('footer.plansAndPricing') },
      { href: '/tutor', label: t('footer.aiTutor') },
    ],
    [t('footer.teachCol')]: [
      { href: '/signup?role=TEACHER', label: t('footer.becomeAMentor') },
      { href: '/teach/upload', label: t('footer.uploadMaterials') },
      { href: '/teach/courses/new', label: t('footer.createACourse') },
      { href: '/pricing#teachers', label: t('footer.teacherPlans') },
    ],
    [t('footer.companyCol')]: [
      { href: '/pricing', label: t('footer.pricing') },
      { href: `mailto:${BRAND.supportEmail}`, label: t('footer.support') },
    ],
  };

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
          <p>© {new Date().getFullYear()} {BRAND.name}. {t('footer.allRightsReserved')}</p>
          <p className="text-center">{BRAND.shortTagline}</p>
        </div>
      </div>
    </footer>
  );
}
