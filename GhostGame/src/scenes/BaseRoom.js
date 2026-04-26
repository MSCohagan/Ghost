import Player from '../gameObjects/Player.js'
import Box from '../gameObjects/Box.js'
import Gate from '../gameObjects/Gate.js'
import ControlsManager from '../controllers/ControlsManager.js'
import PossessionController from '../controllers/PossessionController.js'

export default class BaseRoom extends Phaser.Scene {

    constructor(key, nextRoomLeft, nextRoomRight, spawnX, spawnY, options = {}) {
        super(key)
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
        this.gates = this.physics.add.staticGroup()

        this.player = new Player(this, x, y, {
            width: 24,
            height: 40,
            color: 0x88ffff,
            speed: 200,
            jumpVelocity: -350,
            gravityY: 0,
        })

        this.possessables = []
        this.gates =[]

        this.box = new Box(this, 800, 0, {
            width: 24,
            height: 40,
            color: 0x000000,
            speed: 200,
            jumpVelocity: -350,
            gravityY: 800,
        })

        this.registerPossessable(this.box)

        this.controlledEntity = this.player

        this.physics.add.collider(this.player, this.ground)
        this.possessables.forEach(possessable => {
            this.physics.add.collider(possessable, this.platforms)
            this.physics.add.collider(possessable, this.ground)
            this.physics.add.collider(possessable, this.gates)
        })

        const possessionController = new PossessionController(this, this.player)
        this.possess = possessionController.tryPossess
        this.release = possessionController.releasePossession

    }

    moveRoom() {
        if(this.player.x + 24 >= this.scale.width && this.nextRoomRight) {
            this.scene.start(this.nextRoomRight, { spawnX: 50, spawnY: this.player.y })
        } else if (this.player.x - 24 <= 0  && this.nextRoomLeft) {
            this.scene.start(this.nextRoomLeft, { spawnX: this.scale.width - 40, spawnY: this.player.y })
        }
    }


    update() {
        if(Phaser.Input.Keyboard.JustDown(this.controls.possess)) {
            let nearest = this.findNearestPossessable(this.player)
            if(nearest) {
                this.possess(nearest)
            }
        }

        if(Phaser.Input.Keyboard.JustDown(this.controls.release)) {
            this.release()
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

    createGates(scene, x, y, width, height, key) {
        this.gates.push(new Gate(scene, x , y , {
            key: key,
            width: width,
            height: height,
            color: 0x88ffff,
        }))
    }

    setupGateCollision() {
        this.gates.forEach(gate => {
            this.physics.add.collider(gate, this.player)
        })
    }

    registerPossessable(possessable) {
        this.possessables.push(possessable)
    }

    findNearestPossessable(player) {
        let nearestPossessable = null
        let nearestDistance = Infinity
        let maxDistance = 60

        this.possessables.forEach(possessable => {
            const distance = Phaser.Math.Distance.Between(player.x, player.y, possessable.x, possessable.y)
            if(distance < maxDistance) {
                nearestDistance = distance
                nearestPossessable = possessable
            }
        })
        return nearestPossessable
    }
}