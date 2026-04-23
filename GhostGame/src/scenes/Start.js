import Player from '../gameObjects/Player.js'
import Box from '../gameObjects/Box.js'

export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    preload() {
        this.load.image('gray', 'assets/gray.jpg');
        this.load.spritesheet('platforms', 'assets/sprites/platforms.png', {
            frameWidth: 16,
            frameHeight: 16,
        });
        console.log(this.textures.get('platforms'))
    }

    create() {
        this.add.image(1280, 720, 'gray');

        this.platforms = this.physics.add.staticGroup()
        this.createGroundRow(this.scale.height - 24, 1, 3)

        this.player = new Player(this, 100, 100, {
            width: 24,
            height: 40,
            color: 0x88ffff,
            speed: 200,
            jumpVelocity: -350,
            gravityY: 800
        })

        this.box = new Box(this, 200, 100, {
            width: 24,
            height: 40,
            color: 0x88ffff,
            speed: 200,
            jumpVelocity: -350,
            gravityY: 800
        })

        this.physics.add.collider(this.player, this.platforms)
        this.physics.add.collider(this.box, this.platforms)
    }

    update() {
        this.player.update()
    }

    createGroundRow(y, frame, scale = 3) {
        const tileSize = 16
        const step = tileSize * scale
        const width = this.scale.width

        for (let x = 0; x < width; x += step) {
            const tile = this.platforms.create(x, y, 'platforms', frame)
            tile.setOrigin(0, 0)
            tile.setScale(scale)
            tile.refreshBody()
        }
    }
    
}
