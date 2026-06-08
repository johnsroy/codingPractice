# UAT Sign-Off Summary

Complete this document after all test scripts and the accessibility checklist have been executed. It should be reviewed and signed by the product owner before any release decision is made.

---

## 1. Test scope

| Field | Value |
|-------|-------|
| Product | Mentora — K-12 learning marketplace |
| Release / build | _(fill in the version tag or commit hash)_ |
| Test environment | `http://localhost:3000` (dev) / staging URL: _(fill in if applicable)_ |
| Test period | _(fill in: e.g. 2026-06-01 to 2026-06-03)_ |
| Test lead | _(fill in name)_ |
| Testers | _(fill in names)_ |

**Scripts included in this cycle:**

- [ ] `scripts/margaret-retired-teacher.md` — 47 steps
- [ ] `scripts/alex-learner.md` — 42 steps
- [ ] `scripts/david-guardian.md` — 32 steps
- [ ] `scripts/admin.md` — 33 steps
- [ ] `accessibility-ease-of-use-checklist.md` — 55 items

---

## 2. Pass rate summary

| Script / Checklist | Total steps | Pass | Fail | Blocked | Pass rate |
|-------------------|-------------|------|------|---------|-----------|
| Margaret — Retired Teacher | 47 | | | | |
| Alex — Learner | 42 | | | | |
| David — Guardian | 32 | | | | |
| Admin | 33 | | | | |
| Accessibility checklist | 55 | | | | |
| **Overall total** | **209** | | | | |

**Overall pass rate:** ______% (target: 90% or higher)

---

## 3. Open defects

List every defect raised during this test cycle. If a defect has been fixed and re-tested within this cycle, mark it as "Closed".

| # | Severity | Script & step | Short description | Status | Assigned to |
|---|----------|---------------|-------------------|--------|-------------|
| 1 | | | | Open / Closed | |
| 2 | | | | Open / Closed | |
| 3 | | | | Open / Closed | |
| _(add rows as needed)_ | | | | | |

**Open defect counts:**

| Severity | Count |
|----------|-------|
| P1 — Critical | |
| P2 — High | |
| P3 — Medium | |
| P4 — Low | |

---

## 4. Key findings and observations

Use this section for any findings that are not captured by a specific step pass/fail — for example: pages that loaded unusually slowly, wording that confused a tester, or functionality that worked but felt awkward.

_(Free text — add as many paragraphs as needed)_

---

## 5. Risks and outstanding items

List any items that could not be tested in this cycle, and explain why.

| Item | Reason not tested | Risk if shipped |
|------|------------------|-----------------|
| Real Stripe payment flow | Stripe keys not configured in dev environment | Medium — mock checkout works but a real payment could behave differently |
| Real LiveKit video room | LiveKit keys not configured | Low — mock room works; real room tested in staging |
| _(add rows as needed)_ | | |

---

## 6. Go / No-Go recommendation

### Exit criteria result

| Criterion | Target | Actual | Met? |
|-----------|--------|--------|------|
| Overall pass rate | ≥ 90% | | Yes / No |
| P1 (Critical) defects open | 0 | | Yes / No |
| P2 (High) defects open | 0 | | Yes / No |
| P3 (Medium) defects open | ≤ 3 | | Yes / No |
| Accessibility checklist Fails | 0 | | Yes / No |

### Recommendation

- [ ] **GO** — all exit criteria are met. The build is ready for release (or promotion to the next environment).
- [ ] **CONDITIONAL GO** — minor outstanding items that can be addressed post-release with agreed workarounds. List conditions below.
- [ ] **NO GO** — one or more exit criteria are not met. List blockers below.

**Conditions / Blockers** _(if applicable):_

_(Free text)_

---

## 7. Sign-off

| Role | Name | Signature / Initials | Date |
|------|------|----------------------|------|
| Test Lead | | | |
| Product Owner | | | |
| Engineering Lead | | | |
| _(add as needed)_ | | | |

---

*This document is part of the Mentora UAT pack located in `docs/uat/`.*
