# Mentora — Teacher Verification

How Mentora proves a mentor is a **real, retired/seasoned professional** before
they teach minors — without boiling the ocean.

## The problem

Mentora's whole pitch is trust: "your child is taught by a verified retired
professional." But "retired professional" is not a single fact any API can
attest to. It is really **two separate claims**, with very different
automation potential:

| Layer | Claim | How it's proven | Automatable? |
|-------|-------|-----------------|--------------|
| **1. Identity** | "I am who I say I am" (real person, real government ID, matching face) | KYC / identity-verification API | **Yes** — mature APIs exist in every market |
| **2. Retirement & credentials** | "I really was an MIT professor / NASA scientist / CBSE teacher, and I'm retired" | Document upload (pension letter, degree, teaching licence, appointment letter) + human review | **No single API** — fragmented registries, so doc-upload + admin review |

**There is no global API that certifies "retired professional."** Teaching and
professional registries are regional and fragmented — India's NCTE and state
education boards, US state-by-state teaching licenses, Canada's provincial
colleges of teachers — and pension/retirement records are even more so.
Accepting that early avoids over-engineering: automate layer 1, keep layer 2
as a human-reviewed document flow with a clear admin queue.

## Layer 1 — Identity: central-body / KYC options

| Market | Provider | What it gives you |
|--------|----------|-------------------|
| **India** | **DigiLocker** (Govt of India / MeitY central document platform) | OAuth-based sharing of *government-issued* documents straight from source: Aadhaar, PAN, driving licence, degree certificates, even pension documents. The strongest option in India because the documents come from the issuer, not the user. |
| India (aggregators) | **IDfy, Signzy, Hyperverge, Cashfree Verification, Digio** | Commercial KYC suites wrapping Aadhaar/PAN/DigiLocker checks, face match, and (some) background checks — faster to integrate than raw government APIs. |
| **Canada / US / global** | **Stripe Identity** | Government-ID + selfie/biometric verification on a Stripe-hosted page. Attractive because **Mentora already uses Stripe** for payments — one vendor, one dashboard, one secret key. |
| Global alternatives | **Persona, Onfido, Veriff** | Comparable hosted ID + selfie verification with broader document coverage; worth evaluating if Stripe Identity's country coverage falls short. |

## Layer 2 — Retirement & credentials: documents + admin review

Teachers upload supporting documents; a platform admin reviews and
approves/rejects. The accepted document kinds (defined in
`packages/shared/src/types.ts` as `VERIFICATION_DOC_KINDS`):

| Kind | Label | Examples |
|------|-------|----------|
| `government_id` | Government photo ID | Passport, driver's licence, Aadhaar |
| `retirement_proof` | Proof of retirement | Pension card, retirement/superannuation letter, former-employer ID |
| `teaching_credential` | Teaching credential | Teaching licence, degree, B.Ed, professional certificate |
| `professional_membership` | Professional membership | Professional body / council membership (optional) |
| `address_proof` | Address proof | Utility bill or bank statement (optional) |
| `other` | Other supporting document | Anything else supporting the application |

Regional credential registries an admin can check against (manually, for now):
India — **NCTE** and state education boards; US — **state-level teaching
licenses** (no federal registry); Canada — **provincial colleges of teachers**
(e.g. Ontario College of Teachers). All fragmented — which is exactly why this
layer is review-based, not API-based.

## How Mentora implements it

### The `VerificationAdapter`

Identity checks follow the same adapter pattern as storage/OCR/LLM/payments
(see `apps/api/src/adapters/verification/index.ts`). The driver is selected by
`VERIFICATION_DRIVER`, and **any driver with missing keys falls back to
`manual` with a console warning** — so the platform always runs.

| Driver | What it does | Requires |
|--------|--------------|----------|
| `manual` *(default)* | No external provider; admin reviews uploaded docs. Zero keys. | nothing |
| `stripe_identity` | Creates a Stripe Identity VerificationSession (document + matching selfie) and returns the hosted-page URL. | `STRIPE_SECRET_KEY` |
| `digilocker` | **Stub** — builds a DigiLocker OAuth2 authorize URL; wire the token exchange + Issued Documents API to go live (registration at partners.digitallocker.gov.in). | `DIGILOCKER_CLIENT_ID`, `DIGILOCKER_CLIENT_SECRET`, `DIGILOCKER_REDIRECT_URI` |

