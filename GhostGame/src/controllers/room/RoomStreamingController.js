export default class RoomStreamingController {
  constructor(scene, entities = {}) {
    this.scene = scene

    this.roomCache = new Map()
    this.loadedRooms = new Map()

    this.targetRoom = null
    this.inLoadingZone = false
    this.loadRequestCounter = 0
    this.inflightLoads = new Set()
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
        this.inLoadingZone = true
        this.targetRoom = zone.targetRoom
        console.log(`Entered loading zone for room: ${zone.targetRoom}`)
        this.loadRoom(zone)
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

  async loadRoom(zone) {
    const requestId = ++this.loadRequestCounter
    const target = zone.targetRoom
    console.log(
      `[RoomStreaming][${requestId}] loadRoom start target=${target} inZone=${zone.inLoadingZone}`
    )

    if (!zone.targetRoom || !zone.inLoadingZone) {
      console.warn('No target room specified for loading zone')
      return
    }

    if (this.loadedRooms.has(zone.targetRoom)) {
      console.log(`[RoomStreaming][${requestId}] skip already loaded target=${target}`)
      return
    }

    if (this.inflightLoads.has(zone.targetRoom)) {
      console.log(`[RoomStreaming][${requestId}] skip in-flight target=${target}`)
      return
    }

    this.inflightLoads.add(zone.targetRoom)

    const roomData = await this.getRoomData(zone.targetRoom)

    console.log('room data loaded: ', roomData)
    console.log('load room', zone.targetRoom, zone.direction, zone.offsetX, zone.offsetY)

    console.log('calling room renderer')
    const roomObjects = this.scene.roomRenderer.render(roomData, {
      offsetX: zone.offsetX,
      offsetY: zone.offsetY,
    })

    this.loadedRooms.set(zone.targetRoom, roomObjects)
    this.inflightLoads.delete(zone.targetRoom)
    this.registerStreamedRoom(roomObjects, roomData, zone)
    console.log('streamed room: ', zone.targetRoom)
    console.log(
      `[RoomStreaming][${requestId}] scene possessables length=${this.scene.possessables.length}`
    )
    console.log(
      `[RoomStreaming][${requestId}] controller possessables length=${this.scene.possessionController.possessables.length}`
    )
  }

  registerStreamedRoom(roomObjects, roomData, zone) {
    console.log(
      `[RoomStreaming] pre-register scene.possessables length=${this.scene.possessables.length}`
    )

    const newPossessables = roomObjects.entities.possessables ?? []
    console.log(
      `[RoomStreaming] roomObjects.entities.possessables length=${newPossessables.length}`
    )
    this.scene.possessables.push(...newPossessables)
    console.log(
      `[RoomStreaming] post-push scene.possessables length=${this.scene.possessables.length}`
    )

    const newGates = roomObjects.entities.gates ?? []
    this.scene.gates.push(...newGates)

    const newPressurePlates = roomObjects.entities.pressurePlates ?? []
    this.scene.pressurePlates.push(...newPressurePlates)

    const newLoadingZones = roomObjects.entities.loadingZones ?? []
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
      zone.offsetX + (roomData.roomWidth ?? this.scene.roomWidth)
    )

    const worldHeight = Math.max(
      this.scene.physics.world.bounds.height,
      zone.offsetY + (roomData.roomHeight ?? this.scene.roomHeight)
    )

    this.scene.physics.world.setBounds(0, 0, worldWidth, worldHeight)
    this.scene.camera.setBounds(0, 0, worldWidth, worldHeight)
  }

  update() {
    this.loadingZones.forEach((zone) => {
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
