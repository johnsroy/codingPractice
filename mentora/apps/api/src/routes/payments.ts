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
    const { kind, planId, sessionId, courseId, interval } = req.body as {
      kind: 'subscription' | 'session' | 'course';
      planId?: string;
      sessionId?: string;
      courseId?: string;
      interval?: 'month' | 'year';
    };

    const adapter = getPaymentsAdapter();
    const result = await adapter.createCheckout({
      kind,
      planId,
      sessionId,
      courseId,
      interval,
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
