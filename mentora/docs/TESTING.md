# Mentora — Testing

Mentora ships with a full testing pyramid, authored by a dedicated QA agent
team (see [`ORCHESTRATION.md`](ORCHESTRATION.md)). All suites are currently
**green** and were run end-to-end during the build.

## Test inventory

| Layer        | Package          | Tooling                         | Tests | Status |
|--------------|------------------|---------------------------------|-------|--------|
| Unit         | `@mentora/shared`| Vitest                          | 285   | ✅ pass |
| Component    | `@mentora/web`   | Vitest + React Testing Library  | 192   | ✅ pass |
| Integration  | `@mentora/api`   | Vitest + supertest + Postgres   | 129   | ✅ pass |
| End-to-end   | `@mentora/e2e`   | Playwright (Chromium)           | 64    | ✅ pass |
| UAT          | `docs/uat`       | Human persona scripts           | —     | ready  |
| **Total automated** |          |                                 | **670** | ✅ |

> Counts are the totals at the time of writing and will grow as features land.

## Continuous integration

CI (`.github/workflows/ci.yml`) runs the **full pyramid on every PR** and on
pushes to main: unit + component, API integration against a real Postgres
(including the teacher **verification** and **currency** suites), and the
Playwright e2e suite against the running web + api stack (including the
agentic **research** flow and smoke tests). A failing layer blocks the merge.

## Running the suites

```bash
# From the monorepo root, after `npm install` + building shared:
npm run test:unit          # @mentora/shared       (no services needed)
npm run test:component     # @mentora/web           (no services needed)

# Integration needs a disposable Postgres:
createdb mentora_test  # or docker
DATABASE_URL=postgresql://mentora:mentora@localhost:5432/mentora_test \
  npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma
DATABASE_URL=postgresql://mentora:mentora@localhost:5432/mentora_test \
  npm run test:integration

# End-to-end needs the full stack running (api+web) and a seeded DB:
npm run db:up && npm run db:migrate && npm run db:seed
npm run dev               # api :4000 + web :3000  (separate terminal)
cd tests/e2e && npm run install:browsers && npm test
```

`npm test` from the root runs unit + component + integration together
(integration requires `DATABASE_URL` to point at a test database).

## Notes on hermeticity

- The API integration tests set every adapter to its key-free driver
  (`LLM_DRIVER=stub`, `VIDEO_DRIVER=mock`, `PAYMENTS_DRIVER=mock`,
  `STORAGE_DRIVER=local`, `OCR_DRIVER=mock`) so they run with **zero API keys**.
- `OCR_DRIVER=mock` returns deterministic text and avoids the tesseract.js
  WASM worker, which is unavailable in some CI sandboxes.
- Test files are excluded from the production `tsc`/`next build` of each app
  and from the build-time lint, so test code never blocks a release build.

## Bugs caught by the suite (and fixed)

The QA suites surfaced real defects during the build, all fixed:

1. **Refresh-token collision** — two refresh tokens minted for the same user in
   the same second produced an identical JWT, violating the unique `token`
   column. Fixed by adding a random `jti` per token. *(integration)*
2. **AI Tutor "Make a quiz" crashed the page** — the API returns the quiz array
   under `result`, but the web set the message `content` to that array, throwing
   a React "objects are not valid as a child" error. Fixed by normalising the
   quiz response into `questions`. *(e2e)*
3. **`.txt` upload returned HTTP 500** — multer rejected `text/plain` and threw
   an unhandled error. Now plain-text/markdown/csv are accepted (and read
   directly as extracted text), and unsupported types return a friendly 400. *(e2e)*
