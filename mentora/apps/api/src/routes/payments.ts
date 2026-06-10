/**
 * Payments routes.
 *   GET  /payments/plans        — return ALL_PLANS from @mentora/shared
 *   POST /payments/checkout     — create checkout session (subscription / session / course)
 *   POST /payments/webhook      — receive Stripe (or mock) webhook events
 *   GET  /payments/subscription — current user's active subscription
 *   GET  /payments/earnings     — TEACHER payout summary
 */

import { Router } from 'express';
import { ALL_PLANS, checkoutSchema } from '@mentora/shared';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate, requireRole } from '../middleware/auth';
import { getPaymentsAdapter } from '../adapters/payments';
import { prisma } from '../lib/prisma';
import { env } from '../config/env';

export const paymentsRouter = Router();

// GET /payments/plans — publicly accessible
paymentsRouter.get('/plans', (_req, res) => {
  res.json(ALL_PLANS);
});

// POST /payments/checkout
paymentsRouter.post(
  '/checkout',
  authenticate,
  validate(checkoutSchema),
  asyncHandler(async (req, res) => {
    const { kind, planId, sessionId, courseId, interval, currency } = req.body as {
      kind: 'subscription' | 'session' | 'course';
      planId?: string;
      sessionId?: string;
      courseId?: string;
      interval?: 'month' | 'year';
      currency?: 'USD' | 'CAD' | 'INR';
    };

    const adapter = getPaymentsAdapter();
    const result = await adapter.createCheckout({
      kind,
      planId,
      sessionId,
      courseId,
      interval,
      currency,
      userId: req.user!.sub,
      userEmail: req.user!.email,
    });

    res.json(result);
  }),
);

// POST /payments/webhook — raw body required for Stripe signature verification
// Note: app.use(express.raw()) is applied to this route in src/index.ts
paymentsRouter.post(
  '/webhook',
  asyncHandler(async (req, res) => {
    const adapter = getPaymentsAdapter();
    await adapter.handleWebhook(req);
    res.json({ received: true });
  }),
);

// GET /payments/subscription
paymentsRouter.get(
  '/subscription',
  authenticate,
  asyncHandler(async (req, res) => {
    const adapter = getPaymentsAdapter();
    const subscription = await adapter.getSubscription(req.user!.sub);
    res.json({ subscription });
  }),
);

// GET /payments/earnings — teacher-only payout summary
paymentsRouter.get(
  '/earnings',
  authenticate,
  requireRole('TEACHER'),
  asyncHandler(async (req, res) => {
    const adapter = getPaymentsAdapter();
    const earnings = await adapter.getEarnings(req.user!.sub);
    const commissionPct = env.PLATFORM_COMMISSION_PCT;
    res.json({
      ...earnings,
      commissionPct,
      currency: 'USD',
    });
  }),
);

// POST /payments/connect/onboard — start Stripe Connect onboarding (TEACHER only)
paymentsRouter.post(
  '/connect/onboard',
  authenticate,
  requireRole('TEACHER'),
  asyncHandler(async (req, res) => {
    const teacher = await prisma.user.findUniqueOrThrow({
      where: { id: req.user!.sub },
      select: { id: true, email: true, name: true, stripeAccountId: true },
    });

    const adapter = getPaymentsAdapter();
    const { link, stripeAccountId } = await adapter.createConnectOnboarding({
      id: teacher.id,
      email: teacher.email,
      name: teacher.name,
      stripeAccountId: teacher.stripeAccountId,
    });

    // Persist the (possibly new) connected account id on the user record.
    if (stripeAccountId !== teacher.stripeAccountId) {
      await prisma.user.update({
        where: { id: teacher.id },
        data: { stripeAccountId },
      });
    }

    res.json(link);
  }),
);

// GET /payments/connect/status — Stripe Connect account status (TEACHER only)
paymentsRouter.get(
  '/connect/status',
  authenticate,
  requireRole('TEACHER'),
  asyncHandler(async (req, res) => {
    const teacher = await prisma.user.findUniqueOrThrow({
      where: { id: req.user!.sub },
      select: { id: true, stripeAccountId: true },
    });

    const adapter = getPaymentsAdapter();
    const status = await adapter.getConnectStatus({
      id: teacher.id,
      stripeAccountId: teacher.stripeAccountId,
    });

    res.json(status);
  }),
);
