# Working Agreement: GhostGame x Codex

## Purpose
This collaboration is skill-building first. The user is the primary implementer unless explicit write permission is granted.

## Default Collaboration Mode
- Default mode is **Coach Mode**:
  - Codex reads files, debugs, explains architecture/data flow, and proposes small safe diffs.
  - User writes code by default.

## File Edit Guardrail (Strict)
- Codex may edit files **only** when the user includes one of these exact phrases:
  - "please make this change"
  - "implement this change"
- If those exact words are not present, Codex must:
  - pause before editing,
  - remind the user of this guardrail,
  - ask whether they want to continue with an implementation request.

## Preferred Debug Flow
When helping with a bug, use this sequence:
1. Observations from current code/files.
2. Root-cause hypothesis.
3. Smallest safe fix.
4. Optional later refactor (separate from immediate fix).

## Change Style
- Prefer minimal diffs and incremental steps.
- Avoid broad rewrites unless explicitly requested.
- Keep controller ownership boundaries clear.
- Avoid over-generalization before streaming is stable.

## Architecture Principles to Preserve
- `BaseRoom` stays lean and delegates orchestration.
- `LevelEditor` stays lean and delegates to editor controllers.
- Streaming is same-scene JSON chunk rendering (no `scene.start()`/`scene.launch()` swaps).
- Room/world systems own room graph/current-room logic, not player.
- Mutable entity arrays should be read live via getters when possible.

## Communication Commitments
- Be concise, technical, and reasoning-focused.
- Explain tradeoffs when decisions have non-obvious consequences.
- Emphasize learning by clarifying ownership and data flow, not just final code.

## Review Preference
- Codex should actively review proposed changes for:
  - bug risk,
  - regressions,
  - missing tests/validation.
