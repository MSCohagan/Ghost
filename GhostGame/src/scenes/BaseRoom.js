import Player from '../gameObjects/Player.js'
import Box from '../gameObjects/Box.js'
import ControlsManager from '../controllers/ControlsManager.js'

export default class BaseRoom extends Phaser.Scene {

    constructor(key, nextRoomLeft, nextRoomRight, spawnX, spawnY, options = {}) {
        super(key);
        this.roomWidth = options.width ?? 1280
        this.roomHeight = options.height ?? 720
        this.backgroundKey = options.backgroundKey ?? 'gray'
        this.roomKey = key
        this.nextRoomLeft = nextRoomLeft ?? ''
        this.nextRoomRight = nextRoomRight ?? ''
        this.spawnX = spawnX ?? 300
        this.spawnY = spawnY ?? 300
    }

    preload() {
        this.load.spritesheet('platforms', 'assets/sprites/platforms.png', {
            frameWidth: 16,
            frameHeight: 16,
        });
    }

    createBaseRoom(x, y) {
        this.add.image(1280, 720, this.backgroundKey)

        this.add.text(this.scale.width/2, 40, this.roomKey, {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5, 0)

        const controlsManager = new ControlsManager(this)
        this.controls = controlsManager.fetchControls()

        this.platforms = this.physics.add.staticGroup()
        this.ground = this.physics.add.staticGroup()

        this.player = new Player(this, x, y, {
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

        this.spawnX = this.box.x + 30
        this.spawnY = this.box.y

        this.player.setPosition(spawnX, spawnY)
        this.player.body.reset(spawnX, spawnY)
        this.player.setVisible(true)
        this.player.body.enable = true

        this.box.setFillStyle(0x000000)

        this.controlledEntity = this.player
    }

    moveRoom() {
        if(this.player.x + 24 >= this.scale.width && this.nextRoomRight) {
            console.log('moving right to ' + this.nextRoomRight)
            console.log('players position at time of movement is ' + this.player.x  + ', ' + this.player.y )
            this.scene.start(this.nextRoomRight, { spawnX: 50, spawnY: this.player.y })
        } else if (this.player.x - 24 <= 0  && this.nextRoomLeft) {
            console.log('moving left to ' + this.nextRoomLeft)
            console.log('players position at time of movement is ' + this.player.x  + ', ' + this.player.y )
            this.scene.start(this.nextRoomLeft, { spawnX: this.scale.width - 40, spawnY: this.player.y })
        }
    }


    update() {
        if(Phaser.Input.Keyboard.JustDown(this.controls.possess)) {
            this.tryPossess()
        }

        if(Phaser.Input.Keyboard.JustDown(this.controls.release)) {
            this.releasePossession()
        }

        if(Phaser.Input.Keyboard.JustDown(this.controls.reload)) {
            this.scene.start(this.roomKey);
        }

        this.controlledEntity.update()

        this.moveRoom();
    }

    createPlatforms(entity, startX,  y, width, frame, scale = 3) {
        const tileSize = 16
        const step = tileSize * scale
        const endX = startX + width

        for (let x = startX; x < endX; x += step) {
            const tile = entity.create(x, y, 'platforms', frame)
            tile.setOrigin(0, 0)
            tile.setScale(scale)
            tile.refreshBody()
        }
    }
}