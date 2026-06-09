/**
 * Terms of Service — placeholder legal content in the Mentora brand style.
 * Server component; static content, no client JS required.
 */

import React from 'react';
import Link from 'next/link';
import { ScrollText, AlertTriangle } from 'lucide-react';
import { BRAND } from '@mentora/shared';

export const metadata = {
  title: `Terms of Service — ${BRAND.name}`,
  description: `The terms that govern your use of ${BRAND.name}.`,
};

const LAST_UPDATED = 'June 9, 2026';

const sections = [
  {
    id: 'acceptance',
    title: '1. Acceptance of these terms',
    body: [
      `By creating an account or using ${BRAND.name} (the “Platform”), you agree to these Terms of Service and our Privacy Policy. If you are using the Platform on behalf of a child, you accept these terms on the child's behalf and remain responsible for their use.`,
      'If you do not agree with any part of these terms, please do not use the Platform.',
    ],
  },
  {
    id: 'eligibility',
    title: '2. Accounts and eligibility',
    body: [
      'Learner accounts for children must be created and managed by a parent or legal guardian. Adults creating accounts confirm they are at least 18 years old and provide accurate, current information.',
      'You are responsible for keeping your password confidential and for all activity under your account. Tell us immediately if you suspect unauthorised use.',
    ],
  },
  {
    id: 'marketplace',
    title: '3. The marketplace — teachers and learners',
    body: [
      `${BRAND.name} connects independent teachers (often retired or seasoned professionals) with K-12 learners and their families. Teachers are independent contractors, not employees of ${BRAND.name}.`,
      'Teachers must complete our verification process before badges such as “Verified” are displayed. Verification reduces risk but is not a guarantee; parents should supervise younger learners during live sessions.',
    ],
  },
  {
    id: 'conduct',
    title: '4. Community conduct',
    body: [
      'Be kind and professional. Harassment, discrimination, sharing of inappropriate content, or any attempt to contact minors outside the Platform’s supervised channels is strictly prohibited and grounds for immediate removal.',
      'Live sessions may be monitored or recorded for safety and quality purposes, as described in our Privacy Policy.',
    ],
  },
  {
    id: 'payments',
    title: '5. Payments, refunds and teacher earnings',
    body: [
      'Lesson and subscription prices are shown before you pay. Payments are processed by our third-party payment provider; we do not store full card details.',
      'If a session is cancelled by the teacher, or a technical fault on our side prevents it from taking place, you are entitled to a full refund or a free rebooking. Teachers receive payouts net of the platform commission described in their teacher agreement.',
    ],
  },
  {
    id: 'content',
    title: '6. Content and intellectual property',
    body: [
      'Teachers retain ownership of the materials they upload and grant the Platform a licence to host, display and process them (including AI-assisted summaries and quizzes) to deliver the service.',
      'You may not copy, resell or redistribute course materials, recordings, or AI-generated outputs outside the Platform without permission.',
    ],
  },
  {
    id: 'ai',
    title: '7. AI features',
    body: [
      'The AI tutor and AI-generated study materials are learning aids, not a substitute for a qualified teacher. AI outputs can be wrong; learners and parents should treat them as practice support, not authoritative answers.',
    ],
  },
  {
    id: 'termination',
    title: '8. Suspension and termination',
    body: [
      'We may suspend or terminate accounts that violate these terms, put learners at risk, or attempt to defraud the Platform. You may close your account at any time from your account settings.',
    ],
  },
  {
    id: 'liability',
    title: '9. Disclaimers and limitation of liability',
    body: [
      'The Platform is provided “as is”. To the maximum extent permitted by law, our total liability for any claim related to the service is limited to the amount you paid us in the twelve months before the claim arose.',
      'Nothing in these terms limits liability that cannot be limited under applicable law.',
    ],
  },
  {
    id: 'changes',
    title: '10. Changes to these terms',
    body: [
      'We may update these terms as the Platform evolves. For material changes we will give you advance notice by email or in-app message. Continued use after the effective date means you accept the updated terms.',
    ],
  },
  {
    id: 'contact',
    title: '11. Contact',
    body: [
      `Questions about these terms? Write to us at legal@mentora.example — we read everything.`,
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-72 bg-mesh-warm pointer-events-none" aria-hidden="true" />
      <div className="blob bg-brand-200/30 w-96 h-96 -top-32 -right-24 animate-float-slow" aria-hidden="true" />

      <div className="page-container relative py-16 lg:py-20">
        <article className="max-w-3xl mx-auto">
          {/* Header */}
          <header className="mb-10 animate-fade-up">
            <span className="eyebrow">
              <ScrollText size={14} aria-hidden="true" />
              Legal
            </span>
            <h1 className="mt-5 text-4xl lg:text-5xl font-semibold text-ink-900 text-balance">
              Terms of Service
            </h1>
            <p className="mt-4 text-lg text-ink-700">
              The plain-language agreement between you and {BRAND.name}.
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
              <section key={section.id} aria-labelledby={`terms-${section.id}`}>
                <h2 id={`terms-${section.id}`} className="text-2xl font-semibold text-ink-900 mb-3">
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
              <Link href="/privacy" className="font-semibold text-brand-600 no-underline hover:underline">
                Privacy Policy
              </Link>
              , which explains how we handle your family&apos;s data.
            </p>
          </footer>
        </article>
      </div>
    </div>
  );
}
