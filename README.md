# Will o' the Wisp (GhostGame)

Will o' the Wisp is a Phaser 4 puzzle-platformer prototype centered around a ghost character who can possess world objects to solve traversal and logic puzzles.

This project also serves as a mini engine / tooling sandbox focused on data-driven rooms, in-game authoring, and room streaming in a single active scene.

## Portfolio Focus

This repository is intended as a portfolio project demonstrating:

- JavaScript architecture and controller orchestration
- JSON-driven game content pipelines
- Runtime room streaming and system synchronization
- In-game editor tooling and save/reload workflows
- Testing discipline with Vitest

## Current State

The project is in active prototype development. Current phase priorities:

- Author rooms in the in-game editor
- Save/reload room JSON
- Stream adjacent rooms without scene resets
- Keep collisions, entities, and controllers consistent after streaming

## Gameplay Preview

### Core Movement and Possession

![Core Movement and Possession](./docs/media/GhostMovementAndPossession.gif)

## Architecture Highlights

- `BaseRoom` stays lean and delegates to room controllers.
- `RoomController` orchestrates setup and frame updates.
- `RoomRenderer` creates runtime objects from room JSON via an object registry.
- `RoomStreamingController` loads and renders room JSON into the same active scene.
- `LevelEditor` delegates behavior to editor-focused controllers.
- Runtime systems are moving toward validated object contracts (`id`, `targetIds`) with legacy fallback support where needed.

## Architecture Diagrams

![Architecture Overview](./docs/diagrams/architecture-overview.png)

![Architecture Deep Dive](./docs/diagrams/architecture-deep-dive.png)

## Tech Stack

- Phaser 4
- Vite
- JavaScript (ES modules)
- Vitest
- Prettier

## Getting Started

Requirements:

- Node.js 24+ (recommended based on current setup)

Install:

```bash
npm install
```

Run game:

```bash
npm run dev
```

Run game + local save server (servers only, no pre-generation):

```bash
npm run dev:editor
```

Run game + local save server with asset generation prep:

```bash
npm run dev:editor:prep
```

Build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Asset/Editor Pipeline Scripts

```bash
npm run manifest
npm run normalize-assets
npm run palette
```

`predev:editor` runs these before `dev:editor`.

## Testing

Run all tests:

```bash
npm run test
```

Watch mode:

```bash
npm run test:watch
```

## Project Docs

- [Project Overview](./docs/PROJECT_OVERVIEW.md)
- [ADR Index](./docs/adr)
- [Architecture Overview](./docs/ARCHITECTURE_OVERVIEW.md)
- [Architecture Deep Dive](./docs/ARCHITECTURE_DEEP_DIVE.md)
- [Asset Attribution](./docs/ASSET_ATTRIBUTION.md)
- [Working Agreement](./WORKING_AGREEMENT.md)

## Roadmap

This project is actively evolving from a streaming/editor prototype into a full puzzle-platformer experience.
The near-term goal is to stabilize the core systems so future gameplay content can scale cleanly.

### Near-Term Priorities (Current Phase)

- finalize streamed collision consistency
- lock down gate/pressure-plate behavior across room boundaries
- formalize loaded room lifecycle metadata (`loadedRooms`)
- complete multi-room editor save ownership (`activeEditRoomKey`)
- add room-key normalization guard in save flow

### Upcoming Gameplay and World Systems

- enemy movement/pathing
- enemy spawn and encounter logic
- enemy attack patterns
- boss-room structure and pacing
- environmental puzzle bosses
- chandelier possession boss concept
- connected room map and world navigation

### Save/State and UI Foundations

- save game state
- persistent world state
- main menu
- pause menu
- config/options

### Editor Expansion

- multi-select
- grouped editing
- improved placement preview
- room-to-room editor navigation
- undo/redo

### Custom Content (Long-Term)

- custom level support
- room import/export workflows
- deeper JSON-driven content authoring
- mod support (if there is audience demand)

## Source Availability and Rights

This source is published for portfolio review and development progress visibility.

All rights are reserved. No permission is granted to copy, modify, redistribute, or use this codebase or assets for commercial or non-commercial purposes without explicit written permission.

See [LICENSE](./LICENSE) for details.

## Startup Shortcuts

Use these helper commands from repo root:

- `./start`: full preflight (install, generate assets, audit/rewrite, lint, test, then `dev:editor`)
- `./start --fast`: iteration mode (generate assets + audit/rewrite, then `dev:editor`; skips install, lint, and test)
- `npm run dev:editor:prep`: package-script equivalent for generation prep + server startup
