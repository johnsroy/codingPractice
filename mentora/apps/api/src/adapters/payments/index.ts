/**
 * Payments Adapter
 * ----------------
 * Handles subscriptions, session bookings, and course purchases.
 * Implementations:
 *   - "mock"   (default) — immediately marks payments succeeded; creates DB rows;
 *                          correctly applies splitEarnings commission from @mentora/shared.
 *   - "stripe" (production) — Stripe Checkout Sessions + webhook verification +
 *                             Connect-style payout accounting.
 *
 * splitEarnings(gross, tier) is the single source of truth for commission math.
 * Pro-tier teachers (proTier=true) pay 10% commission; standard teachers 15%.
 */

import type { Request } from 'express';
import { splitEarnings, getPlan } from '@mentora/shared';
import type { ConnectAccountStatus, ConnectOnboardingLink } from '@mentora/shared';
import { prisma } from '../../lib/prisma';
import { env } from '../../config/env';
import { badRequest } from '../../lib/errors';

export interface CheckoutInput {
  kind: 'subscription' | 'session' | 'course';
  planId?: string;
  sessionId?: string;
  courseId?: string;
  interval?: 'month' | 'year';
  userId: string;
  userEmail: string;
}

export interface CheckoutResult {
  provider: 'mock' | 'stripe';
  /** URL to redirect the client to (Stripe Checkout URL, or mock confirmation URL). */
  url: string;
  /** Immediately resolved payment id (mock only) or Stripe session id. */
  paymentId?: string;
}

export interface ConnectTeacher {
  id: string;
  email: string;
  name: string;
  stripeAccountId?: string | null;
}

export interface PaymentsAdapter {
  createCheckout(input: CheckoutInput): Promise<CheckoutResult>;
  handleWebhook(req: Request): Promise<void>;
  getSubscription(userId: string): Promise<{
    id: string;
    planId: string;
    status: string;
    currentPeriodEnd: string;
    provider: string;
  } | null>;
  getEarnings(teacherId: string): Promise<{
    totalPayoutCents: number;
    totalGrossCents: number;
    totalPlatformFeeCents: number;
    paymentCount: number;
  }>;
  /**
   * Create (or resume) a Stripe Connect onboarding link for a teacher.
   * Returns the URL to redirect to and the (possibly new) stripeAccountId to persist.
   */
  createConnectOnboarding(teacher: ConnectTeacher): Promise<{
    link: ConnectOnboardingLink;
    stripeAccountId: string;
  }>;
  /**
   * Return the current Stripe Connect account status for a teacher.
   */
  getConnectStatus(teacher: { id: string; stripeAccountId?: string | null }): Promise<ConnectAccountStatus>;
}

// ─── Mock adapter ─────────────────────────────────────────────────────────────

class MockPaymentsAdapter implements PaymentsAdapter {
  async createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    if (input.kind === 'subscription') {
      const planId = input.planId ?? 'explorer';
      const plan = getPlan(planId);
      if (!plan) throw badRequest(`Unknown plan: ${planId}`);

      // Calculate price based on interval
      const amountCents =
        input.interval === 'year' && plan.annualPriceCents != null
          ? plan.annualPriceCents
          : plan.priceCents;

      // Cancel any existing active subscription
      await prisma.subscription.updateMany({
        where: { userId: input.userId, status: { in: ['active', 'trialing'] } },
        data: { status: 'cancelled' },
      });

      const periodEnd = new Date();
      periodEnd.setMonth(
        periodEnd.getMonth() + (input.interval === 'year' ? 12 : 1),
      );

      const sub = await prisma.subscription.create({
        data: {
          userId: input.userId,
          planId,
          status: 'active',
          currentPeriodEnd: periodEnd,
          provider: 'mock',
        },
      });

      // Record payment (free plans don't need a payment record)
      if (amountCents > 0) {
        await prisma.payment.create({
          data: {
            payerId: input.userId,
            amountCents,
            currency: 'USD',
            kind: 'subscription',
            status: 'succeeded',
            provider: 'mock',
          },
        });
      }

      return {
        provider: 'mock',
        url: `${env.WEB_URL}/dashboard?subscribed=${planId}`,
        paymentId: sub.id,
      };
    }

