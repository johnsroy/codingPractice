/**
 * Verification Adapter
 * --------------------
 * Drives the identity-check step of teacher verification.
 * Implementations:
 *   - "manual"          (default) — admin reviews uploaded documents; no external URL.
 *   - "stripe_identity" — creates a Stripe Identity VerificationSession + redirect URL.
 *   - "digilocker"      — STUB: returns a placeholder DigiLocker authorize URL.
 *                         Wire to the real DigiLocker OAuth flow when ready.
 *
 * Factory selected by env.VERIFICATION_DRIVER.
 * Falls back to "manual" when a driver is selected but its required keys are absent.
 */

import { env } from '../../config/env';
import type { UserPublic } from '@mentora/shared';

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IdentityCheckResult {
  /**
   * URL to redirect the teacher to for the external identity check.
   * `null` when using the manual driver (admin reviews docs directly).
   */
  url: string | null;
  /**
   * The provider that will handle (or has been initiated for) this check.
   */
  provider: 'manual' | 'stripe_identity' | 'digilocker';
}

export interface VerificationAdapter {
  /**
   * Start an identity-check flow for the given teacher user.
   * Returns the provider name and an optional redirect URL.
   */
  startIdentityCheck(user: UserPublic): Promise<IdentityCheckResult>;
}

// ─── Manual adapter (default) ────────────────────────────────────────────────

/**
 * Manual (admin-review) driver.
 * No external identity provider is involved; the platform admin reviews
 * the documents the teacher has uploaded and approves/rejects manually.
 */
class ManualVerificationAdapter implements VerificationAdapter {
  async startIdentityCheck(_user: UserPublic): Promise<IdentityCheckResult> {
    return { url: null, provider: 'manual' };
  }
}

// ─── Stripe Identity adapter ─────────────────────────────────────────────────

/**
 * Stripe Identity driver.
 * Creates a Stripe Identity VerificationSession and returns its client_secret
 * URL so the teacher can complete the biometric / document check on Stripe's
 * hosted page.
 *
 * Requirements: STRIPE_SECRET_KEY must be set.
 * Falls back to manual with a console warning when the key is absent.
 */
class StripeIdentityVerificationAdapter implements VerificationAdapter {
  private stripePromise: Promise<import('stripe').default>;

  constructor() {
    this.stripePromise = this._initStripe();
  }

  private async _initStripe(): Promise<import('stripe').default> {
    const Stripe = (await import('stripe')).default;
    return new Stripe(env.STRIPE_SECRET_KEY);
  }

  async startIdentityCheck(user: UserPublic): Promise<IdentityCheckResult> {
    const stripe = await this.stripePromise;

    const session = await stripe.identity.verificationSessions.create({
      type: 'document',
      metadata: { userId: user.id, email: user.email },
      options: {
        document: {
          // Require both sides of the document for higher accuracy
          require_matching_selfie: true,
        },
      },
    });

    return { url: session.url ?? null, provider: 'stripe_identity' };
  }
}

// ─── DigiLocker adapter (STUB) ────────────────────────────────────────────────

/**
 * DigiLocker driver — STUB.
 *
 * DigiLocker is India's government-backed digital document wallet used to
 * verify Aadhaar, PAN, teaching credentials, and pension/retirement certificates.
 *
 * This stub returns a placeholder authorize URL constructed from the configured
 * DIGILOCKER_CLIENT_ID and DIGILOCKER_REDIRECT_URI.  To go live:
 *  1. Register your app at https://partners.digitallocker.gov.in/
 *  2. Replace the placeholder URL below with the real OAuth2 authorize endpoint:
 *     https://api.digitallocker.gov.in/public/oauth2/1/authorize
 *  3. Exchange the returned `code` for tokens and pull verified docs via
 *     https://api.digitallocker.gov.in/public/oauth2/1/token and the Issued
 *     Documents API.
 *
 * Falls back to manual when DIGILOCKER_CLIENT_ID is not set.
 */
class DigiLockerVerificationAdapter implements VerificationAdapter {
  async startIdentityCheck(user: UserPublic): Promise<IdentityCheckResult> {
    const clientId = env.DIGILOCKER_CLIENT_ID;
    const redirectUri = env.DIGILOCKER_REDIRECT_URI;

    // Build the placeholder authorize URL.
    // In production replace with the real DigiLocker OAuth2 endpoint.
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      state: user.id, // echoed back so we can match the callback to the user
      scope: 'openid',
    });

    const url = `https://api.digitallocker.gov.in/public/oauth2/1/authorize?${params.toString()}`;

    console.log(`[verification:digilocker] Placeholder authorize URL generated for user ${user.id} (STUB — not a real DigiLocker session)`);
    return { url, provider: 'digilocker' };
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

let _instance: VerificationAdapter | undefined;

export function getVerificationAdapter(): VerificationAdapter {
  if (_instance) return _instance;

  const driver = env.VERIFICATION_DRIVER;

  if (driver === 'stripe_identity') {
    if (!env.STRIPE_SECRET_KEY) {
      console.warn(
        '[verification] VERIFICATION_DRIVER=stripe_identity but STRIPE_SECRET_KEY is not set — falling back to manual.',
      );
      _instance = new ManualVerificationAdapter();
    } else {
      _instance = new StripeIdentityVerificationAdapter();
      console.log('[verification] Using driver: StripeIdentityVerificationAdapter');
    }
  } else if (driver === 'digilocker') {
    if (!env.DIGILOCKER_CLIENT_ID) {
      console.warn(
        '[verification] VERIFICATION_DRIVER=digilocker but DIGILOCKER_CLIENT_ID is not set — falling back to manual.',
      );
      _instance = new ManualVerificationAdapter();
    } else {
      _instance = new DigiLockerVerificationAdapter();
      console.log('[verification] Using driver: DigiLockerVerificationAdapter (STUB)');
    }
  } else {
    _instance = new ManualVerificationAdapter();
    console.log('[verification] Using driver: ManualVerificationAdapter');
  }

  return _instance;
}