### Teacher flow

1. **Upload documents** — one or more of the kinds above (PDF/image/Word, ≤50 MB each).
2. **Optionally start an identity check** — `POST /verification/start` returns a provider redirect URL (`null` for `manual`).
3. **Submit for review** — requires at least one uploaded document; status becomes `pending`.
4. **Admin reviews** — approves (`verified`) or rejects (`rejected`), with an optional note shown to the teacher.
5. **Verified badge** — approval sets `verified: true` on the user, which renders the "Verified" badge on teacher cards and profiles.

Status lifecycle: `unverified → pending → verified | rejected` (re-submission allowed after rejection).

### API routes

Defined in `apps/api/src/routes/verification.ts`:

| Method & path | Who | Purpose |
|---------------|-----|---------|
| `GET /verification/status` | Teacher | Own `VerificationSummary` (status, note, documents, provider) |
| `POST /verification/documents` | Teacher | Upload one supporting document (multipart, field `file`, body `kind`) |
| `POST /verification/submit` | Teacher | Submit for admin review (requires ≥1 document) |
| `POST /verification/start` | Teacher | Kick off automated identity check; returns `{ url, provider }` |
| `GET /admin/verifications` | Admin | Review queue — all teachers with status `pending`, oldest first |
| `POST /admin/verifications/:userId` | Admin | `{ decision: "approve" \| "reject", note? }` — sets status and the `verified` badge |

The seed (`apps/api/prisma/seed.ts`) creates demo data for both states:
Margaret Chen is already `verified`; Amelia Krishnaswamy is `pending` with two
uploaded documents, so the admin review queue has content out of the box.

## Enabling drivers in production

Set these in your environment (see `.env.example` for the full variable list;
add the verification block alongside the other adapter drivers):

```bash
# Default — admin review only, zero keys:
VERIFICATION_DRIVER=manual

# Stripe Identity (US / Canada / global; reuses your Stripe account):
VERIFICATION_DRIVER=stripe_identity
STRIPE_SECRET_KEY=sk_live_...

# DigiLocker (India; currently a stub — complete the OAuth wiring first):
VERIFICATION_DRIVER=digilocker
DIGILOCKER_CLIENT_ID=...
DIGILOCKER_CLIENT_SECRET=...
DIGILOCKER_REDIRECT_URI=https://<your-api-domain>/api/verification/digilocker/callback
```

If a driver's keys are absent, the adapter logs a warning and falls back to
`manual` — verification never blocks the platform.

## Privacy & safety

Minors are being taught, so verifying the adults is a child-safety control,
not just fraud prevention — and the ID documents themselves are sensitive.

- **Data minimization** — collect only what's needed to make the decision; the optional kinds (`professional_membership`, `address_proof`) stay optional.
- **Secure storage** — verification documents go through the `StorageAdapter`; in production use a **private S3 bucket served via signed URLs** (never public), restricted to admin access.
- **Retention limits** — once a decision is made, keep the decision + audit note, and delete or archive the raw ID documents after a defined window (e.g. 90 days).
- **Regulatory context** — verification of adults is part of the broader child-safety posture: **COPPA** (US, under-13 data) and **India's DPDP Act 2023** (verifiable parental consent for under-18 data) both apply to the platform; see `DIFFERENTIATION.md` §5.
- **Honesty in UI** — the badge means "identity + credentials reviewed by Mentora," not a background check. Don't overclaim.

## Next steps

1. **Background checks** — integrate a criminal/police-record check provider (India: AuthBridge/IDfy; US/Canada: Checkr/Certn), prioritized for teachers of Classes 1–5.
2. **Complete the DigiLocker OAuth flow** — token exchange + Issued Documents pull (the adapter is a stub today).
3. **Session-recording consent** — `recordingEnabled` + consent timestamps on `ClassSession`, with recordings access-scoped to participants.
4. **Re-verification cadence** — periodic re-checks (e.g. annual) and revocation on reports.
5. **Document retention automation** — scheduled purge of raw ID files post-decision.