    if (input.kind === 'session') {
      if (!input.sessionId) throw badRequest('sessionId is required for session checkout.');
      const session = await prisma.classSession.findUnique({
        where: { id: input.sessionId },
        include: { teacher: true },
      });
      if (!session) throw badRequest('Session not found.');

      const tier = session.teacher.proTier ? 'pro' : 'standard';
      const split = splitEarnings(session.priceCents, tier);

      // Check if already enrolled
      const existing = await prisma.enrollment.findFirst({
        where: { studentId: input.userId, sessionId: input.sessionId },
      });
      if (existing) {
        return {
          provider: 'mock',
          url: `${env.WEB_URL}/sessions/${input.sessionId}?already_enrolled=true`,
        };
      }

      // Create enrollment
      await prisma.enrollment.create({
        data: {
          studentId: input.userId,
          sessionId: input.sessionId,
          status: 'active',
        },
      });

      // Record payment with commission split
      const payment = await prisma.payment.create({
        data: {
          payerId: input.userId,
          amountCents: session.priceCents,
          currency: 'USD',
          kind: 'session',
          status: 'succeeded',
          provider: 'mock',
          platformFeeCents: split.platformFeeCents,
          payoutCents: split.payoutCents,
          payeeId: session.teacherId,
        },
      });

      return {
        provider: 'mock',
        url: `${env.WEB_URL}/sessions/${input.sessionId}?booked=true`,
        paymentId: payment.id,
      };
    }

    if (input.kind === 'course') {
      if (!input.courseId) throw badRequest('courseId is required for course checkout.');
      const course = await prisma.course.findUnique({
        where: { id: input.courseId },
        include: { teacher: true },
      });
      if (!course) throw badRequest('Course not found.');

      // Check if already enrolled
      const existing = await prisma.enrollment.findFirst({
        where: { studentId: input.userId, courseId: input.courseId },
      });
      if (existing) {
        return {
          provider: 'mock',
          url: `${env.WEB_URL}/courses/${input.courseId}?already_enrolled=true`,
        };
      }

      const tier = course.teacher.proTier ? 'pro' : 'standard';
      const split = splitEarnings(course.priceCents, tier);

      await prisma.enrollment.create({
        data: {
          studentId: input.userId,
          courseId: input.courseId,
          status: 'active',
        },
      });

      const payment = await prisma.payment.create({
        data: {
          payerId: input.userId,
          amountCents: course.priceCents,
          currency: 'USD',
          kind: 'course',
          status: 'succeeded',
          provider: 'mock',
          platformFeeCents: split.platformFeeCents,
          payoutCents: split.payoutCents,
          payeeId: course.teacherId,
        },
      });

      return {
        provider: 'mock',
        url: `${env.WEB_URL}/courses/${input.courseId}?enrolled=true`,
        paymentId: payment.id,
      };
    }

