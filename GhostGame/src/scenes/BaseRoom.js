import Player from '../gameObjects/Player.js'
import Box from '../gameObjects/Box.js'
import Gate from '../gameObjects/Gate.js'
import PressurePad from '../gameObjects/PressurePlate.js'
import RoomRenderer from '../controllers/RoomRenderer.js'
import ControlsManager from '../controllers/ControlsManager.js'
import PossessionController from '../controllers/PossessionController.js'
import ColliderController from '../controllers/ColliderController.js'

export default class BaseRoom extends Phaser.Scene {

    constructor(key, nextRoomLeft, nextRoomRight, options = {}) {
        super(key)
        this.roomWidth = options.width ?? 1280
        this.roomHeight = options.height ?? 720
        this.backgroundKey = options.backgroundKey ?? 'gray'
        this.roomKey = key
        this.nextRoomLeft = nextRoomLeft ?? ''
        this.nextRoomRight = nextRoomRight ?? ''
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

        this.roomData = this.cache.json.get(`${this.roomKey}`) ?? {}

        this.roomWidth = this.roomData.roomWidth ?? 1280
        this.roomHeight = this.roomData.roomHeight ?? 720

        const controlsManager = new ControlsManager(this)
        this.controls = controlsManager.fetchControls()

        this.camera = this.cameras.main
        this.physics.world.setBounds(0, 0, this.roomWidth, this.roomHeight)
        this.camera.setBounds(0, 0, this.roomWidth, this.roomHeight)

        if (this.roomData?.objects) {
            this.roomRenderer = new RoomRenderer(this)
            this.roomObjects = this.roomRenderer.render(this.roomData)
            this.editorPlacedObjects = this.roomObjects.createdObjects ?? []
        } else {
            this.roomObjects = { entities: {}, groups: {}}
        }

        this.add.text(this.scale.width/2, 40, this.roomKey, {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5, 0)


        this.platforms = this.physics.add.staticGroup()
        this.ground = this.physics.add.staticGroup()
        this.gates = this.physics.add.staticGroup()

        const spawn = this.roomData.playerSpawn ?? this.roomObjects.playerSpawn ?? { x, y }
        this.player = new Player(this, spawn.x, spawn.y)

        this.camera.startFollow(this.player, true, 0.08, 0.08)

        this.gates = this.roomObjects.entities.gates ?? []
        this.pressurePlates = this.roomObjects.entities.pressurePlates ?? []
        this.possessables = this.roomObjects.entities.possessables ?? []

        this.box = this.possessables[0]

        this.controlledEntity = this.player

        this.colliderController = new ColliderController(this)
        this.colliderController.wireRoomCollisions({
            player: this.player,
            possessables: this.possessables,
            groups: this.roomObjects.groups,
            collisionRules: this.roomObjects.collisionRules
        })

        const possessionController = new PossessionController(this, this.player)

        this.possessionController = possessionController
        this.possess = possessionController.tryPossess.bind(possessionController)
        this.release = possessionController.releasePossession.bind(possessionController)
    }

    moveRoom() {
        if(this.player.x + 72 >= this.roomWidth && this.nextRoomRight) {
            this.scene.start(this.nextRoomRight, { spawnX: 80, spawnY: this.player.y })
            return true
        } else if (this.player.x - 72 <= 0  && this.nextRoomLeft) {
            this.scene.start(this.nextRoomLeft, { spawnX: this.roomWidth - 80, spawnY: this.player.y })
            return true
        }
        return false
    }


    update() {
        if (!this.player) return
    
        if (this.moveRoom()) return
    
        this.handleInput()
    
        if (!this.scene.isActive('LevelEditor') && this.controlledEntity?.update) {
            this.controlledEntity.update(this.time.now, this.game.loop.delta)
        }
    
        this.updatePressurePlatePuzzles()
    }

    registerEditorObject(gameObject, editorData) {
        this.editorPlacedObjects ??= []
    
        gameObject.editorData = editorData
        this.editorPlacedObjects.push(gameObject)
    
        return gameObject
    }
    
    createPlatforms(entity, startX, y, width, frame, scale = 3, options = {}) {
        const {
            type = 'ground',
            group = type,
            collidesWith = type === 'ground'
                ? ['player', 'possessables']
                : ['possessables']
        } = options
    
        const tileSize = 16
        const step = tileSize * scale
        const endX = startX + width
    
        for (let x = startX; x < endX; x += step) {
            const tile = entity.create(x, y, 'platforms', frame)
    
            tile.setOrigin(0, 0)
            tile.setScale(scale)
            tile.refreshBody()
    
            this.registerEditorObject(tile, {
                type,
                group,
                texture: 'platforms',
                frame,
                x,
                y,
                scale,
                solid: true,
                collidesWith
            })
        }
    }

    handleInput() {
        if (Phaser.Input.Keyboard.JustDown(this.controls.possess)) {
            const nearest = this.findNearestPossessable(this.player)
            if (nearest) this.possess(nearest)
        }
    
        if (Phaser.Input.Keyboard.JustDown(this.controls.release)) {
            this.release()
        }
    
        if (Phaser.Input.Keyboard.JustDown(this.controls.reload)) {
            this.scene.start(this.roomKey)
        }
    
        if (Phaser.Input.Keyboard.JustDown(this.controls.edit)) {
            if (this.scene.isActive('LevelEditor')) {
                this.scene.stop('LevelEditor')
                this.camera.startFollow(this.player, true, 0.08, 0.08)
            } else {
                this.camera.stopFollow()
                this.player.body.setVelocity(0, 0)
                this.scene.launch('LevelEditor', {
                    hostScene: this,
                    roomData: this.roomData
                })
                this.scene.bringToTop('LevelEditor')
            }
        }
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

    updatePressurePlatePuzzles() {
        if(!this.pressurePlates?.length || !this.gates?.length) return
        if(!this.possessables?.length) return

        this.pressurePlates.forEach(plate => {
            const pressed = this.possessables.some(possessable => {
                return this.physics.overlap(possessable, plate)
            })

            const targetGate = this.gates.find(gate => {
                return !plate.key || !gate.key || gate.key === plate.key
            }) ?? this.gates[0]

            if(!targetGate) return

            if(pressed) {
                plate.press?.()
                targetGate.open?.()
            } else {
                plate.releasePlate?.()
                targetGate.close?.()
            }
        })
    }


}