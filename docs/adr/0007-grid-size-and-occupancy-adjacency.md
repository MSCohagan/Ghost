# ADR 0007: Grid Size Authority and Occupancy Adjacency for Possession Release

- Status: Proposed
- Date: 2026-05-14
- Deciders: Project owner + Codex pairing workflow
- Related areas: room JSON contract, editor save pipeline, possession release behavior, grid snapping, streaming/runtime spatial logic

## Context

Grid assumptions are currently distributed across runtime and editor code, with implicit `48px` defaults in multiple places. This makes it harder to evolve room-scale design and creates risk when rooms need different grid resolutions.

Possession release currently uses fixed-offset placement, which can place the player into blocked space. We need deterministic, low-cost placement checks that align with the room grid and current occupancy.

The project also needs a stable data contract for future mechanics (for example alternate gravity states and directional release policies) without requiring expensive broad collision scans at release time.

## Decision

### 1) Room JSON is Authoritative for Grid Size

Each room may define `gridSize` at the room root. Runtime and editor systems read this value as the source of truth.

Fallback remains `48` only when `gridSize` is absent, preserving compatibility for legacy rooms.

### 2) Editor Save Pipeline Persists Occupancy/Adjacency Metadata

The editor save flow will generate occupancy/adjacency metadata from normalized placed-object data (grid cell keyed) and persist it with room data.

This metadata becomes the primary source for cheap local release checks.

### 3) Possession Release Uses Occupancy/Adjacency as Placement Authority

Release placement should evaluate a fixed candidate set around the host and choose the first valid unoccupied location using deterministic ordering.

Collision event history can influence ordering preference, but not replace current occupancy checks.

### 4) Two-Pass Generation Rule for Adjacency

Adjacency generation should be two-pass:

1. Build canonical occupancy index from cleaned objects.
2. Derive adjacency data from that index.

This avoids order-dependent save behavior.

## Consequences

### Positive

- unifies editor and runtime grid behavior under room-owned configuration
- enables deterministic, constant-time local release checks
- reduces spawn-inside-geometry edge cases
- creates a reusable spatial contract for future mechanics

### Tradeoffs

- increases complexity in save normalization logic
- introduces migration concerns for legacy rooms without adjacency data
- requires additional contract tests to avoid schema drift

## Deferred / Follow-Up Decisions

- final persisted adjacency schema (single-layer solids vs typed occupancy layers)
- versioning marker strategy for room-data contract changes
- whether adjacency is stored per object, per cell, or both
- gravity-aware candidate ordering policy for future inverted/variable gravity states

## Implementation Notes (Initial)

1. Set `scene.gridSize` from `roomData.gridSize ?? 48`.
2. Keep runtime/editor fallbacks to `48` only as compatibility defaults.
3. Add save-path adjacency generation after object cleanup and before serialization.
4. Add tests for:
   - `gridSize` propagation across load/editor/save
   - adjacency generation stability
   - safe release candidate selection behavior
