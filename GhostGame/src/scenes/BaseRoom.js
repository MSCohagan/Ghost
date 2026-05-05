import Player from '../gameObjects/Player.js'
import RoomRenderer from '../controllers/RoomRenderer.js'
import ControlsManager from '../controllers/ControlsManager.js'
import PossessionController from '../controllers/PossessionController.js'
import ColliderController from '../controllers/ColliderController.js'
import PuzzleController from '../controllers/PuzzleController.js'
import InputController from '../controllers/InputController.js'

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

        this.spawn = this.roomObjects.playerSpawn ?? { x, y }
        this.player = new Player(this, this.spawn.x, this.spawn.y)
        this.possessables = this.roomObjects.entities.possessables
        this.gates = this.roomObjects.entities.gates
        this.pressurePlates = this.roomObjects.entities.pressurePlates

        this.camera.startFollow(this.player, true, 0.08, 0.08)

        this.colliderController = new ColliderController(this)
        this.colliderController.wireRoomCollisions({
            player: this.player,
            possessables: this.possessables,
            groups: this.roomObjects.groups,
            collisionRules: this.roomObjects.collisionRules,
            collisionObjects: this.roomObjects.collisionObjects
        })

        this.controlledEntity = this.player

        this.possessionController = new PossessionController(this, this.player)
        

        this.puzzleController = new PuzzleController (this, {
            gates: this.gates,
            pressurePlates: this.pressurePlates,
            possessables: this.possessables
        })

        this.inputController = new InputController(this)
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
    
        this.inputController.update()
    
        if (!this.scene.isActive('LevelEditor') && this.controlledEntity?.update) {
            this.controlledEntity.update(this.time.now, this.game.loop.delta)
        }
    
        this.puzzleController.updatePressurePlatePuzzles()
    }

    registerEditorObject(gameObject, editorData) {
        this.editorPlacedObjects ??= []
    
        gameObject.editorData = editorData
        this.editorPlacedObjects.push(gameObject)
    
        return gameObject
    }
    

    handleInput() {
        
    }
}