    throw badRequest(`Unknown checkout kind: ${input.kind}`);
  }

  async handleWebhook(_req: Request): Promise<void> {
    // Mock adapter has no real webhooks — this is a no-op
    console.log('[payments:mock] Webhook received (no-op in mock mode).');
  }

  async getSubscription(userId: string) {
    const sub = await prisma.subscription.findFirst({
      where: { userId, status: { in: ['active', 'trialing'] } },
      orderBy: { createdAt: 'desc' },
    });
    if (!sub) return null;
    return {
      id: sub.id,
      planId: sub.planId,
      status: sub.status,
      currentPeriodEnd: sub.currentPeriodEnd.toISOString(),
      provider: sub.provider,
    };
  }

  async getEarnings(teacherId: string) {
    const payments = await prisma.payment.findMany({
      where: {
        payeeId: teacherId,
        status: 'succeeded',
        kind: { in: ['session', 'course'] },
      },
    });

    const totalGrossCents = payments.reduce((s, p) => s + p.amountCents, 0);
    const totalPlatformFeeCents = payments.reduce(
      (s, p) => s + (p.platformFeeCents ?? 0),
      0,
    );
    const totalPayoutCents = payments.reduce((s, p) => s + (p.payoutCents ?? 0), 0);

    return {
      totalPayoutCents,
      totalGrossCents,
      totalPlatformFeeCents,
      paymentCount: payments.length,
    };
  }

  async createConnectOnboarding(teacher: ConnectTeacher): Promise<{
    link: ConnectOnboardingLink;
    stripeAccountId: string;
  }> {
    const stripeAccountId = teacher.stripeAccountId ?? `acct_mock_${teacher.id}`;
    return {
      link: {
        url: `${env.WEB_URL}/account?connect=mock-complete`,
        provider: 'mock',
      },
      stripeAccountId,
    };
  }

  async getConnectStatus(teacher: {
    id: string;
    stripeAccountId?: string | null;
  }): Promise<ConnectAccountStatus> {
    const connected = !!teacher.stripeAccountId;
    return {
      connected,
      detailsSubmitted: connected,
      payoutsEnabled: connected,
      chargesEnabled: connected,
      onboardingComplete: connected,
      provider: 'mock',
    };
  }
}

// ─── Stripe adapter (production) ──────────────────────────────────────────────

class StripePaymentsAdapter implements PaymentsAdapter {
  private stripePromise: Promise<import('stripe').default>;

  constructor() {
    this.stripePromise = this._initStripe();
  }

  private async _initStripe(): Promise<import('stripe').default> {
    const Stripe = (await import('stripe')).default;
    return new Stripe(env.STRIPE_SECRET_KEY);
  }

  async createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    const stripe = await this.stripePromise;

