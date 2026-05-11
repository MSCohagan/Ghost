# Release Checklist

Use this checklist before public demo drops, tagged releases, or portfolio milestone announcements.

## 1) Code Health

- [ ] `npm run lint` passes
- [ ] `npm run test` passes
- [ ] CI checks are green on the release branch/PR
- [ ] No unresolved merge conflicts or temporary debug code

## 2) Asset and Licensing Compliance

- [ ] All third-party assets are under `public/assets/third_party/...`
- [ ] `docs/ASSET_ATTRIBUTION.md` is up to date
- [ ] Third-party license/credits files are present and preserved
- [ ] No unknown-license or unlicensed placeholder assets in release-facing content

## 3) Architecture and ADR Hygiene

- [ ] Architecture-impacting changes reference relevant ADR(s)
- [ ] New architecture decisions have ADR coverage
- [ ] ADR statuses are accurate (`Proposed`, `Accepted`, `Superseded`)

## 4) Data and Runtime Contract Checks

- [ ] Room JSON save/reload roundtrip verified
- [ ] Streamed room registration flow sanity checked
- [ ] No known unresolved contract regressions (`id`, `targetIds`, legacy fallback behavior)

## 5) Documentation Readiness

- [ ] `README.md` reflects current state and setup steps
- [ ] `docs/PROJECT_OVERVIEW.md` reflects current architecture direction
- [ ] Architecture diagram docs are current:
  - `docs/ARCHITECTURE_OVERVIEW.md`
  - `docs/ARCHITECTURE_DEEP_DIVE.md`
- [ ] Changelog entry added for the release/milestone

## 6) Manual Playtest Smoke Checks

- [ ] Player movement baseline feels correct
- [ ] Possession/release behavior sanity checked
- [ ] Puzzle interactions sanity checked
- [ ] Room streaming transitions sanity checked
- [ ] Editor save/reload sanity checked (if editor touched)

## 7) Release Metadata

- [ ] Version/tag decided (if applicable)
- [ ] Release notes drafted
- [ ] Known limitations documented
