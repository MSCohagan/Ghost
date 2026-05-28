# ADR 0007: Editor Room Context Effective Bounds and Deterministic Overlap Resolution

- Status: Proposed
- Date: 2026-05-27
- Deciders: Project owner + Codex pairing workflow
- Related areas: EditorRoomContextController, LevelEditor, RoomStreamingController, editor save routing

## Context

In streamed single-scene mode, the editor must resolve "which room owns this pointer/object position" so edits are routed to the correct room payload.

Current editor room-context behavior merges base-room bounds and streamed-room bounds, then resolves ownership by the first bounds match. This is ambiguous when bounds overlap. Current seam data includes overlap (for example Room1 span includes x values where Room2 begins), so implicit array-order matching can resolve to the wrong room.

This creates risk for:

- misrouted object placement/edit/delete actions
- incorrect `sourceRoomKey` attribution on save
- nondeterministic behavior when streamed-room registration order changes

## Decision

### 1) Effective Bounds Are Authoritative for Editor Room Resolution

Editor room-at-pointer resolution uses effective room bounds as the contract source-of-truth. Effective bounds are the bounds snapshot produced from:

- base room runtime bounds
- currently streamed room runtime bounds

### 2) Prefer Non-Overlapping Effective Bounds

Authoring/runtime configuration should avoid overlap where possible (for example seam calibration, zone offset tuning, base bounds normalization).

### 3) Deterministic Precedence Required for Overlap

If overlap remains, resolver behavior must use explicit deterministic precedence, not implicit first-match array order.

Policy for candidate matches at a world position:

1. Prefer non-base room candidates over base room candidate.
2. If multiple non-base candidates match, prefer the candidate with highest `offsetX` (farthest-right placement in current horizontal streaming topology).
3. If still tied, prefer lexicographically larger `roomKey` as final stable tie-breaker.

This policy is deterministic across frames and independent of registration iteration order.

### 4) Runtime-Scope Performance Policy

Per-frame room-context checks are acceptable while editor is active and bounds count is small. Optimization/indexing is deferred until profiling indicates need.

## Consequences

### Positive

- deterministic room ownership resolution in overlap regions
- stable `sourceRoomKey` attribution for editor mutations and save payloads
- reduced seam-specific misrouting regressions

### Tradeoffs

- precedence rule must be documented and tested alongside seam data changes
- future non-horizontal topologies may require precedence policy extension

## Deferred / Follow-Up Decisions

- whether to introduce explicit numeric `editorOwnershipPriority` in bounds metadata instead of derived precedence
- whether overlap should become save-time/editor validation failure versus warning
- whether vertical/graph-based streaming layouts need alternate precedence ordering

## Implementation Notes (Initial)

1. Build room candidate list from effective bounds snapshot each update.
2. Filter candidates by point-in-bounds.
3. If 0 candidates: return `null`.
4. If 1 candidate: return candidate room key.
5. If >1 candidates: apply deterministic precedence policy above.
6. Keep debug logging optional and non-spammy for overlap diagnostics.

## Validation

- Add focused unit/integration coverage for overlap region ownership resolution.
- Include seam playtest checklist: pointer sweep across Room1/Room2 overlap resolves to intended room key according to policy.
