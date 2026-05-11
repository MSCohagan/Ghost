# ADR 0003: Single-Scene Room Streaming

- Status: Proposed
- Date: 2026-05-10
- Deciders: Project owner + Codex pairing workflow
- Related areas: RoomStreamingController, RoomController, ColliderController, camera/world bounds

## Context

<!--
Describe why room streaming is needed and what alternatives existed.
Prompt ideas:
- Why not scene.start()/scene.launch() for adjacent rooms?
- Why preserve player state and controller continuity?
- What bugs highlighted the need for clear ownership/data flow?
-->

## Decision

<!--
Capture the concrete decision.
Prompt ideas:
- Adjacent rooms stream JSON into the current active scene.
- No scene swap for chunk transitions in this phase.
- Room/world systems own room graph/loading logic (not Player).
-->

## Consequences

### Positive

<!--
Prompt ideas:
- persistent player and controller state
- smoother room traversal
- better fit for streamed puzzle interactions
-->

### Tradeoffs

<!--
Prompt ideas:
- higher complexity for registration/collision consistency
- requires clear lifecycle for loaded/unloaded room chunks
- memory management concerns
-->

## Deferred / Follow-Up Decisions

<!--
Prompt ideas:
- room unloading policy
- world bounds expansion strategy
- loadedRooms vs roomCache vs save-state layering
-->

## Implementation Notes (Initial)

1. <!-- note -->
2. <!-- note -->
3. <!-- note -->
