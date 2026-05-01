import Player from '../gameObjects/Player.js'
import Box from '../gameObjects/Box.js'
import Gate from '../gameObjects/Gate.js'
import PressurePad from '../gameObjects/PressurePlate.js'
import RoomRenderer from '../controllers/RoomRenderer.js'
import ControlsManager from '../controllers/ControlsManager.js'
import PossessionController from '../controllers/PossessionController.js'
import ColliderController from '../controllers/ColliderController.js'

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
        this.load.spritesheet('platforms', '/assets/sprites/platforms.png', {
            frameWidth: 16,
            frameHeight: 16,
        });
        this.load.json(
            this.roomKey,
            `/assets/rooms/${this.roomKey}.json?v=${Date.now()}`
          ) 
    }

    createBaseRoom(x, y) {
        this.add.image(1280, 720, this.backgroundKey)

        const roomData = this.cache.json.get(`${this.roomKey}`)

        if (roomData?.objects) {
            const roomRenderer = new RoomRenderer(this, this.roomKey)
            roomRenderer.render(roomData)
        } else {
            console.warn(`No room data found for ${this.roomKey}`)
        }

        this.add.text(this.scale.width/2, 40, this.roomKey, {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5, 0)

        const controlsManager = new ControlsManager(this)
        this.controls = controlsManager.fetchControls()

        this.platforms = this.physics.add.staticGroup()
        this.ground = this.physics.add.staticGroup()
        this.gates = this.physics.add.staticGroup()

        this.player = new Player(this, x, y, { })

        this.possessables = []
        this.gates =[]
        this.pressurePlates = []

        this.box = new Box(this, 400, 0, {
            width: 24,
            height: 40,
            color: 0x000000,
            speed: 200,
            jumpVelocity: -350,
            gravityY: 800,
        })

        this.registerPossessable(this.box)

        this.controlledEntity = this.player

        this.colliderController = new ColliderController(this)
        this.colliderController.addCollider(this.player, this.ground)
        this.possessables.forEach(possessable => {
            this.colliderController.addCollider(possessable, this.platforms)
            this.colliderController.addCollider(possessable, this.ground)
        })

        const possessionController = new PossessionController(this, this.player)
        this.possess = possessionController.tryPossess
        this.release = possessionController.releasePossession
    }

    moveRoom() {
        if(this.player.x + 72 >= this.scale.width && this.nextRoomRight) {
            this.scene.start(this.nextRoomRight, { spawnX: 80, spawnY: this.player.y })
            return true
        } else if (this.player.x - 72 <= 0  && this.nextRoomLeft) {
            console.log(this.nextRoomLeft)
            this.scene.start(this.nextRoomLeft, { spawnX: this.scale.width - 80, spawnY: this.player.y })
            return true
        }
        return false
    }


    update() {
        if(this.moveRoom()) return

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

        if(Phaser.Input.Keyboard.JustDown(this.controls.edit)) {
            if(this.scene.isActive('LevelEditor')) {
                this.scene.stop('LevelEditor')
            } else { 
                this.scene.launch('LevelEditor', {
                    hostScene: this
                })
                this.scene.bringToTop('LevelEditor')
            }
        }

        this.controlledEntity.update(this.time, this.delta)

        const plate = this.pressurePlates[0]
        const gate = this.gates[0]

        if(!plate || !gate) return

        const pressed = this.physics.overlap(this.box, plate)

        if(pressed) {
            this.pressurePlates[0].press()
            this.gates[0].open()
        } else {
            this.pressurePlates[0].releasePlate()
            this.gates[0].close()
        }
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
            isOpen: false
        }))
    }

    createPressurePlates(scene, x, y, width, height, key) {
        this.pressurePlates.push(new PressurePad(scene, x, y, {
            key: key,
            width: width,
            height: height,
            color: 0xf000000,
            pressDepth: 8
        }))
    }

    setupGateCollision() {
        this.gates.forEach(gate => {
            this.colliderController.addCollider(gate, this.player)
            this.colliderController.addCollider(gate, this.possessables)
        })
    }

    setupPressurePlateCollision(callback) {
        this.pressurePlates.forEach(plate => {
            this.colliderController.addOverlap(plate, this.possessables, callback)
            this.colliderController.addCollider(plate, this.ground)
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