    if (input.kind === 'subscription') {
      const plan = getPlan(input.planId ?? 'explorer');
      if (!plan) throw badRequest(`Unknown plan: ${input.planId}`);
      if (plan.priceCents === 0) {
        // Free plan — just create a DB subscription
        return new MockPaymentsAdapter().createCheckout(input);
      }

      const priceEnv = plan.stripePriceEnv;
      const priceId = priceEnv ? process.env[priceEnv] : undefined;
      if (!priceId) throw badRequest(`Stripe price not configured for plan: ${plan.id}`);

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer_email: input.userEmail,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${env.WEB_URL}/dashboard?subscribed=${plan.id}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${env.WEB_URL}/pricing`,
        metadata: { userId: input.userId, planId: plan.id },
      });

      return {
        provider: 'stripe',
        url: session.url ?? `${env.WEB_URL}/pricing`,
        paymentId: session.id,
      };
    }

    if (input.kind === 'session') {
      if (!input.sessionId) throw badRequest('sessionId required.');
      const session = await prisma.classSession.findUnique({
        where: { id: input.sessionId },
        include: { teacher: true },
      });
      if (!session) throw badRequest('Session not found.');

      const tier = session.teacher.proTier ? 'pro' : 'standard';
      const split = splitEarnings(session.priceCents, tier);

      // Build destination charge params when the teacher has completed Connect onboarding.
      const sessionParams: import('stripe').default.Checkout.SessionCreateParams = {
        mode: 'payment',
        payment_method_types: ['card'],
        customer_email: input.userEmail,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              unit_amount: session.priceCents,
              product_data: { name: session.title },
            },
            quantity: 1,
          },
        ],
        success_url: `${env.WEB_URL}/sessions/${input.sessionId}?booked=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${env.WEB_URL}/sessions/${input.sessionId}`,
        metadata: { userId: input.userId, sessionId: input.sessionId, kind: 'session' },
      };

      // Use destination charge when teacher has a connected account (onboarding complete).
      if (session.teacher.stripeAccountId) {
        sessionParams.payment_intent_data = {
          application_fee_amount: split.platformFeeCents,
          transfer_data: {
            destination: session.teacher.stripeAccountId,
          },
        };
      }

      const stripeSession = await stripe.checkout.sessions.create(sessionParams);

      return {
        provider: 'stripe',
        url: stripeSession.url ?? `${env.WEB_URL}/sessions`,
        paymentId: stripeSession.id,
      };
    }

    if (input.kind === 'course') {
      if (!input.courseId) throw badRequest('courseId required.');
      const course = await prisma.course.findUnique({
        where: { id: input.courseId },
        include: { teacher: true },
      });
      if (!course) throw badRequest('Course not found.');

      const tier = course.teacher.proTier ? 'pro' : 'standard';
      const split = splitEarnings(course.priceCents, tier);

      // Build destination charge params when the teacher has completed Connect onboarding.
      const courseParams: import('stripe').default.Checkout.SessionCreateParams = {
        mode: 'payment',
        payment_method_types: ['card'],
        customer_email: input.userEmail,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              unit_amount: course.priceCents,
              product_data: { name: course.title },
            },
            quantity: 1,
          },
        ],
        success_url: `${env.WEB_URL}/courses/${input.courseId}?enrolled=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${env.WEB_URL}/courses/${input.courseId}`,
        metadata: { userId: input.userId, courseId: input.courseId, kind: 'course' },
      };

      // Use destination charge when teacher has a connected account (onboarding complete).
      if (course.teacher.stripeAccountId) {
        courseParams.payment_intent_data = {
          application_fee_amount: split.platformFeeCents,
          transfer_data: {
            destination: course.teacher.stripeAccountId,
          },
        };
      }

      const stripeSession = await stripe.checkout.sessions.create(courseParams);

      return {
        provider: 'stripe',
        url: stripeSession.url ?? `${env.WEB_URL}/courses`,
        paymentId: stripeSession.id,
      };
    }

    throw badRequest(`Unknown checkout kind: ${input.kind}`);
  }

  async handleWebhook(req: Request): Promise<void> {
    const stripe = await this.stripePromise;
    const sig = req.headers['stripe-signature'];
    if (!sig) throw badRequest('Missing Stripe signature.');

    let event: import('stripe').default.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body as Buffer,
        sig,
        env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      throw badRequest(`Webhook signature verification failed: ${(err as Error).message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as import('stripe').default.Checkout.Session;
        const meta = session.metadata ?? {};
        const userId = meta['userId'];
        if (!userId) break;

        if (session.mode === 'subscription' && meta['planId']) {
          const periodEnd = new Date();
          periodEnd.setMonth(periodEnd.getMonth() + 1);
          await prisma.subscription.updateMany({
            where: { userId, status: { in: ['active', 'trialing'] } },
            data: { status: 'cancelled' },
          });
          await prisma.subscription.create({
            data: {
              userId,
              planId: meta['planId'],
              status: 'active',
              currentPeriodEnd: periodEnd,
              provider: 'stripe',
              externalId: session.subscription as string,
            },
          });
        }

        if (meta['kind'] === 'session' && meta['sessionId']) {
          const sess = await prisma.classSession.findUnique({
            where: { id: meta['sessionId'] },
            include: { teacher: true },
          });
          if (sess) {
            const tier = sess.teacher.proTier ? 'pro' : 'standard';
            const split = splitEarnings(sess.priceCents, tier);
            await prisma.enrollment.upsert({
              where: { studentId_sessionId: { studentId: userId, sessionId: meta['sessionId'] } },
              create: { studentId: userId, sessionId: meta['sessionId'], status: 'active' },
              update: { status: 'active' },
            });
            await prisma.payment.create({
              data: {
                payerId: userId,
                amountCents: sess.priceCents,
                currency: 'USD',
                kind: 'session',
                status: 'succeeded',
                provider: 'stripe',
                platformFeeCents: split.platformFeeCents,
                payoutCents: split.payoutCents,
                payeeId: sess.teacherId,
                externalId: session.id,
              },
            });
          }
        }

        if (meta['kind'] === 'course' && meta['courseId']) {
          const course = await prisma.course.findUnique({
            where: { id: meta['courseId'] },
            include: { teacher: true },
          });
          if (course) {
            const tier = course.teacher.proTier ? 'pro' : 'standard';
            const split = splitEarnings(course.priceCents, tier);
            await prisma.enrollment.upsert({
              where: { studentId_courseId: { studentId: userId, courseId: meta['courseId'] } },
              create: { studentId: userId, courseId: meta['courseId'], status: 'active' },
              update: { status: 'active' },
            });
            await prisma.payment.create({
              data: {
                payerId: userId,
                amountCents: course.priceCents,
                currency: 'USD',
                kind: 'course',
                status: 'succeeded',
                provider: 'stripe',
                platformFeeCents: split.platformFeeCents,
                payoutCents: split.payoutCents,
                payeeId: course.teacherId,
                externalId: session.id,
              },
            });
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as import('stripe').default.Subscription;
        await prisma.subscription.updateMany({
          where: { externalId: sub.id },
          data: { status: 'cancelled' },
        });
        break;
      }

      default:
        console.log(`[payments:stripe] Unhandled event type: ${event.type}`);
    }
  }

  async getSubscription(userId: string) {
    const sub = await prisma.subscription.findFirst({
      where: { userId, status: { in: ['active', 'trialing'] } },
      orderBy: { createdAt: 'desc' },
    });
    if (!sub) return null;
    return {
      id: sub.id,
      planId: sub.planId,
      status: sub.status,
      currentPeriodEnd: sub.currentPeriodEnd.toISOString(),
      provider: sub.provider,
    };
  }

  async getEarnings(teacherId: string) {
    return new MockPaymentsAdapter().getEarnings(teacherId);
  }

  async createConnectOnboarding(teacher: ConnectTeacher): Promise<{
    link: ConnectOnboardingLink;
    stripeAccountId: string;
  }> {
    const stripe = await this.stripePromise;

    // Create an Express connected account if the teacher doesn't have one yet.
    let accountId = teacher.stripeAccountId;
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: teacher.email,
        metadata: { teacherId: teacher.id, name: teacher.name },
      });
      accountId = account.id;
    }

    // Create an Account Link for the onboarding flow.
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${env.WEB_URL}/account?connect=refresh`,
      return_url: `${env.WEB_URL}/account?connect=done`,
      type: 'account_onboarding',
    });

    return {
      link: {
        url: accountLink.url,
        provider: 'stripe',
      },
      stripeAccountId: accountId,
    };
  }

  async getConnectStatus(teacher: {
    id: string;
    stripeAccountId?: string | null;
  }): Promise<ConnectAccountStatus> {
    if (!teacher.stripeAccountId) {
      return {
        connected: false,
        detailsSubmitted: false,
        payoutsEnabled: false,
        chargesEnabled: false,
        onboardingComplete: false,
        provider: 'stripe',
      };
    }

    const stripe = await this.stripePromise;
    const account = await stripe.accounts.retrieve(teacher.stripeAccountId);

    const payoutsEnabled = account.payouts_enabled ?? false;
    const chargesEnabled = account.charges_enabled ?? false;
    const detailsSubmitted = account.details_submitted ?? false;

    return {
      connected: true,
      detailsSubmitted,
      payoutsEnabled,
      chargesEnabled,
      onboardingComplete: payoutsEnabled && chargesEnabled && detailsSubmitted,
      provider: 'stripe',
    };
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

let _instance: PaymentsAdapter | undefined;

export function getPaymentsAdapter(): PaymentsAdapter {
  if (_instance) return _instance;

  const driver = env.PAYMENTS_DRIVER;

  if (driver === 'stripe') {
    if (!env.STRIPE_SECRET_KEY) {
      console.warn(
        '[payments] PAYMENTS_DRIVER=stripe but STRIPE_SECRET_KEY is not set — falling back to mock.',
      );
      _instance = new MockPaymentsAdapter();
    } else {
      _instance = new StripePaymentsAdapter();
      console.log('[payments] Using driver: StripePaymentsAdapter');
    }
  } else {
    _instance = new MockPaymentsAdapter();
    console.log('[payments] Using driver: MockPaymentsAdapter');
  }

  return _instance;
}
