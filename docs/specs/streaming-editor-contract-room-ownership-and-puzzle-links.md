# Streaming + Editor Contract: Room Ownership and Puzzle Links

## Context

The project uses single-scene room streaming as the primary room loading model. Under this model, rooms are dynamically loaded into a continuous world space, which introduces cross-room concerns for object identity, room ownership, and puzzle bindings. To keep runtime behavior deterministic, editor-authored data must follow a clear contract so streamed objects retain correct room attribution and relationship links (for example, pressure plate → gate targets) after load, merge, and save cycles. This spec defines that contract between editor output and streaming/runtime consumption.

## Problem

The current data model allows non-unique puzzle identifiers across rooms (for example, reused `gateA` keys). During streaming, objects from multiple rooms are merged into the same active scene, so legacy identifiers collide. As a result, bindings resolve incorrectly: the Room1 `gateA` is controlled by multiple pressure plates, while the Room2 gate with the same identifier is not controlled by its intended plate. This exposes a broader contract gap between editor-authored object identity and runtime target resolution in streamed rooms.

## Goals

- Deterministically preserve object identity across streamed rooms.
- Ensure every streamed object carries stable room ownership metadata (`sourceRoomKey`).
- Ensure puzzle links (`targetIds`) resolve to the intended objects, even when similarly named objects exist in other rooms.
- Make editor-authored metadata the source of truth, with runtime only validating/augmenting (not replacing) that data.
- Prevent cross-room binding collisions and regressions during load, stream, unload, and re-save cycles.
- Ensure editor room-at-pointer resolution uses explicit room bounds contracts, not ambiguous overlap-first heuristics.

## Proposed Approach

- The editor becomes the source of truth for object identity and puzzle linkage metadata.
- Each placed object is saved with:
  - a stable object id
  - a `sourceRoomKey` indicating room ownership
  - optional `targetIds` for puzzle relationships.
- Puzzle-capable objects (for example pressure plates, gates, switches) use an editor binding flow:
  - user places object
  - user selects linked target(s) from a filtered list
  - editor can highlight selected candidate targets before confirm.
- “Dud” or intentionally unlinked puzzle objects are represented as explicit unlinked state (`targetIds: []` or `null`), not sentinel values like `0`.
- On save, the editor validates metadata and surfaces warnings for:
  - duplicate object ids
  - missing/broken target references
  - invalid cross-room references (if disallowed by design).
- Runtime streaming consumes editor-authored metadata as authoritative; it may enrich in-memory data for performance, but must not overwrite valid saved ownership/link fields.
- Legacy room JSON is normalized through a migration/backfill pass so reused identifiers (for example `gateA` in multiple rooms) are replaced with stable room-safe identities before or during load.
- Editor room-context resolution contract:
  - base-room bounds and streamed-room bounds are merged into a single snapshot used by room-at-pointer checks.
  - effective bounds should be non-overlapping where possible.
  - if overlap is unavoidable, resolver precedence must be deterministic and explicit, never implicit “first array match” behavior.
  - deterministic precedence order:
    1) prefer non-base room matches over base room matches
    2) among non-base matches, prefer highest `offsetX`
    3) if still tied, prefer lexicographically larger `roomKey`
  - per-frame evaluation is acceptable in editor mode while bounds count remains small; optimize later only if needed.

## Data Model / Contracts

