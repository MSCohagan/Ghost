import BaseRoom from './BaseRoom.js'

export default class Room1 extends BaseRoom {
  constructor() {
    super('Room3', 'Room2', '', {
      width: 1280,
      height: 720,
      backgroundKey: 'gray',
    })
  }

  init(data) {
    this.spawnX = data.spawnX ?? 300
    this.spawnY = data.spawnY ?? 300
  }

  preload() {
    super.preload()

    this.load.image('gray', '/assets/gray.jpg')
  }

  create() {
    this.createBaseRoom(this.spawnX, this.spawnY)
  }

  render(roomData) {
    const result = {
      groups: this.groups,
      entities: this.entities,
      playerSpawn: this.playerSpawn ?? null,
      collisionRules: this.collisionRules,
    }

    this.scene.events.emit('room-render-complete', result)

    return result
  }
}
