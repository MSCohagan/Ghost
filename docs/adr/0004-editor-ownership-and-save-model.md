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

### 3) Runtime Unload Does Not Equal Data Loss

When streamed rooms unload, only runtime instances are removed. Authored room content remains in persisted JSON (plus any editor-owned unsaved session state for that room).

### 4) Save Flow Contract

The editor save flow sends normalized room payloads to the local save server. The server writes room JSON in the canonical runtime-readable format.

Save/reload must round-trip without shape drift in object contracts.

### 5) Identity and References Persist Through Save

Deterministic IDs are assigned/maintained at the editor boundary. Reference fields (`targetIds`, with migration-era legacy compatibility where needed) must survive save/reload unchanged unless explicitly edited.

### 6) Orchestration Boundary

`LevelEditor` remains orchestration-focused and delegates behavior to editor controllers. Controllerized subsystems continue to own tool-specific behavior, while the editor/save model remains contract-first.

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

## Deferred / Follow-Up Decisions

- final `activeEditRoomKey` lifecycle and UX semantics
- unsaved-change policy across room switches/unloads
- conflict strategy if runtime mutates objects while editor changes are pending
- editor tooling for managing object references (`targetIds`) at scale
- eventual server-side validation/schema checks for saved room payloads

## Implementation Notes (Initial)

1. Introduce explicit room-target resolution for all edit mutations (place/update/delete).
2. Keep save payload generation centralized and normalized before API write.
3. Ensure reload path reproduces the same contract shape consumed by `RoomRenderer`.
