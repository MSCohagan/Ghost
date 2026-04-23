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
    }

    create() {
        this.add.image(1280, 720, 'gray');

        this.platforms = this.physics.add.staticGroup()
        this.createGroundRow(this.scale.height - 24, 1, 3)

        this.controls = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            jump: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
            possess: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
            release: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q)
        }

        this.player = new Player(this, 100, 500, {
            width: 24,
            height: 40,
            color: 0x88ffff,
            speed: 200,
            jumpVelocity: -350,
            gravityY: 0,
        })

        this.box = new Box(this, 200, 600, {
            width: 24,
            height: 40,
            color: 0x000000,
            speed: 200,
            jumpVelocity: -350,
            gravityY: 800,
        })

        this.controlledEntity = this.player

        this.physics.add.collider(this.player, this.platforms)
        this.physics.add.collider(this.box, this.platforms)
    }

    tryPossess() {
        const distance = Phaser.Math.Distance.Between(
            this.player.x,
            this.player.y,
            this.box.x,
            this.box.y
        )

        if(distance <= 40) {
            this.controlledEntity = this.box
            this.player.setVisible(false)
            this.player.body.enable = false
            this.box.setFillStyle(0xffffff)
        }
    }
    
    releasePossession() {
        if (this.controlledEntity !== this.box) return

        this.box.body.setVelocityX(0)

        const spawnX = this.box.x + 30
        const spawnY = this.box.y

        this.player.setPosition(spawnX, spawnY)
        this.player.body.reset(spawnX, spawnY)
        this.player.setVisible(true)
        this.player.body.enable = true

        this.box.setFillStyle(0x000000)

        this.controlledEntity = this.player
    }

    update() {
        if(Phaser.Input.Keyboard.JustDown(this.controls.possess)) {
            this.tryPossess()
        }

        if(Phaser.Input.Keyboard.JustDown(this.controls.release)) {
            this.releasePossession()
        }

        this.controlledEntity.update()
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
