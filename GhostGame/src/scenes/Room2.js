import BaseRoom from './BaseRoom.js'

export default class Room2 extends BaseRoom {

    constructor() {
        super('Room2', 'Room1', 'Room3', {
            width: 1280,
            height: 720,
            backgroundKey: 'gray'
        });
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
            collisionRules: this.collisionRules
        }

        this.scene.events.emit('room-render-complete', result)

        return result
    }
}