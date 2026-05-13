# Changelog

All notable project milestones are documented in this file.

This project currently uses a manual, milestone-oriented changelog format. As version tags/releases become formalized, entries may transition to release-tag-driven notes.

## [Unreleased]

### Added

- Repository process/docs hardening in progress.

### Changed

- `RoomStreamingController` streaming flow hardened:
  - added prefetch-margin loading pass to reduce visible pop-in at room boundaries
  - unified per-zone update handling for prefetch + overlap enter/exit checks
  - clarified loaded/in-flight guard behavior to keep stream loads idempotent
  - added stream context payload (target room + offsets) for registration-time room ownership context
- Room seam cleanup and grid/alignment pass:
  - adjusted Room1 -> Room2 loading-zone offset baseline to `1296` for seam calibration
  - normalized Room1 seam-adjacent platform coordinates to strict 48px lane
  - removed seam-overlap platform artifacts and resolved visible seam gap/overlap churn
- Ground presentation and baseline alignment updates:
  - switched Room1/Room2 bottom ground rows to `sprites_world_tileset` gray-stone tile (`frame: 8`)
  - moved bottom ground row to `y=672` so tile bottoms align with 720px room bottom
- Puzzle object anchoring consistency update:
  - `PressurePlate` now uses top-left origin (`setOrigin(0, 0)`) for placement parity testing

### Added

- `RoomStreamingController` regression tests:
  - prefetch trigger/skip behavior
  - loaded/in-flight duplicate-load guards
  - zone-entry requirement gating
  - unsupported-direction safety fallback

### Notes

- ADR policy updates for streaming adjacency authority and editor room ownership landed in PR `#14`.
- Streaming implementation changes are tracked in PR `#15`.

## [2026-05-10] - Repository Professionalization Milestone

### Added

- `LICENSE` (all rights reserved) for portfolio/source-visibility posture.
- `docs/ASSET_ATTRIBUTION.md` for third-party asset provenance tracking.
- `docs/PROJECT_OVERVIEW.md` for public-facing architecture/project intent summary.
- Architecture diagram docs:
  - `docs/ARCHITECTURE_OVERVIEW.md`
  - `docs/ARCHITECTURE_DEEP_DIVE.md`
- `.github/workflows/ci.yml` for lint/test checks on push/PR.
- `.github/pull_request_template.md` for ADR/testing/licensing review discipline.
- ADR set expansion:
  - `0002` JSON-driven room runtime
  - `0003` single-scene room streaming
  - `0004` editor ownership/save model
  - `0005` asset provenance/licensing policy
  - `0006` testing strategy (prototype phase)

### Changed

- `README.md` upgraded to portfolio-professional structure and doc index links.
- Asset generation scripts and workflows refined for consistency with lint/CI checks.
- Background rendering moved away from unlicensed placeholder dependency.

### Notes

- Current focus remains stable room streaming + editor/save/runtime contract reliability.
