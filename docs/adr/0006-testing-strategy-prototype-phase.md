# ADR 0006: Testing Strategy for the Prototype Phase

- Status: Proposed
- Date: 2026-05-10
- Deciders: Project owner + Codex pairing workflow
- Related areas: Vitest, CI workflow, gameplay controllers/helpers, manual playtest loop, future Playwright coverage

## Context

The project is transitioning from early experimentation into a more structured architecture (controllerized systems, JSON-driven room runtime, and room streaming). As complexity grows, regressions become more likely, especially in data contracts and cross-controller behavior.

As a solo developer, the project needs a testing strategy that provides reliable confidence without creating excessive maintenance overhead too early.

The current stack is JavaScript-first, with planned `@ts-check`/JSDoc and possible TypeScript migration later. Until stronger static typing is introduced, runtime contract checks and tests provide the primary safety net.

## Decision

### 1) Prototype-Phase Priority: Unit/Contract Tests

Use Vitest as the primary testing layer for this phase. Prioritize tests for:

- controllers with room/stream/puzzle data flow responsibilities
- helper modules with deterministic logic
- object contract/validation behavior
- bug-fix regressions (add a test when a bug is fixed)

### 2) CI Gate: Fast and Strict on Basics

On push/PR, CI must run:

- formatting/lint checks
- unit/contract test suite

The goal is fast feedback and prevention of obvious regressions in active development branches.

### 3) Manual Playtesting Remains Required

Manual playtesting is still required for:

- game feel and movement tuning
- possession interaction nuance
- physics edge cases and timing-sensitive behavior
- streamed-room moment-to-moment play quality

Automated tests complement, but do not replace, playtesting.

### 4) Deferred UI/E2E Layer (Planned)

Introduce Playwright in a later phase for UI shell flows (for example):

- start menu navigation
- settings/config toggles and persistence
- pause/menu transitions
- scene-entry contracts from menu/UI actions

This layer is valuable, but deferred until menu/config systems are sufficiently stable.

### 5) Type-Safety Evolution

Testing strategy assumes JavaScript runtime contracts in the near term. As `@ts-check`/JSDoc and eventual TypeScript are introduced, some classes of bugs should shift to earlier detection, allowing tests to focus more on behavioral and boundary integration risks.

## Consequences

### Positive

- increases confidence during ongoing streaming/editor/puzzle refactors
- catches contract drift and regression bugs earlier
- keeps CI practical and fast for solo iteration
- demonstrates engineering rigor in a public portfolio context

### Tradeoffs

- requires ongoing maintenance as contracts evolve
- does not fully validate physics/game-feel issues
- delayed Playwright/e2e adoption leaves some UI regressions manual for now
- runtime checks remain important until stronger static typing is in place

## Deferred / Follow-Up Decisions

- when to introduce Playwright baseline suite and minimum scenarios
- threshold for adding integration-style runtime tests around streaming/save reload
- test fixture strategy for room JSON and contract evolution
- whether to define minimum coverage targets after architecture stabilizes

## Implementation Notes (Initial)

1. Keep Vitest focused on deterministic controller/helper/contract behavior.
2. Require lint + tests in CI for push/PR workflows.
3. Add regression tests alongside bug fixes as a standing development habit.
