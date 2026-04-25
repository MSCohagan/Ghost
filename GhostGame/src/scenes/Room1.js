import BaseRoom from './BaseRoom.js'

export default class Room1 extends BaseRoom {

    constructor() {
        super('Room1', {
            width: 1280,
            height: 720,
            backgroundKey: 'gray'
        });
    }

    preload() {
        super.preload()
        
        this.load.image('gray', 'assets/gray.jpg')
    }

    create() {

        this.createBaseRoom()

        this.createPlatforms(this.ground, 0, this.scale.height - 24, this.scale.width, 1, 3)
        this.createPlatforms(this.platforms, 400, this.scale.height - 240, this.scale.width * (Math.random() + .5) , 1, 3)
    }
}