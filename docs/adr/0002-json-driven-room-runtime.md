# ADR 0002: JSON-Driven Room Runtime

- Status: Proposed
- Date: 2026-05-10
- Deciders: Project owner + Codex pairing workflow
- Related areas: Room JSON, RoomRenderer, objectRegistry, BaseRoom, room authoring flow

## Context

The project needs a fast and consistent way to author, save, load, and stream rooms while the architecture is still evolving.

Early versions mixed hardcoded room object placement with runtime creation logic, which made changes harder to reason about and increased the chance of drift between editor data and in-game behavior.

The current workflow already relies on JSON in multiple places:

- room definitions are stored as JSON
- the editor save flow sends/receives JSON through the local save API
- room streaming fetches adjacent room JSON at runtime

Given these constraints, a JSON-first runtime model provides the best iteration speed and a clean data handoff across systems.

## Decision

### 1) Room Runtime is JSON-Driven

Room object creation is driven by room JSON data. Runtime objects should be created from JSON, not hardcoded in room scenes.

### 2) Rendering Boundary

`RoomRenderer` and its `objectRegistry` are the runtime construction boundary:

- input: room JSON objects
- output: runtime entities/groups/collision metadata

New object types are added by extending registry/factory mappings and data contracts, not by embedding object creation directly in room scenes.

### 3) Scene Ownership

`BaseRoom` remains lean and orchestration-focused. It should coordinate lifecycle and controller wiring, not own per-object room content logic.

### 4) Contract Expectations

Room objects must provide required fields for their type (for example `type`, transform/size fields, and puzzle/linking fields where applicable).

Validation occurs at runtime render boundaries (warn/no-op behavior during prototype phase), with stricter tooling to be added later.

## Consequences

### Positive

- single source of truth for authored room content
- consistent editor/save/reload/streaming data flow
- easier debugging of room state as serialized data
- cleaner extensibility via data + factories
- strong foundation for eventual custom levels/modding support

### Tradeoffs

- weaker compile-time guarantees in plain JavaScript
- runtime validation burden until schemas/types are introduced
- migration work for any leftover hardcoded object creation paths
- malformed JSON can cause runtime warnings/no-op behavior if not pre-validated

## Deferred / Follow-Up Decisions

- JSON schema strategy (formal schema, lightweight validator, or both)
- phased typing approach (`@ts-check`/JSDoc first vs TypeScript migration timing)
- CI data validation/linting for room JSON and object contracts
- migration checklist for removing remaining hardcoded room content paths

## Implementation Notes (Initial)

1. Keep runtime object creation centralized in `RoomRenderer` + `objectRegistry`.
2. Continue editor/save pipeline alignment around room JSON as authoritative data.
3. Add stricter validation gates over time (local tooling + CI) once contracts stabilize.
