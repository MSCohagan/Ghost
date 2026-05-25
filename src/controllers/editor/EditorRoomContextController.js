/**
 * @typedef {Object} RoomBounds
 * @property {number} offsetX
 * @property {number} offsetY
 * @property {number} roomWidth
 * @property {number} roomHeight
 */

/**
 * @typedef {Object} RoomBoundsMeta
 * @property {string} roomKey
 * @property {RoomBounds} bounds
 */

/**
 * @typedef {Object} RoomInstanceMeta
 * @property {string} roomKey
 * @property {string} sourceRoomKey
 * @property {RoomBounds} bounds
 * @property {unknown} roomObjects
 */

export default class EditorRoomContextController {
  constructor(editor) {
    this.editor = editor
    this.host = editor.hostScene

    /** @type {RoomBoundsMeta[]} */
    this.baseRoomBounds = [
      {
        roomKey: this.host.roomKey,
        bounds: {
          offsetX: 0,
          offsetY: 0,
          roomWidth: this.host.roomWidth,
          roomHeight: this.host.roomHeight,
        },
      },
    ]

    /** @type {Map<string, RoomInstanceMeta>} */
    this.loadedRooms = new Map()
  }

  create() {
    this.getRoomAtPointer(
      this.editor.pointerController.getWorldPosition(this.editor.input.activePointer)
    )
  }

  /**
   * @returns {RoomBoundsMeta[]}
   */
  getWorldBounds() {
    this.loadedRooms = this.host.roomStreamingController.loadedRooms
    const streamedRoomBounds = Array.from(this.loadedRooms.values(), (roomMeta) => ({
      roomKey: roomMeta.roomKey,
      bounds: roomMeta.bounds,
    }))

    return [...this.baseRoomBounds, ...streamedRoomBounds]
  }

  /**
   * @param {{ x: number, y: number } | null | undefined} worldPosition
   * @returns {string | null}
   */
  getRoomAtPointer(worldPosition) {
    if (!worldPosition) return null

    const loadedRooms = this.getWorldBounds()
    console.log('loaded rooms: ', loadedRooms)

    if (loadedRooms.length === 1) {
      console.log('exiting at world bounds for baseRoom')
      console.log('worldBounds at room key: ', loadedRooms[0].roomKey)
      return loadedRooms[0].roomKey
    }

    const match = loadedRooms.find((room) => {
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
