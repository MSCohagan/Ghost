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

### 4) Data Path

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

## Deferred / Follow-Up Decisions

- loaded room lifecycle policy (when to unload and how to preserve mutable state)
- world bounds/camera bounds growth strategy in larger connected areas
- loaded room instance tracking vs raw room JSON cache vs future persistent save-state
- event/listener deduping rules for streamed objects across repeated room entry paths

## Implementation Notes (Initial)

1. Keep streamed room rendering in the active scene via JSON fetch + `RoomRenderer`.
2. Ensure post-stream registration re-wires collisions, puzzle links, and entity access paths.
3. Keep room-cache, loaded-room instances, and persistent save-state conceptually separate.
