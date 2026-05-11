# ADR 0004: Editor Ownership and Save Model

- Status: Proposed
- Date: 2026-05-10
- Deciders: Project owner + Codex pairing workflow
- Related areas: LevelEditor, Editor\*Controller modules, room JSON save/reload

## Context

<!--
Describe the need for explicit editor boundaries.
Prompt ideas:
- Why keep LevelEditor thin/orchestration-only?
- Why controllerized editor subsystems?
- What breaks once multi-room streaming enters editing workflows?
-->

## Decision

<!--
Capture the concrete decision.
Prompt ideas:
- Editor remains orchestration-focused with behavior delegated to editor controllers.
- Save model writes JSON as authoritative room data.
- Multi-room editing requires explicit activeEditRoomKey (or equivalent) ownership.
-->

## Consequences

### Positive

<!--
Prompt ideas:
- easier extension and testing of editor behaviors
- cleaner ownership boundaries
- clearer path to advanced editor features
-->

### Tradeoffs

<!--
Prompt ideas:
- additional coordination between runtime and editor state
- more explicit room-selection UX work required
-->

## Deferred / Follow-Up Decisions

<!--
Prompt ideas:
- multi-room edit UX
- object linking UI for targetIds
- undo/redo and grouping architecture
-->

## Implementation Notes (Initial)

1. <!-- note -->
2. <!-- note -->
3. <!-- note -->
