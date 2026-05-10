# ADR 0001: Puzzle Reference Contract and Validation Boundary

- Status: Proposed
- Date: 2026-05-10
- Deciders: Project owner + Codex pairing workflow
- Related areas: Level editor, room JSON, RoomRenderer, PuzzleController, RoomStreamingController

## Context

Current puzzle linkage is gate-specific (`targetGate`) and not robust for streaming/editor scale or future mechanics.
As puzzle systems expand, we need a generic data contract that supports:

- one-to-many links (one trigger affects many targets)
- many-to-one links (many triggers affect one target)
- many-to-many links (many triggers and many targets)
- deterministic debugging when references are missing/invalid
- clear ownership boundaries for assignment vs runtime validation

## Decision

### 1) Generic Puzzle Reference Contract

Adopt a generic relationship model for puzzle-capable objects:

- `id`:
  - unique string identifier
  - required for objects that can be referenced or can reference others
- `targetIds`:
  - array of target object IDs
  - canonical linkage field replacing gate-specific coupling over time
  - supports one-to-many, many-to-one, and many-to-many relationships by design
- `type`:
  - remains the renderer/object factory discriminator via `objectRegistry`

### 2) Required ID Scope

IDs are required for interactive/referenceable object types, including:

- gates/doors
- pressure plates/switches
- loading zones
- future puzzle triggers/targets (balls, sockets/holes, relays, etc.)

IDs are not required for purely static/decorative geometry unless those objects become referenceable.

### 3) Ownership Boundaries

- **ID assignment**: editor/save pipeline
  - assign deterministic defaults when missing (`roomKey_type_index`)
- **ID validation**: runtime render pipeline
  - validate in `RoomRenderer.render(...)` before factory creation
  - runtime does not silently rewrite IDs

### 4) Runtime Behavior on Invalid References

For current phase:

- warn with structured context (room key, type, source id, unresolved target id)
- no-op when unresolved
- no fallback to first available target

### 5) Relationship Semantics (Current + Deferred)

Current contract defines **graph connectivity** only (`id` <-> `targetIds`).

Behavior semantics for multi-input/multi-output logic are acknowledged and deferred:
- `any` (any trigger activates target)
- `all` (all required triggers must be active)
- `threshold` (N-of-M, e.g. 5 balls open 2 doors)

When introduced, semantics should be explicit data fields (not implicit code assumptions).

## Consequences

### Positive

- enables flexible puzzle graph design beyond gate/plate pairs
- prevents silent misrouting from weak fallback logic
- unifies base-room and streamed-room behavior
- creates a clear foundation for future puzzle mechanics and editor UX

### Tradeoffs

- requires editor-side ID assignment updates
- requires gradual migration of existing room JSON
- adds runtime validation and warning paths during transition

## Deferred / Follow-Up Decisions

- Final field naming for relationship semantics (`activationMode`, `threshold`, etc.)
- Whether unresolved references escalate from warn to hard error in some environments
- JSON schema / JSDoc typing strategy (`@ts-check`, schema validation, lint checks)
- Editor UX for selecting/maintaining `targetIds` (dropdown, multi-select, graph view)
- Migration steps from legacy `targetGate` to `targetIds`

## Implementation Notes (Initial)

1. Add runtime reference validator called from `RoomRenderer.render(...)` pre-factory.
2. Keep warnings non-fatal during migration.
3. Add editor-side deterministic ID assignment on placement/save.
4. Add compatibility adapter for legacy `targetGate` until room data is migrated.
5. Add tests for:
   - missing/duplicate IDs
   - unresolved `targetIds`
   - no-op behavior on invalid links
   - many-to-many link graph resolution
