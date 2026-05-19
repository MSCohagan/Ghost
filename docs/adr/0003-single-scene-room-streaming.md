# ADR 0003: Single-Scene Room Streaming

- Status: Proposed
- Date: 2026-05-10
- Deciders: Project owner + Codex pairing workflow
- Related areas: RoomStreamingController, RoomController, ColliderController, camera/world bounds

## Context

The project aims to support interconnected exploration similar to Metroidvania room flow, where the player can move between adjacent rooms without constant hard scene transitions.

Hard transitions (for example save rooms, elevators, or special travel nodes) are still valid design tools, but they should be selective and intentional. For baseline traversal, adjacent room movement should feel continuous.

Early alternatives using `scene.start()` / `scene.launch()` for neighboring rooms reset or re-partition runtime state in ways that conflict with this goal. They also complicate persistence of player/control state during normal room-to-room movement.

The architecture is already moving toward JSON-driven room data and controller orchestration, which supports runtime room fetch/render in the current active scene.

## Decision

### 1) Default Traversal Uses Single-Scene Streaming

Adjacent rooms are loaded by streaming room JSON into the currently active scene, not by starting/swapping scenes for each neighboring room.

### 2) Scene Transitions Remain an Explicit Exception

Hard transitions remain available for intentional use cases (save rooms, elevators, cinematic transitions, etc.), but they are not the default path for adjacent-room traversal.

### 3) Ownership Boundary

Room/world systems own room graph and loading behavior:

- `RoomStreamingController` manages room loading triggers, cache lookups, and streamed room registration.
- The Player object does not own room graph state or scene transition policy.

### 4) Adjacency Source of Truth and Fallback

For runtime streaming decisions, loading-zone graph edges are primary:

- `loadingZone.targetRoom` (with zone direction/offset context) is the canonical runtime adjacency edge.

Room-level adjacency metadata is a fallback and validation layer:

- optional room JSON adjacency map may provide backup links when no usable zone edge exists.
- legacy `nextRoomLeft` / `nextRoomRight` remains transitional fallback support for hard transitions and compatibility.

When zone-edge and room-level adjacency disagree, runtime streaming prefers zone-edge data and emits a warning for diagnostics.

### 5) Streamed Room Metadata and Ownership Tags

Loaded streamed rooms should be tracked as metadata entries (room key, offsets, and room extents) rather than only raw render outputs.

Streamed runtime instances should be tagged with owner-room identity so downstream systems (especially editor flows) can resolve room-aware behavior in single-scene traversal.

Editor-authored identity/link fields are canonical in streamed runtime:

- `objectId` (stable object identity)
- `sourceRoomKey` (room ownership)
- `targetIds` (puzzle link references)

Streaming/runtime systems may attach transient in-memory metadata for lifecycle or performance reasons, but they must not overwrite valid persisted contract fields.

### 6) Data Path

Streaming consumes room JSON and renders through existing runtime creation boundaries (`RoomRenderer` + contracts), keeping authored data and runtime behavior aligned.

## Consequences

### Positive

- supports seamless room-to-room movement for exploration-focused gameplay
- preserves player/controller continuity during normal traversal
- aligns with JSON-driven authoring and editor save/reload flows
- provides a reusable foundation for future room-connected systems (map, encounter flow, world state)

### Tradeoffs

- higher runtime complexity for streamed object registration and lifecycle management
- collisions/controllers must be re-wired for streamed content at consistent boundaries
- camera bounds/world bounds must expand or coordinate with streamed chunks
- requires explicit policy for unloading distant rooms to avoid long-session memory growth
- requires explicit conflict-handling when room-level adjacency and zone-level adjacency diverge
- increases metadata bookkeeping for streamed-room ownership and editor interoperability
- requires migration compatibility while legacy `key` / `targetGate` link patterns are phased out

## Deferred / Follow-Up Decisions

- loaded room lifecycle policy (when to unload and how to preserve mutable state)
- world bounds/camera bounds growth strategy in larger connected areas
- loaded room instance tracking vs raw room JSON cache vs future persistent save-state
- event/listener deduping rules for streamed objects across repeated room entry paths

## Implementation Notes (Initial)

1. Keep streamed room rendering in the active scene via JSON fetch + `RoomRenderer`.
2. Ensure post-stream registration re-wires collisions, puzzle links, and entity access paths.
3. Keep room-cache, loaded-room instances, and persistent save-state conceptually separate.
4. Prefer zone-edge adjacency for runtime stream decisions; use room-level/legacy adjacency as fallback.
5. Track streamed-room metadata (room key, offset, extents) and propagate owner-room tags to streamed objects.
6. Prefer `targetIds -> objectId` puzzle resolution and keep legacy key-based fallback read-only during migration.
7. Preserve canonical metadata (`objectId`, `sourceRoomKey`, `targetIds`) through stream-in/stream-out cycles.

## Compatibility / Migration

Legacy room JSON that depends on reused puzzle keys (for example `gateA`) is supported temporarily through compatibility fallback behavior. Canonical identity/link fields remain the required write path and long-term source of truth.
