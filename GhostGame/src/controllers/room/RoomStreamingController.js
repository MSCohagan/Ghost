export default class RoomStreamingController {
  constructor(scene, entities = {}) {
    this.scene = scene

    this.roomCache = new Map()
    this.loadedRooms = new Map()

    this.targetRoom = null
    this.inLoadingZone = false
    this.loadingZones = entities.loadingZones ?? []
    this.possessables = entities.possessables ?? []

    this.setupLoadingZoneEvents()
  }

  setupLoadingZoneEvents() {
    console.log('Setting up loading zone events')
    console.log('loadingZones = ', this.loadingZones)
    this.loadingZones.forEach((zone) => {
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
    if (!zone.targetRoom || !zone.inLoadingZone) {
      console.warn('No target room specified for loading zone')
      return
    }

    if (this.loadedRooms.has(zone.targetRoom)) return

    const roomData = await this.getRoomData(zone.targetRoom)

    console.log('room data loaded: ', roomData)
    console.log('load room', zone.targetRoom, zone.direction, zone.offsetX, zone.offsetY)

    console.log('calling room renderer')
    const roomObjects = this.scene.roomRenderer.render(roomData, {
      offsetX: zone.offsetX,
      offsetY: zone.offsetY,
    })

    this.loadedRooms.set(zone.targetRoom, roomObjects)
    this.registerStreamedRoom(roomObjects, roomData, zone)
    console.log('streamed room: ', zone.targetRoom)
    console.log('scene possessables', this.scene.possessables)
    console.log('controller possesables', this.scene.possessionController.possessables)
  }

  registerStreamedRoom(roomObjects, roomData, zone) {
    const newPossessables = roomObjects.entities.possessables ?? []
    this.scene.possessables.push(...newPossessables)

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
        this.possessables.some((obj) => this.scene.physics.overlap(obj, zone))
      ) {
        zone.enterLoadingZone()
      } else {
        zone.exitLoadingZone()
      }
    })
  }
}
