# ADR 0005: Asset Provenance and Licensing Policy

- Status: Proposed
- Date: 2026-05-10
- Deciders: Project owner + Codex pairing workflow
- Related areas: `public/assets`, third-party imports, README, attribution docs, release readiness

## Context

The project is being prepared as both a learning project and a public portfolio artifact, with possible commercial release intent in the future.

As asset usage grows, legal and provenance clarity become part of engineering quality. Placeholder or unknown-license assets create avoidable risk, especially in public repositories and release-facing builds.

The project now includes both first-party and third-party assets, so policy is needed to keep source, licensing, and usage boundaries explicit.

## Decision

### 1) Third-Party Asset Location Policy

All third-party assets must be stored under a dedicated namespace:

- `public/assets/third_party/<source_or_pack_name>/...`

This keeps imported content clearly separated from first-party project assets.

### 2) First-Party Asset Location Policy

Project-authored assets remain in first-party paths (for example `public/assets/sprites`, `public/assets/...`) and should not be silently mixed with third-party imports.

### 3) Attribution and License Record Policy

Every third-party asset import must have traceable provenance captured in-repo, including:

- source/package name
- source URL or origin reference
- license type
- attribution/credit notes when applicable
- local folder path

`docs/ASSET_ATTRIBUTION.md` is the canonical project-level reference.

When a pack includes its own license/credits file, that file must be preserved with the imported assets.

### 4) Public/Release Hygiene Policy

Unlicensed or unknown-license placeholder assets are not allowed in public/release-facing branches.

Assets used for temporary local experimentation must be replaced or removed before public-facing publication and before release candidates.

### 5) Runtime/Pipeline Separation

Asset pipeline scripts may discover both first-party and third-party assets, but provenance boundaries must remain clear in filesystem layout and docs.

## Consequences

### Positive

- clearer legal posture for portfolio visibility and future commercialization
- easier auditability of asset origins and rights
- cleaner contributor onboarding and review confidence
- stronger professional signal for project stewardship

### Tradeoffs

- requires ongoing documentation discipline when importing/replacing assets
- adds small process overhead to asset experimentation
- may require periodic pipeline/docs updates as asset sources evolve

## Deferred / Follow-Up Decisions

- whether to add CI checks for required attribution entries
- whether to enforce folder/source policy via lint or pre-commit tooling
- release checklist details for final asset/legal audit
- policy for handling modified derivatives of third-party assets

## Implementation Notes (Initial)

1. Keep third-party imports under `public/assets/third_party/...`.
2. Maintain `docs/ASSET_ATTRIBUTION.md` as part of asset import workflow.
3. Preserve bundled license/credits files inside imported third-party asset directories.
