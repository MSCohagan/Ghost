import RoomController from '@/controllers/room/RoomController.js'

export default class BaseRoom extends Phaser.Scene {
  constructor(key, nextRoomLeft, nextRoomRight, options = {}) {
    super(key)
    this.roomWidth = options.width ?? 1280
    this.roomHeight = options.height ?? 720
    this.backgroundKey = options.backgroundKey ?? 'gray'
    this.roomKey = key
    this.nextRoomLeft = nextRoomLeft ?? ''
    this.nextRoomRight = nextRoomRight ?? ''
  }

  preload() {
    this.load.json(this.roomKey, `/assets/rooms/${this.roomKey}.json?v=${Date.now()}`)
  }

  createBaseRoom(x, y) {
    this.roomController = new RoomController(this, { x, y })
    this.roomController.create()
  }

  update(time, delta) {
    this.roomController?.update(time, delta)
  }
}
