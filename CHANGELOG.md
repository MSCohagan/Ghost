# Changelog

All notable project milestones are documented in this file.

This project currently uses a manual, milestone-oriented changelog format. As version tags/releases become formalized, entries may transition to release-tag-driven notes.

## [Unreleased]

### Added

- Repository process/docs hardening in progress.

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
