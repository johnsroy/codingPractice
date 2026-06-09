/**
 * Privacy Policy — placeholder legal content in the Mentora brand style.
 * Server component; static content, no client JS required.
 *
 * Because Mentora serves K-12 learners, this template is written in the spirit
 * of children's-privacy law (US COPPA, India DPDP Act) — verifiable parental
 * consent, data minimisation, and no advertising profiles of minors.
 */

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { BRAND } from '@mentora/shared';

export const metadata = {
  title: `Privacy Policy — ${BRAND.name}`,
  description: `How ${BRAND.name} collects, uses and protects your family's data.`,
};

const LAST_UPDATED = 'June 9, 2026';

const sections = [
  {
    id: 'overview',
    title: '1. The short version',
    body: [
      `${BRAND.name} exists to connect young learners with seasoned mentors — not to monetise data. We collect only what we need to run the service, we never sell personal information, and we never build advertising profiles of children.`,
    ],
  },
  {
    id: 'children',
    title: '2. Children’s data and parental consent',
    body: [
      'Many of our learners are minors, so children’s privacy is the foundation of this policy. A learner account for a child must be created by a parent or legal guardian, who provides verifiable consent before the child can use the Platform — in the spirit of the US Children’s Online Privacy Protection Act (COPPA) and India’s Digital Personal Data Protection (DPDP) Act, 2023.',
      'For child learners we collect the minimum needed to teach: a first name or display name, grade level, the guardian’s contact email, and learning activity (courses joined, session attendance, quiz progress). We do not request a child’s phone number, precise location, or government identifiers.',
      'Parents and guardians may review their child’s information, correct it, withdraw consent, or ask us to delete the child’s account and data at any time from account settings or by emailing privacy@mentora.example. We do not show targeted advertising to children, and we do not allow teachers to contact minors outside the Platform’s supervised channels.',
    ],
  },
  {
    id: 'collect',
    title: '3. What we collect',
    body: [
      'Account data: name, email, password (stored as a salted hash), role (learner, parent, teacher) and profile details teachers choose to share, such as a headline, subjects and career history.',
      'Learning data: enrolments, session bookings and attendance, messages sent through the Platform, quiz results and AI-tutor conversations (used to provide the feature and improve answer quality).',
      'Payment data: handled by our payment provider; we receive only transaction confirmations and the last four digits of a card, never full card numbers.',
      'Technical data: device type, browser, and basic logs used for security and to keep live classrooms working.',
    ],
  },
  {
    id: 'use',
    title: '4. How we use it',
    body: [
      'To run the marketplace: matching learners with teachers, scheduling and hosting live sessions, processing payments and payouts.',
      'To keep people safe: verifying teacher identities and credentials, moderating live classrooms, and detecting abuse or attempts to move conversations with minors off-platform.',
      'To improve learning: progress tracking, AI-generated practice material, and anonymised, aggregated analytics. We do not use children’s personal data to train third-party AI models.',
    ],
  },
  {
    id: 'sharing',
    title: '5. When we share data',
    body: [
      'We share data only with service providers who help us operate (hosting, video infrastructure, payments, email), under contracts that restrict their use of it; with teachers, who see the learner information needed to teach a session; and with authorities when the law genuinely requires it.',
      'We never sell personal data, and we never share children’s data for marketing.',
    ],
  },
  {
    id: 'retention',
    title: '6. Retention and deletion',
    body: [
      'We keep personal data only as long as the account is active or as required for legal and accounting purposes. When an account is deleted, personal data is erased or anonymised within 30 days, except where the law requires longer retention (for example, payment records).',
      'Session recordings made for safety review are retained for a short, fixed window and then deleted automatically.',
    ],
  },
  {
    id: 'security',
    title: '7. How we protect data',
    body: [
      'All traffic is encrypted in transit (TLS) and personal data is encrypted at rest. Access inside our team is role-based and logged. Teachers go through identity verification before they can host sessions with minors.',
      'No system is perfectly secure — if we ever discover a breach affecting your data, we will notify you and the relevant authorities promptly.',
    ],
  },
  {
    id: 'rights',
    title: '8. Your rights',
    body: [
      'Depending on where you live, you may have the right to access, correct, export or delete your personal data, to object to certain processing, and to lodge a complaint with your data-protection authority (such as the Data Protection Board of India under the DPDP Act).',
      'Parents and guardians can exercise all of these rights on behalf of their children. To make a request, email privacy@mentora.example — we respond within 30 days.',
    ],
  },
  {
    id: 'changes',
    title: '9. Changes to this policy',
    body: [
      'If we make material changes — especially anything affecting children’s data — we will notify parents and guardians by email before the changes take effect, and ask for fresh consent where the law requires it.',
    ],
  },
  {
    id: 'contact',
    title: '10. Contact us',
    body: [
      `Privacy questions or requests: privacy@mentora.example. Grievance officer (India DPDP): grievance@mentora.example.`,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-72 bg-mesh-warm pointer-events-none" aria-hidden="true" />
      <div className="blob bg-teal-200/30 w-96 h-96 -top-32 -right-24 animate-float-slow" aria-hidden="true" />

      <div className="page-container relative py-16 lg:py-20">
        <article className="max-w-3xl mx-auto">
          {/* Header */}
          <header className="mb-10 animate-fade-up">
            <span className="eyebrow">
              <ShieldCheck size={14} className="text-teal-600" aria-hidden="true" />
              Legal · Your family&apos;s data
            </span>
            <h1 className="mt-5 text-4xl lg:text-5xl font-semibold text-ink-900 text-balance">
              Privacy Policy
            </h1>
            <p className="mt-4 text-lg text-ink-700">
              How {BRAND.name} collects, uses and protects data — with children&apos;s
              privacy first.
            </p>
            <p className="mt-2 text-sm font-medium text-ink-700/70">
              Last updated: <time dateTime="2026-06-09">{LAST_UPDATED}</time>
            </p>
          </header>

          {/* Development callout */}
          <div
            role="note"
            className="mb-12 flex items-start gap-3 rounded-2xl border border-accent-200 bg-accent-50 px-5 py-4 text-accent-800"
          >
            <AlertTriangle size={20} className="mt-0.5 shrink-0 text-accent-600" aria-hidden="true" />
            <p className="text-sm font-medium">
              This is a template for development — review with legal counsel before launch.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-10">
            {sections.map((section) => (
              <section key={section.id} aria-labelledby={`privacy-${section.id}`}>
                <h2 id={`privacy-${section.id}`} className="text-2xl font-semibold text-ink-900 mb-3">
                  {section.title}
                </h2>
                <div className="space-y-3">
                  {section.body.map((paragraph, i) => (
                    <p key={i} className="text-ink-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Footer cross-link */}
          <footer className="mt-14 pt-8 border-t border-surface-200 text-ink-700">
            <p>
              See also our{' '}
              <Link href="/terms" className="font-semibold text-brand-600 no-underline hover:underline">
                Terms of Service
              </Link>
              , which govern your use of the Platform.
            </p>
          </footer>
        </article>
      </div>
    </div>
  );
}
