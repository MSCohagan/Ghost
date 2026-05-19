export default class RoomStreamingController {
  constructor(scene, entities = {}) {
    this.scene = scene

    this.roomCache = new Map()
    this.loadedRooms = new Map()

    this.targetRoom = null
    this.inLoadingZone = false
    this.loadRequestCounter = 0
    this.inflightLoads = new Set()
    this.streamMarginPx = 384
    this.loadingZones = entities.loadingZones ?? []
    this.possessables = entities.possessables ?? []

    this.setupLoadingZoneEventsFor(this.loadingZones)
  }

  setupLoadingZoneEventsFor(loadingZones) {
    console.log('Setting up loading zone events')
    console.log('loadingZones = ', this.loadingZones)
    if (!loadingZones || loadingZones.length === 0) return
    loadingZones.forEach((zone) => {
      if (zone._streamListenersBound) return
      zone.on('enteredLoadingZone', (zone) => {
        if (this.loadedRooms.has(zone.targetRoom) || this.inflightLoads.has(zone.targetRoom)) return
        this.inLoadingZone = true
        this.targetRoom = zone.targetRoom
        console.log(`Entered loading zone for room: ${zone.targetRoom}`)
        this.loadRoom(this.targetRoom, zone)
      })

      zone.on('exitedLoadingZone', () => {
        this.inLoadingZone = false
        this.targetRoom = null
        console.log('Exited loading zone')
      })
      zone._streamListenersBound = true
    })
  }

  async getRoomData(roomKey) {
    if (this.roomCache.has(roomKey)) {
      return this.roomCache.get(roomKey)
    }

    const response = await fetch(`/assets/rooms/${roomKey}.json?v=${Date.now()}`)
    const roomData = await response.json()

    this.roomCache.set(roomKey, roomData)
    return roomData
  }

  checkPrefetchZones(zone) {
    const scene = this.scene
    const player = scene.player
    const currentHost = scene.possessionController.currentHost

    if (!this.loadingZones?.length) return

    const sourceBounds = currentHost?.body?.enable
      ? currentHost.getBounds()
      : player?.body?.enable
        ? player.getBounds()
        : null

    if (!sourceBounds) return

    const targetRoom = zone.targetRoom
    if (!targetRoom) return
    if (this.loadedRooms.has(targetRoom)) return
    if (this.inflightLoads.has(targetRoom)) return

    const shouldPrefetch = this.isWithinPrefetchMargin(sourceBounds, zone)

    if (shouldPrefetch) {
      this.loadRoom(targetRoom, zone, { requireZoneEntry: false })
    }
  }

  isWithinPrefetchMargin(playerBounds, zone) {
    const margin = this.streamMarginPx

    const zoneBounds = zone.getBounds ? zone.getBounds() : zone

    switch (zone.direction) {
      case 'right': {
        const distance = zoneBounds.left - playerBounds.right
        return distance <= margin && distance >= -32
      }
      case 'left': {
        const distance = playerBounds.left - zoneBounds.right
        return distance <= margin && distance >= -32
      }
      case 'down': {
        const distance = zoneBounds.top - playerBounds.bottom
        return distance <= margin && distance >= -32
      }
      case 'up': {
        const distance = playerBounds.top - zoneBounds.bottom
        return distance <= margin && distance >= -32
      }
      default:
        return false
    }
  }

  async loadRoom(targetRoom, zone, { requireZoneEntry = false } = {}) {
    if (!targetRoom || !zone) return

    const requestId = ++this.loadRequestCounter
    const target = zone.targetRoom

    if (this.loadedRooms.has(targetRoom)) {
      console.log(`[RoomStreaming][${requestId}] skip already loaded target=${target}`)
      return
    }

    if (this.inflightLoads.has(targetRoom)) {
      console.log(`[RoomStreaming][${requestId}] skip in-flight target=${target}`)
      return
    }

    if (requireZoneEntry && !zone.inLoadingZone) return

    console.log(
      `[RoomStreaming][${requestId}] loadRoom start target=${target} inZone=${zone.inLoadingZone}`
    )

    this.inflightLoads.add(targetRoom)

    try {
      const roomData = await this.getRoomData(targetRoom)
      const streamContext = {
        offsetX: zone.offsetX ?? 0,
        offsetY: zone.offsetY ?? 0,
        targetRoom,
      }

      console.log('room data loaded: ', roomData)
      console.log('load room', targetRoom, zone.direction, zone.offsetX, zone.offsetY)

      console.log('calling room renderer')
      const roomObjects = this.scene.roomRenderer.render(roomData, {
        offsetX: zone.offsetX,
        offsetY: zone.offsetY,
      })

      this.registerStreamedRoom(roomData, roomObjects, streamContext)

      this.loadedRooms.set(targetRoom, roomObjects)
    } finally {
      this.inflightLoads.delete(targetRoom)
    }

    console.log('streamed room: ', targetRoom)
    console.log(
      `[RoomStreaming][${requestId}] scene possessables length=${this.scene.possessables.length}`
    )
    console.log(
      `[RoomStreaming][${requestId}] controller possessables length=${this.scene.possessionController.possessables.length}`
    )
  }

  tagTargetRoomObjects(entities, sourceRoomKey) {
    for (const [key, value] of Object.entries(entities)) {
      if (Array.isArray(value)) {
        value.forEach((obj) => {
          obj.sourceRoomKey = sourceRoomKey
        })
      } else {
        value.sourceRoomKey = sourceRoomKey
      }
    }
  }

  registerStreamedRoom(roomData, roomObjects, streamContext) {
    const { targetRoom, offsetX, offsetY } = streamContext
    console.log(`[RoomStreaming] registering streamed room: ${targetRoom}`)
    console.log(
      `[RoomStreaming] pre-register scene.possessables length=${this.scene.possessables.length}`
    )

    this.tagTargetRoomObjects(roomObjects.entities, targetRoom)

    const newPossessables = roomObjects.entities.possessables ?? []
    const newGates = roomObjects.entities.gates ?? []
    const newPressurePlates = roomObjects.entities.pressurePlates ?? []
    const newLoadingZones = roomObjects.entities.loadingZones ?? []

    console.log(
      `[RoomStreaming] roomObjects.entities.possessables length=${newPossessables.length}`
    )
    this.scene.possessables.push(...newPossessables)
    console.log(
      `[RoomStreaming] post-push scene.possessables length=${this.scene.possessables.length}`
    )
    this.scene.gates.push(...newGates)
    this.scene.pressurePlates.push(...newPressurePlates)
    this.scene.puzzleController?.setupPressurePlateEventsFor?.(newPressurePlates)
    this.loadingZones.push(...newLoadingZones)
    this.setupLoadingZoneEventsFor(newLoadingZones)

    this.scene.possessionController?.refreshPossessables?.(this.scene.possessables)

    this.scene.colliderController.wireRoomCollisions({
      player: this.scene.player,
      possessables: this.scene.possessables,
      groups: roomObjects.groups,
      collisionRules: roomObjects.collisionRules,
      collisionObjects: roomObjects.collisionObjects,
    })

    const worldWidth = Math.max(
      this.scene.physics.world.bounds.width,
      offsetX + (roomData.roomWidth ?? this.scene.roomWidth)
    )

    const worldHeight = Math.max(
      this.scene.physics.world.bounds.height,
      offsetY + (roomData.roomHeight ?? this.scene.roomHeight)
    )

    this.scene.physics.world.setBounds(0, 0, worldWidth, worldHeight)
    this.scene.camera.setBounds(0, 0, worldWidth, worldHeight)
  }

  update() {
    this.loadingZones.forEach((zone) => {
      this.checkPrefetchZones(zone)
      if (
        this.scene.physics.overlap(this.scene.player, zone) ||
        this.scene.possessables.some((obj) => this.scene.physics.overlap(obj, zone))
      ) {
        zone.enterLoadingZone()
      } else {
        zone.exitLoadingZone()
      }
    })
  }
}
