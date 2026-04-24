import Player from '../gameObjects/Player.js'
import Box from '../gameObjects/Box.js'

export class Room2 extends Phaser.Scene {

    constructor() {
        super('Room2');
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
        this.ground = this.physics.add.staticGroup();
        this.createPlatforms(this.ground, 0, this.scale.height - 24, this.scale.width, 1, 3)
        this.createPlatforms(this.platforms, 400, this.scale.height - 480, this.scale.width * (Math.random() + .5) , 1, 3)

        this.controls = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            jump: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
            possess: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
            release: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
            reload: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R)
        }

        this.player = new Player(this, 100, 500, {
            width: 24,
            height: 40,
            color: 0x88ffff,
            speed: 200,
            jumpVelocity: -350,
            gravityY: 0,
        })

        this.box = new Box(this, 800, 0, {
            width: 24,
            height: 40,
            color: 0x000000,
            speed: 200,
            jumpVelocity: -350,
            gravityY: 800,
        })

        this.controlledEntity = this.player

        this.physics.add.collider(this.player, this.ground)
        this.physics.add.collider(this.box, this.platforms)
        this.physics.add.collider(this.box, this.ground)
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

        if(Phaser.Input.Keyboard.JustDown(this.controls.reload)) {
            this.scene.start('Start');
        }

        this.controlledEntity.update()

        if(this.player.x - 24 <= 0) {
            this.scene.start('Start')
        }
    }

    createPlatforms(entity, startX,  y, width, frame, scale = 3) {
        const tileSize = 16
        const step = tileSize * scale
        const endX = startX + width

        for (let x = startX; x < endX; x += step) {
            const tile = entity.create(x, y, `platforms`, frame)
            tile.setOrigin(0, 0)
            tile.setScale(scale)
            tile.refreshBody()
        }
    }
}