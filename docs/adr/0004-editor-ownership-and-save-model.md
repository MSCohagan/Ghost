# ADR 0004: Editor Ownership and Save Model

- Status: Proposed
- Date: 2026-05-10
- Deciders: Project owner + Codex pairing workflow
- Related areas: LevelEditor, Editor\*Controller modules, room JSON save/reload, RoomStreamingController

## Context

The project is moving toward a JSON-driven room pipeline with in-game editing and streamed multi-room runtime behavior.

As streaming expands, editor responsibilities need clearer ownership boundaries so data integrity is preserved across:

- object placement/edit/delete actions
- room-aware editing in connected spaces
- save/reload roundtrips through the local save API
- runtime room unload/reload cycles

Without explicit boundaries, editor state can drift from runtime state, and edits can be written to the wrong room or lost during streaming transitions.

## Decision

### 1) Data Ownership Boundaries

Three ownership layers are defined:

- **Editor layer**: owns edit intent/state during an edit session (selection, placement actions, pending modifications).
- **Runtime layer**: owns instantiated Phaser objects currently loaded in-scene.
- **Persistence layer**: owns serialized room JSON written/read through the save API.

These layers are related but not interchangeable.

### 2) Room-Aware Editing is Explicit

Editing must always resolve a target room key (for example `activeEditRoomKey`) when placing/updating/deleting objects.

Edits must be applied to that room’s dataset, not implicitly to whichever room was originally bootstrapped as the base scene.

In streamed single-scene runtime, room ownership is derived from streamed-room metadata and owner-room tags on runtime objects, not from base scene identity alone.

### 3) Runtime Unload Does Not Equal Data Loss

When streamed rooms unload, only runtime instances are removed. Authored room content remains in persisted JSON (plus any editor-owned unsaved session state for that room).

### 4) Save Flow Contract

The editor save flow sends normalized room payloads to the local save server. The server writes room JSON in the canonical runtime-readable format.

Save/reload must round-trip without shape drift in object contracts.

Room-key and filename casing must be normalized at save/load boundaries so canonical runtime keys and persisted room JSON paths cannot drift (`Room1.json` vs `room1.json` class of issues).

### 5) Identity and References Persist Through Save

Deterministic IDs are assigned/maintained at the editor boundary. Reference fields (`targetIds`, with migration-era legacy compatibility where needed) must survive save/reload unchanged unless explicitly edited.

Canonical persisted fields for streamed/editor interoperability are:

- `objectId` (stable unique identity)
- `sourceRoomKey` (room ownership)
- `targetIds` (authoritative puzzle links)

Legacy fields (for example `key`, `targetGate`) remain compatibility-read paths during migration but are not canonical linkage fields.

### 6) Orchestration Boundary

`LevelEditor` remains orchestration-focused and delegates behavior to editor controllers. Controllerized subsystems continue to own tool-specific behavior, while the editor/save model remains contract-first.

### 7) Validation and Save Semantics

The editor validates room payloads at save time and surfaces at least:

- duplicate `objectId` values
- missing/unresolvable `targetIds`
- invalid references under configured room-link policies

Unlinked puzzle objects use explicit unlinked state (`targetIds: []` or `null`, chosen consistently by policy), not sentinel values.

During migration, validation may run in warning-first mode. Canonical fields are always the write path for newly saved content.

## Consequences

### Positive

- prevents room-misrouting bugs when editing in streamed multi-room contexts
- preserves authored content across runtime load/unload cycles
- establishes stable save/reload behavior for future features (undo/redo, multi-room editing, modding)
- keeps editor architecture testable and easier to evolve

### Tradeoffs

- requires explicit room-target resolution in edit actions
- introduces additional bookkeeping for unsaved per-room edits
- increases coordination requirements between editor/runtime/persistence layers
- migration work is needed for legacy assumptions that “current scene room” equals “current edit room”
- requires compatibility handling while legacy room-key/casing and fallback adjacency assumptions are phased out
- requires ID/link validation policy decisions (warning-only vs save-blocking)

## Deferred / Follow-Up Decisions

- final `activeEditRoomKey` lifecycle and UX semantics
- unsaved-change policy across room switches/unloads
- conflict strategy if runtime mutates objects while editor changes are pending
- editor tooling for managing object references (`targetIds`) at scale (selection UI, target preview/highlight)
- eventual server-side validation/schema checks for saved room payloads
- final policy on cross-room `targetIds` (allow vs restrict)

## Implementation Notes (Initial)

1. Introduce explicit room-target resolution for all edit mutations (place/update/delete).
2. Keep save payload generation centralized and normalized before API write.
3. Ensure reload path reproduces the same contract shape consumed by `RoomRenderer`.
4. Use streamed ownership metadata (and object owner-room tags) to resolve `activeEditRoomKey` in streamed spaces.
5. Normalize room-key casing consistently at editor save and save-server write boundaries.
6. Ensure newly saved puzzle links write canonical `targetIds` keyed to `objectId`, with legacy read fallback only.
7. Preserve canonical fields during runtime streaming; runtime may augment but must not overwrite persisted ownership/link data.
