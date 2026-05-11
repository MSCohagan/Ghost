# Architecture Deep Dive

This diagram captures the deeper controller and lifecycle flow used during room setup, update, and streaming registration.

```mermaid
flowchart TD
  A[BaseRoom] --> B[RoomController.create]

  B --> C[loadRoomData]
  B --> D[setupWorld]
  B --> E[setupControls]
  B --> F[renderRoom]
  B --> G[createPlayer]
  B --> H[setupEntities]
  B --> I[setupControllers]

  F --> J[RoomRenderer.render roomData]
  J --> K[objectRegistry factories by type]
  J --> L[per-render output]

  L --> L1[entities]
  L --> L2[groups]
  L --> L3[collisionObjects]
  L --> L4[collisionRules]
  L --> L5[createdObjects]

  H --> M[scene.entities]
  M --> M1[possessables]
  M --> M2[gates]
  M --> M3[pressurePlates]
  M --> M4[loadingZones]

  I --> N[ColliderController.wireRoomCollisions]
  I --> O[RoomTransitionController]
  I --> P[RoomStreamingController]
  I --> Q[DevToolsController]
  I --> R[PossessionController]
  I --> S[PuzzleController]
  I --> T[InputController]

  U[RoomController.update] --> T
  U --> S
  U --> P
  U --> V[controlledEntity.update]

  P --> W[LoadingZone enter event]
  W --> X[fetch room JSON]
  X --> Y[RoomRenderer.render offsetX/offsetY]
  Y --> Z[registerStreamedRoom]
  Z --> M
  Z --> N
  Z --> P1[loading zone listener dedupe]

  S --> M1
  S --> M2
  S --> M3

  R --> M1
  T --> R
```

## Lifecycle Intent

- `BaseRoom` and `LevelEditor` stay orchestration-focused.
- `RoomRenderer` is the runtime creation boundary for JSON-authored content.
- `RoomStreamingController` owns same-scene adjacent-room streaming and registration.
- Collision and puzzle systems consume live entity collections after streaming updates.
