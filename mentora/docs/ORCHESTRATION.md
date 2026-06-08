# Mentora — Agent-Team Orchestration

Mentora was built by an orchestrated team of AI engineering sub-agents,
coordinated by a lead orchestrator. This is how the work was parallelized and
wired together seamlessly.

## The team

| Agent              | Owns          | Mandate                                                              |
|--------------------|---------------|---------------------------------------------------------------------|
| **Orchestrator**   | repo root     | Defines the contract, scaffolds the foundation, dispatches agents, integrates, verifies the build, commits. |
| **backend-engineer** | `apps/api`  | Express + Prisma API, auth, all routers, and the five adapters (storage/OCR/LLM/video/payments). |
| **frontend-engineer**| `apps/web`  | Next.js + Tailwind web app; accessibility-first, beautiful, dead-simple UI. |
| **mobile-engineer** | `apps/mobile`| Expo / React Native app reusing the contract.                       |

## The QA team

A dedicated quality team covers every test layer, each agent owning a distinct
test surface so they run in parallel without collision:

| Agent                | Layer         | Owns            | Tooling                          |
|----------------------|---------------|-----------------|----------------------------------|
| **unit-tester**      | Unit          | `@mentora/shared` + API pure logic | Vitest                  |
| **integration-tester** | Integration | `apps/api` HTTP flows | Vitest + supertest + test DB |
| **component-tester** | Component     | `apps/web` UI components | Vitest + React Testing Library |
| **e2e-tester**       | End-to-end    | `tests/e2e`     | Playwright (web + api + seed)    |
| **uat-tester**       | UAT           | `docs/uat/`     | Persona-based human test scripts |

The testing pyramid: many fast unit tests, fewer integration tests, a focused
set of component tests, a small number of high-value e2e journeys, and human
UAT scripts for sign-off.

Agent definitions live in [`.claude/agents/`](../.claude/agents).

## How conflicts were avoided

The contract-first approach is what makes parallel agents safe:

1. **Contract first.** The orchestrator wrote `@mentora/shared` (types, zod
   schemas, pricing, `API_ROUTES`) and the Prisma schema *before* dispatching
   anyone. That package is the frozen interface every agent codes against.
2. **Directory ownership.** Each agent owns exactly one top-level app directory
   and may only *read* the others. No two agents write the same file.
3. **No concurrent installs.** Agents write complete `package.json` files but
   never run `npm install`; the orchestrator runs a single workspace install at
   the end to avoid corrupting the hoisted `node_modules`.
4. **Single integration pass.** The orchestrator installs, builds `@mentora/shared`,
   then typechecks/builds each app, fixes seams, seeds the DB, and commits.

## Build phases

```
Phase 0  Orchestrator: scaffold monorepo + @mentora/shared + Prisma + infra   ── commit
Phase 1  Parallel:  backend-engineer ‖ frontend-engineer ‖ mobile-engineer
Phase 2  Orchestrator: npm install (root) → build shared → typecheck/build apps
Phase 3  Orchestrator: wire seams, seed demo data, finalize docs              ── commit + push
```

## Extending the team

To add a capability (e.g. a "growth-engineer" for SEO/marketing pages or a
"data-engineer" for analytics), add a definition under `.claude/agents/`, give
it an isolated directory or package, and have it code against `@mentora/shared`.
Because the contract is shared, new agents integrate without breaking existing
work.
