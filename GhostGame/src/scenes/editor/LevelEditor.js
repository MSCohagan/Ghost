import ControlsManager from '@/controllers/input/ControlsManager.js'
import EditorToolController from '@/controllers/editor/EditorToolController.js'
import EditorSelectionController from '@/controllers/editor/EditorSelectionController.js'
import EditorDockController from '@/controllers/editor/EditorDockController.js'
import EditorPlacementController from '@/controllers/editor/EditorPlacementController.js'
import EditorSaveController from '@/controllers/editor/EditorSaveController.js'
import EditorControlsController from '@/controllers/editor/EditorControlsController.js'
import EditorPointerController from '@/controllers/editor/EditorPointerController.js'

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

    this.controllers = {
      dock: new EditorDockController(this),
      pointer: new EditorPointerController(this),
      save: new EditorSaveController(this),
      placement: new EditorPlacementController(this),
      tool: new EditorToolController(this),
      selection: new EditorSelectionController(this),
      controls: new EditorControlsController(this),
    }

    this.dockController = this.controllers.dock
    this.pointerController = this.controllers.pointer
    this.saveController = this.controllers.save
    this.placementController = this.controllers.placement
    this.toolController = this.controllers.tool
    this.selectionController = this.controllers.selection
    this.controlsController = this.controllers.controls

    Object.values(this.controllers).forEach((controller) => {
      controller.create?.()
    })
  }

  update(time, delta) {
    this.controlsController.update(time, delta)
  }
}