```js
/**
 * @typedef {Object} LevelObjectBase
 * @property {string} objectId - Stable unique object identity (authoritative link target).
 * @property {string} sourceRoomKey - Owning room key (e.g., "Room1", "Room2").
 * @property {string} type - Registry type (gate, pressurePlate, possessableBox, loadingZone, etc.).
 * @property {number} x
 * @property {number} y
 * @property {number} [width]
 * @property {number} [height]
 * @property {string} [key] - Legacy/display key; not authoritative for cross-room linking.
 */

/**
 * @typedef {Object} PuzzleLinkFields
 * @property {string[]} [targetIds] - Authoritative objectId links.
 * @property {string} [targetGate] - Legacy field; read-only fallback during migration.
 */

/**
 * @typedef {LevelObjectBase & PuzzleLinkFields} LevelObject
 */

/**
 * @typedef {Object} RoomSaveData
 * @property {string} roomKey
 * @property {number} roomWidth
 * @property {number} roomHeight
 * @property {{x:number,y:number}} [playerSpawn]
 * @property {LevelObject[]} objects
 */

/**
 * Contract Rules:
 * 1) objectId is required for all persisted objects.
 * 2) sourceRoomKey is required for all persisted objects.
 * 3) targetIds references objectId (never key).
 * 4) Unlinked puzzle object uses targetIds: [] (or omitted by explicit rule), never sentinel values.
 * 5) Runtime may append metadata, but must not overwrite persisted objectId/sourceRoomKey/targetIds.
 * 6) Legacy targetGate/key-based links are migration-only compatibility paths.
 * 7) Room-at-pointer overlap resolution uses documented deterministic precedence (never first-array-match behavior).
 */
```

## Rollout Plan

1. Phase 1: Contract Introduction

- Add/confirm canonical fields: `objectId`, `sourceRoomKey`, `targetIds`.
- Keep legacy compatibility (`key`, `targetGate`) read-only during transition.
- Add runtime guardrails/logs for missing or invalid contract fields.

2. Phase 2: Runtime Adoption

- Update puzzle resolution to prefer `targetIds` -> `objectId` lookup.
- Keep fallback path for legacy maps to avoid breakage.
- Ensure streamed registration preserves editor-authored identity/ownership metadata.

3. Phase 3: Editor Authoring + Validation

- Editor assigns stable `objectId` on placement.
- Editor tracks current room and writes `sourceRoomKey` on save.
- Add binding UI for puzzle objects (select target, preview/highlight, confirm).
- Add save-time validation for duplicate ids and broken target references.

4. Phase 4: Migration + Cleanup

- Backfill legacy room JSON to canonical fields.
- Remove/retire legacy linking path once all active rooms are migrated.
- Add regression tests for cross-room streaming + puzzle link correctness.

## Risks / Open Questions

- ID strategy: choose globally unique `objectId`s across all rooms, or uniqueness scoped by `sourceRoomKey`.
- Cross-room links: decide whether `targetIds` may reference objects in other rooms, or should be restricted to same-room only.
- Migration safety: define safeguards so legacy `key`/`targetGate` conversion does not accidentally remap existing puzzles.
- Editor UX complexity: define the smallest usable binding flow to ship first (list only vs list + hover highlight).
- Runtime fallback policy: define behavior when target resolution fails at runtime (no-op, disable, or hard warning).
- Save-time enforcement: decide whether validation errors block save or permit warning-only save during transition.
- Performance: determine whether indexed lookup maps by `objectId` are needed at load time to avoid repeated linear scans in large streamed scenes.
- Bounds precedence policy: choose and document final deterministic overlap precedence rule if non-overlap cannot be guaranteed in authored/runtime effective bounds.
  - Decision (2026-05-27): non-base > base, then highest `offsetX`, then lexicographic `roomKey`.

## Acceptance Criteria

- Every saved placeable object includes `objectId` and `sourceRoomKey`.
- Puzzle-capable objects use canonical `targetIds` for binding resolution.
- Streaming two rooms with previously colliding legacy keys no longer causes cross-room misbinding.
- Pressure plates in Room2 can only control their intended Room2 targets unless explicitly cross-room linked by design.
- Editor can author and persist puzzle links through a deterministic selection flow.
- Save validation detects duplicate object IDs and missing target references.
- Runtime logs clear, actionable warnings for invalid contract data without silently rebinding to wrong targets.
- Legacy room data can load without crash during migration window, with canonical fields present after migration/backfill.
- At least one integration test (or equivalent playtest checklist) verifies correct binding after stream-in + stream-out + reload cycle.
- Editor room-at-pointer resolves to intended room key in seam/transition regions according to explicit effective bounds policy (including deterministic overlap behavior if overlap exists).
- Overlap resolution outcome is stable across frames and independent of streamed-room registration order.
