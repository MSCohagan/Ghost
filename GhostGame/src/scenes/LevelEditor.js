import ControlsManager from '@/controllers/input/ControlsManager.js'
import EditorToolController from '@/controllers/editor/EditorToolController.js'
import EditorSelectionController from '@/controllers/editor/EditorSelectionController.js'
import EditorDockController from '@/controllers/editor/EditorDockController.js'
import EditorPlacementController from '@/controllers/editor/EditorPlacementController'
import EditorSaveController from '@/controllers/editor/EditorSaveController'

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

    this.input.on('pointerdown', (pointer) => {
      if (this.dockController.isPointerInDock(pointer)) return

      if (this.toolController.is('erase')) {
        this.selectionController.deleteObjectAtPointer(pointer)
        return
      }

      if (this.toolController.is('spawn')) {
        this.placementController.placeSpawn(pointer)
        return
      }

      if (this.toolController.is('select')) {
        this.selectionController.findObjectAtPointer(pointer)
        return
      }
    })

    this.selectionController.isDraggingObject = false

    this.onHostDragStart = (pointer, gameObject) => {
      if (!this.toolController.is('select')) return

      const isEditable = gameObject?.editorData || gameObject === this.hostScene.spawn.marker

      if (!isEditable) return

      this.selectionController.isDraggingObject = true
    }

    this.onHostDragEnd = () => {
      this.selectionController.isDraggingObject = false
    }

    this.onHostDrag = (pointer, gameObject) => {
      if (!this.toolController.is('select')) return
      if (!gameObject?.editorData && gameObject !== this.hostScene.spawn.marker) return

      const { x, y } = this.getSnappedPointerPosition(pointer)

      gameObject.setPosition(x, y)

      if (gameObject === this.hostScene.spawn.marker) {
        this.hostScene.roomData.playerSpawn.x = x
        this.hostScene.roomData.playerSpawn.y = y
        this.hostScene.spawn.x = x
        this.hostScene.spawn.y = y
        return
      }

      gameObject.editorData.x = x
      gameObject.editorData.y = y

      if (gameObject.body?.physicsType === Phaser.Physics.Arcade.STATIC_BODY) {
        gameObject.refreshBody?.()
      }
    }

    this.input.keyboard.on('keydown-BACKSPACE', () => {
      this.toolController.cycleTool()
    })

    this.input.keyboard.on('keydown-P', () => {
      this.saveController.printLevelJson()
      this.saveController.saveRoomJson()
    })

    this.input.keyboard.on('keydown-G', () => {
      this.terrainMode = this.terrainMode === 'ground' ? 'platform' : 'ground'
    })

    this.debugEditorState('editor open')
  }

  getWorldPointerPosition(pointer) {
    if (!this.hostScene?.cameras?.main) return { x: pointer.x, y: pointer.y }
    return this.hostScene.cameras.main.getWorldPoint(pointer.x, pointer.y)
  }

  getSnappedPointerPosition(pointer) {
    const worldPoint = this.getWorldPointerPosition(pointer)
    const gridSize = 48

    return {
      x: Math.floor(worldPoint.x / gridSize) * gridSize,
      y: Math.floor(worldPoint.y / gridSize) * gridSize,
    }
  }

  debugEditorState(label = '') {
    console.log(label, {
      placedObjectsLength: this.placedObjects?.length,
      editorPlacedObjectsLength: this.hostScene.editorPlacedObjects?.length,
      occupiedCells: this.placementController?.occupiedCells?.size,
    })
  }

  update(time, delta) {
    const cam = this.hostScene.cameras.main
    const speed = 8
    const rawPointer = this.input.activePointer

    if (this.controls.left.isDown) cam.scrollX -= speed
    if (this.controls.right.isDown) cam.scrollX += speed
    if (this.controls.up.isDown) cam.scrollY -= speed
    if (this.controls.down.isDown) cam.scrollY += speed

    if (this.dockController.previewImage) {
      const previewPos = this.getSnappedPointerPosition(rawPointer)
      this.dockController.previewImage.setPosition(previewPos.x, previewPos.y)
    }

    if (!rawPointer.isDown) return
    if (this.dockController.isPointerInDock(rawPointer)) return
    if (this.selectionController.isDraggingObject) return

    this.placementController.update(time, delta)
  }
}
