# Project Overview: Will o' the Wisp (GhostGame)

## What This Project Is

Will o' the Wisp is a Phaser 4 puzzle-platformer prototype where the player is a ghost that can possess world objects to solve traversal and logic puzzles.

This repository is also a mini-engine sandbox focused on data-driven runtime systems, in-game level authoring, and room streaming.

## Why Phaser 4 + Vanilla JavaScript

This project intentionally started with Phaser 4 and vanilla JavaScript for fast iteration while core architecture was still changing quickly.

Reasons:

- rapid prototyping speed during early system design
- direct control over runtime behavior while building engine-like patterns
- simpler integration with JSON-driven content authoring and local tooling

Planned evolution:

- adopt `@ts-check` + JSDoc for stronger contracts in JavaScript
- migrate to TypeScript in phases once architecture stabilizes

## Current Architecture Direction

The project is organized around orchestration-style scene/controllers:

- `BaseRoom` stays lean and delegates orchestration
- `RoomController` coordinates room setup/update lifecycle
- `RoomRenderer` builds runtime objects from room JSON via `objectRegistry`
- `RoomStreamingController` streams adjacent room JSON in to the same active scene
- `LevelEditor` delegates behavior to editor-specific controllers

Core design principle: room content is authored and consumed as data (JSON), not hardcoded scene logic.

## Conventions and Constraints

### Language and Framework Choice

I chose Phaser 4 + vanilla JavaScript intentionally to optimize for iteration speed and leverage my existing frontend experience.

In this phase, the priority is building core game-engine fundamentals (runtime object pipelines, streaming, collision/puzzle systems, editor tooling) rather than splitting focus with a full language migration.

Type safety is a planned staged evolution:

- near term: `@ts-check` + JSDoc
- later: TypeScript migration once architecture contracts are stable

### Import and File Conventions

- Vite/jsconfig alias `@` maps to `src`
- imports generally use `@/...` with `.js` extensions
- controller folders are organized by ownership boundary:
  - `controllers/editor`
  - `controllers/room`
  - `controllers/render`
  - `controllers/input`
  - `controllers/physics`
  - `controllers/gameplay`

### Runtime Architecture Constraints

- adjacent-room traversal uses same-scene JSON streaming (no default scene swap)
- `BaseRoom` remains lean and orchestration-focused
- `LevelEditor` remains lean and delegates behavior to editor controllers
- room/world systems own room graph and streaming logic, not the player object

### Data Ownership Boundaries

Concepts are intentionally separated:

- `roomCache`: raw room JSON data
- `loadedRooms`: currently rendered room instances/chunks
- future save-state: persistent world/player/puzzle mutation state

### Coding Standards (Current Phase)

- prefer small, incremental changes over broad rewrites
- keep controller ownership boundaries explicit
- avoid stale cached mutable arrays in long-lived controllers
- prefer live reads/getters for mutable runtime collections where appropriate

## Current Development Focus

The active phase goal is to stabilize room authoring + streaming foundations before visual polish.

Current priorities:

- room JSON authoring from in-game editor
- save/reload roundtrip reliability
- same-scene adjacent room streaming
- post-stream collision/entity/controller consistency

## Engineering Practices Used

- ADRs for major architecture decisions (`docs/adr/`)
- focused PRs with scoped change sets
- Vitest for unit/contract coverage
- CI checks for formatting + tests
- explicit asset provenance and licensing policy

## AI Collaboration Transparency

AI tools are used as a pairing aid for review, debugging, planning, and drafting.

Implementation ownership is intentionally controlled by a collaboration guardrail (`WORKING_AGREEMENT.md`), including explicit approval language before automated file edits.

## Portfolio Intent

This repository is maintained as a professional portfolio artifact to demonstrate:

- systems design and architecture reasoning
- iterative refactoring discipline
- tooling/testing workflows
- practical game-system implementation in progress

## What’s Next

The foundation phase has focused on architecture and tooling discipline: JSON-driven runtime content, controller ownership boundaries, same-scene room streaming, and in-game authoring workflows.

The next phase is about turning that foundation into richer gameplay:

- stabilize streaming and cross-room interaction consistency
- expand puzzle mechanics and encounter systems
- introduce enemy behavior and boss-room progression
- build save/state and menu infrastructure
- continue scaling editor capabilities toward multi-room authoring and future custom-content workflows

This is where the project shifts from “engine foundations” into “playable world depth,” while preserving the architectural guardrails established so far.
