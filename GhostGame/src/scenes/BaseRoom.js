import Player from '../gameObjects/Player.js'
import RoomRenderer from '../controllers/RoomRenderer.js'
import ControlsManager from '../controllers/ControlsManager.js'
import PossessionController from '../controllers/PossessionController.js'
import ColliderController from '../controllers/ColliderController.js'
import PuzzleController from '../controllers/PuzzleController.js'
import InputController from '../controllers/InputController.js'
import RoomTransitionController from '../controllers/RoomTransitionController.js'

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
            console.log(this.roomObjects.entities)
            this.editorPlacedObjects = this.roomObjects.createdObjects ?? []
        } else {
            this.roomObjects = { entities: {}, groups: {}}
        }

        this.spawn = this.roomObjects.playerSpawn ?? { x, y }
        this.player = new Player(this, this.spawn.x, this.spawn.y)
        
        this.setupRoomEntities()

        this.camera.startFollow(this.player, true, 0.08, 0.08)

        this.colliderController = new ColliderController(this)
        this.colliderController.wireRoomCollisions({
            player: this.player,
            possessables: this.possessables,
            groups: this.roomObjects.groups,
            collisionRules: this.roomObjects.collisionRules,
            collisionObjects: this.roomObjects.collisionObjects
        })

        this.roomTransitionController = new RoomTransitionController({
            player: this.player,
            roomWidth: this.roomWidth,
            nextRoomLeft: this.nextRoomLeft,
            nextRoomRight: this.nextRoomRight,
            startScene: this.scene.start.bind(this.scene)
        })

        this.controlledEntity = this.player

        this.possessionController = new PossessionController(this, this.player)

        this.puzzleController = new PuzzleController (this, this.entities)

        this.inputController = new InputController(this)
    }

    update() {
        if (!this.player) return
    
        if (this.roomTransitionController.moveRoom()) return
    
        this.inputController.update()
    
        if (!this.scene.isActive('LevelEditor') && this.controlledEntity?.update) {
            this.controlledEntity.update(this.time.now, this.game.loop.delta)
        }
    
        this.puzzleController.update()
    }

    setupRoomEntities() {
        const entities = this.roomObjects.entities ?? {}

        this.entities = {
            possessables: entities.possessables ?? [],
            gates: entities.gates ??  [],
            pressurePlates: entities.pressurePlates ?? []
        }

        this.possessables = this.entities.possessables
        this.gates = this.entities.gates
        this.pressurePlates = this.entities.pressurePlates
    }
}