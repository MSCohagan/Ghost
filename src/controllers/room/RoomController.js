import Player from '@/gameObjects/Player.js'
import RoomRenderer from '@/controllers/render/RoomRenderer.js'
import ControlsManager from '@/controllers/input/ControlsManager.js'
import PossessionController from '@/controllers/gameplay/PossessionController.js'
import ColliderController from '@/controllers/physics/ColliderController.js'
import PuzzleController from '@/controllers/gameplay/PuzzleController.js'
import InputController from '@/controllers/input/InputController.js'
import RoomTransitionController from '@/controllers/room/RoomTransitionController.js'
import RoomStreamingController from '@/controllers/room/RoomStreamingController.js'
import DevToolsController from '@/controllers/gameplay/DevToolsController.js'

export default class RoomController {
  constructor(scene, options = {}) {
    this.scene = scene
    this.spawnFallback = {
      x: options.x ?? 300,
      y: options.y ?? 300,
    }
  }

  create() {
    this.loadRoomData()
    this.setupWorld()
    this.setupControls()
    this.renderRoom()
    this.createPlayer()
    this.setupEntities()
    this.setupControllers()
    this.create
  }

  update(time, delta) {
    const scene = this.scene
    if (!scene.player) return
    if (scene.roomTransitionController.moveRoom()) return

    scene.inputController.update()

    if (!scene.scene.isActive('LevelEditor') && scene.controlledEntity?.update) {
      scene.controlledEntity.update(time, delta)
    }

    scene.puzzleController.update()

    scene.roomStreamingController.update()
  }

  loadRoomData() {
    const scene = this.scene

    this.renderBackground(scene)

    scene.roomData = scene.cache.json.get(`${scene.roomKey}`) ?? {}

    scene.roomWidth = scene.roomData.roomWidth ?? 1280
    scene.roomHeight = scene.roomData.roomHeight ?? 720
    scene.gridSize = scene.roomData.gridSize ?? 48
  }

  renderBackground(scene) {
    if (scene.backgroundKey && scene.textures.exists(scene.backgroundKey)) {
      scene.add.image(1280, 720, scene.backgroundKey)
      return
    }

    const camera = scene.cameras.main
    const width = camera?.width ?? 2560
    const height = camera?.height ?? 1440

    const sky = scene.add.graphics()
    sky.fillGradientStyle(0x111827, 0x111827, 0x1f2937, 0x1f2937, 1)
    sky.fillRect(0, 0, width, height)
    sky.setDepth(-1000)
    sky.setScrollFactor(0)

    const haze = scene.add.graphics()
    haze.fillStyle(0x334155, 0.2)
    haze.fillEllipse(width * 0.5, height * 0.25, width * 1.1, height * 0.6)
    haze.setDepth(-999)
    haze.setScrollFactor(0)
  }

  setupWorld() {
    const scene = this.scene

    scene.camera = scene.cameras.main
    scene.physics.world.setBounds(0, 0, scene.roomWidth, scene.roomHeight)
    scene.camera.setBounds(0, 0, scene.roomWidth, scene.roomHeight)
  }

  setupControls() {
    const scene = this.scene

    const controlsManager = new ControlsManager(scene)
    scene.controls = controlsManager.fetchControls()
  }

  renderRoom() {
    const scene = this.scene

    if (scene.roomData?.objects) {
      scene.roomRenderer = new RoomRenderer(scene)
      scene.roomObjects = scene.roomRenderer.render(scene.roomData)
      scene.editorPlacedObjects = scene.roomObjects.createdObjects ?? []
    } else {
      scene.roomObjects = { entities: {}, groups: {} }
    }
  }

  createPlayer() {
    const scene = this.scene

    scene.spawn = scene.roomObjects.playerSpawn ?? this.spawnFallback
    scene.player = new Player(scene, scene.spawn.x, scene.spawn.y)

    scene.camera.startFollow(scene.player, true, 0.08, 0.08)

    scene.controlledEntity = scene.player
  }

  setupEntities() {
    const scene = this.scene

    const entities = scene.roomObjects.entities ?? {}

    scene.entities = {
      possessables: entities.possessables ?? [],
      gates: entities.gates ?? [],
      pressurePlates: entities.pressurePlates ?? [],
      loadingZones: entities.loadingZones ?? [],
    }

    scene.possessables = scene.entities.possessables
    scene.gates = scene.entities.gates
    scene.pressurePlates = scene.entities.pressurePlates
  }

  setupControllers() {
    const scene = this.scene

    scene.colliderController = new ColliderController(scene)
    scene.colliderController.wireRoomCollisions({
      player: scene.player,
      possessables: scene.possessables,
      groups: scene.roomObjects.groups,
      collisionRules: scene.roomObjects.collisionRules,
      collisionObjects: scene.roomObjects.collisionObjects,
    })

    scene.roomTransitionController = new RoomTransitionController({
      player: scene.player,
      roomWidth: scene.roomWidth,
      nextRoomLeft: scene.nextRoomLeft,
      nextRoomRight: scene.nextRoomRight,
      startScene: scene.scene.start.bind(scene.scene),
    })

    scene.roomStreamingController = new RoomStreamingController(scene, scene.entities)

    scene.devToolsController = new DevToolsController(scene)

    scene.possessionController = new PossessionController(scene, scene.player)

    scene.puzzleController = new PuzzleController(scene, scene.entities)

    scene.inputController = new InputController(scene)
  }
}
