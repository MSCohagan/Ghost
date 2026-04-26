import BaseRoom from './BaseRoom.js'

export default class Room2 extends BaseRoom {

    constructor() {
        super('Room2', 'Room1', '', {
            width: 1280,
            height: 720,
            backgroundKey: 'gray'
        });
    }

    init(data) {
        this.spawnX = data.spawnX ?? 300
        this.spawnY = data.spawnY ?? 300
    }

    preload() {
        super.preload()
        this.load.image('gray', 'assets/gray.jpg')
    }

   create() {

        this.createBaseRoom(this.spawnX, this.spawnY)

        this.createPlatforms(this.ground, 0, this.scale.height - 24, this.scale.width, 1, 3)
        this.createPlatforms(this.platforms, 400, this.scale.height - 480, this.scale.width * (Math.random() + .5) , 1, 3)

        this.createGates(this, this.scale.width, this.scale.height, 48, this.scale.height * 2, 'gateA')
        this.setupGateCollision(this.gates)
   }
}