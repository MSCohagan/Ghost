export default class EditorRoomContextController {
  constructor(editor) {
    this.editor = editor
    this.host = editor.hostScene
    this.worldBounds = [
      {
        roomKey: 'room1',
        bounds: {
          offsetX: 0,
          offsetY: 0,
          roomWidth: this.host.roomWidth,
          roomHeight: this.host.roomHeight,
        },
      },
    ]
  }

  create() {
    this.getRoomAtPointer(
      this.editor.pointerController.getWorldPosition(this.editor.input.activePointer)
    )
  }

  getWorldBounds() {
    const loadedRooms = this.host.roomStreamingController.loadedRooms
    return Array.from(loadedRooms.values(), (roomMeta) => ({
      roomKey: roomMeta.roomKey,
      bounds: roomMeta.bounds,
    }))
  }

  getRoomAtPointer(worldPosition) {
    if (!worldPosition || !this.worldBounds?.length) return null

    if (this.worldBounds.length === 1) {
      console.log('exiting at world bounds for room 1')
      return this.worldBounds[0].roomKey
    }

    const match = this.worldBounds.find((room) => {
      const { offsetX, offsetY, roomWidth, roomHeight } = room.bounds
      const withinX = worldPosition.x >= offsetX && worldPosition.x < offsetX + roomWidth
      const withinY = worldPosition.y >= offsetY && worldPosition.y < offsetY + roomHeight
      return withinX && withinY
    })

    console.log('match: ', match?.roomKey ?? null)
    return match?.roomKey ?? null
  }

  update() {
    this.getRoomAtPointer(
      this.editor.pointerController.getWorldPosition(this.editor.input.activePointer)
    )
  }
}
