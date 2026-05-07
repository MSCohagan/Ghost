import ControlsManager from '@/controllers/input/ControlsManager.js'
import EditorToolController from '@/controllers/editor/EditorToolController.js'
import EditorSelectionController from '@/controllers/editor/EditorSelectionController.js'
import EditorDockController from '@/controllers/editor/EditorDockController.js'
import EditorPlacementController from '@/controllers/editor/EditorPlacementController'
import EditorSaveController from '@/controllers/editor/EditorSaveController'
import EditorControlsController from '@/controllers/editor/EditorControlsController'
import EditorPointerController from '@/controllers/editor/EditorPointerController'

export default class LevelEditor extends Phaser.Scene {
  constructor() {
    super('LevelEditor')
  }

  create(data) {
    this.hostScene = data.hostScene
    this.roomData = data.roomData

    const controls = new ControlsManager(this.hostScene)
    this.controls = controls.fetchControls()

    this.hostScene.spawn.marker?.setInteractive()
    this.hostScene.input.setDraggable(this.hostScene.spawn.marker)

    this.dockController = new EditorDockController(this)
    this.dockController.create()

    this.saveController = new EditorSaveController(this)
    this.saveController.create()

    this.placementController = new EditorPlacementController(this)
    this.placementController.create()

    this.toolController = new EditorToolController(this)
    this.toolController.createText()
    this.toolController.setTool('place')

    this.selectionController = new EditorSelectionController(this)
    this.selectionController.create()

    this.terrainMode = 'platform'

    this.dockController.renderAssetDock()
    this.dockController.getPaletteEntries()

    this.pointerController = new EditorPointerController(this)

    this.selectionController.isDraggingObject = false

    this.controlsController = new EditorControlsController(this)
    this.controlsController.create()
  }

  update(time, delta) {
    this.controlsController.update(time, delta)
  }
}
