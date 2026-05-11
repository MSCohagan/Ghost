## Summary

<!-- What changed and why in 2-6 bullets. -->

## Scope

- [ ] Docs only
- [ ] Tests only
- [ ] Refactor (no behavior change)
- [ ] Bug fix
- [ ] Feature

## Architecture / ADR Compliance

- [ ] This change is aligned with existing ADRs
- [ ] ADR(s) referenced below (if architecture-impacting)
- [ ] New/updated ADR included (if needed)

ADR references:

- <!-- e.g. docs/adr/0003-single-scene-room-streaming.md -->

## Validation

### Local checks run

- [ ] `npm run lint`
- [ ] `npm run test`
- [ ] `npm run generate:assets` (if asset pipeline touched)

### Manual checks run

- [ ] Not applicable
- [ ] Gameplay flow sanity check
- [ ] Editor save/reload sanity check
- [ ] Room streaming sanity check

Manual test notes:

- <!-- What you manually verified -->

## Data / Contract Impact

- [ ] No room JSON contract impact
- [ ] Room JSON shape changed
- [ ] Object contract behavior changed (`id` / `targetIds` / legacy fallback)

If changed, describe migration/compatibility notes:

- <!-- details -->

## Asset and Licensing Checklist

- [ ] No asset changes
- [ ] Asset changes are first-party only
- [ ] Third-party assets were added/modified and provenance docs were updated

If third-party assets changed:

- Updated: `docs/ASSET_ATTRIBUTION.md`
- License/credits files preserved in `public/assets/third_party/...`

## Risks / Follow-Ups

Known risks:

- <!-- possible regression areas -->

Follow-up tasks:

- <!-- non-blocking next steps -->

## Screenshots / Diagrams (Optional)

<!-- Include screenshots/GIFs/diagram links when helpful -->
