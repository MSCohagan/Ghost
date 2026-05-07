import ControlsManager from '../controllers/input/ControlsManager.js'
import EditorToolController from '../controllers/editor/EditorToolController.js'
import EditorSelectionController from '../controllers/editor/EditorSelectionController.js'
import EditorDockController from '../controllers/editor/EditorDockController.js'

export default class LevelEditor extends Phaser.Scene {
  constructor() {
    super('LevelEditor')
  }

  create(data) {
    this.hostScene = data.hostScene
    this.roomData = data.roomData

    const controls = new ControlsManager(this.hostScene)
    this.controls = controls.fetchControls()

    this.hostScene.editorPlacedObjects ??= []
    this.occupiedCells = new Set()
    this.placedObjects = this.hostScene.editorPlacedObjects
    this.dedupePlacedObjects()
    this.populateOccupiedCells()
    this.placedObjects.forEach((obj) => {
      obj.setInteractive?.()
      this.hostScene.input.setDraggable(obj)
    })

    this.hostScene.spawn.marker?.setInteractive()
    this.hostScene.input.setDraggable(this.hostScene.spawn.marker)

    this.dockController = new EditorDockController(this)
    this.dockController.create()

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
        this.placeSpawn(pointer)
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
      this.printLevelJson()
      this.saveRoomJson()
    })

    this.input.keyboard.on('keydown-G', () => {
      this.terrainMode = this.terrainMode === 'ground' ? 'platform' : 'ground'
    })

    this.debugEditorState('editor open')
  }

  dedupePlacedObjects() {
    const seen = new Set()
    const deduped = []

    this.hostScene.editorPlacedObjects.forEach((obj) => {
      const data = obj.editorData
      if (!data) {
        deduped.push(obj)
        return
      }

      const key = `${data.type}:${data.x}:${data.y}:${data.texture ?? ''}:${data.frame ?? ''}`

      if (seen.has(key)) {
        obj.destroy()
        return
      }

      seen.add(key)
      deduped.push(obj)
    })

    this.hostScene.editorPlacedObjects = deduped
    this.placedObjects = deduped
  }

  populateOccupiedCells() {
    this.occupiedCells.clear()

    this.placedObjects.forEach((obj) => {
      const data = obj.editorData
      if (!data?.x || !data?.y || !data?.type) return

      const cellKey = data.cellKey ?? `${data.x}, ${data.y}, ${data.type}`
      data.cellKey = cellKey
      this.occupiedCells.add(cellKey)
    })
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

  getCreatesForCurrentTool() {
    const creates = { ...this.dockController.selectedPaletteEntry.creates }

    const isTerrain =
      this.dockController.selectedPaletteEntry.category === 'terrain' ||
      creates.type === 'platform' ||
      creates.type === 'ground'

    if (isTerrain) {
      creates.type = this.terrainMode
      creates.group = this.terrainMode
      creates.collidesWith =
        this.terrainMode === 'ground' ? ['player', 'possessables'] : ['possessables']
    }

    return creates
  }

  placeSelectedPaletteEntry(pointer, creates = this.selectedPalletteEntry?.creates) {
    const { x, y } = this.getSnappedPointerPosition(pointer)

    if (!creates) return false

    const scale = creates.scale ?? 1
    const cellKey = `${x}, ${y}, ${creates.type}`

    if (this.occupiedCells.has(cellKey)) return false
    this.occupiedCells.add(cellKey)

    const placed = this.hostScene.add.image(x, y, creates.texture, creates.frame ?? undefined)

    placed.setScale(scale)
    placed.setOrigin(0, 0)

    placed.editorData = {
      type: creates.type,
      group: creates.group,
      texture: creates.texture,
      frame: creates.frame,
      x: x,
      y: y,
      scale,
      solid: creates.solid ?? false,
      collidesWith: creates.collidesWith ?? [],
      cellKey,
    }

    placed.setInteractive()
    this.hostScene.input.setDraggable(placed)

    this.hostScene.editorPlacedObjects.push(placed)
    this.placedObjects = this.hostScene.editorPlacedObjects

    return true
  }

  placeSpawn(pointer) {
    const { x, y } = this.getSnappedPointerPosition(pointer)

    this.hostScene.roomData.playerSpawn = {
      x,
      y,
      width: 24,
      height: 40,
      color: '0x00ff00',
    }

    this.hostScene.spawn.x = x
    this.hostScene.spawn.y = y
    this.hostScene.spawn.marker?.setPosition(x, y)
  }

  printLevelJson() {
    const objects = this.placedObjects.map((obj) => {
      const { cellKey, ...clean } = obj.editorData
      return clean
    })

    console.log(JSON.stringify({ objects }, null, 2))
    return objects
  }

  getCleanLevelObjects() {
    return this.placedObjects.map(({ editorData }) => {
      const { cellKey, ...clean } = editorData
      return clean
    })
  }

  async saveRoomJson() {
    const objects = this.getCleanLevelObjects()

    const existingRoomData = this.roomData

    const roomData = {
      ...existingRoomData,
      roomWidth: this.hostScene.roomWidth,
      roomHeight: this.hostScene.roomHeight,
      playerSpawn: this.hostScene.roomData.playerSpawn,
      objects,
    }

    try {
      const response = await fetch('http://localhost:3001/save-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomKey: this.hostScene.roomKey,
          data: roomData,
        }),
      })
      const result = await response.json()
      console.log(result)

      window.location.reload()
    } catch (err) {
      console.error(err)
    }
  }

  debugEditorState(label = '') {
    console.log(label, {
      placedObjectsLength: this.placedObjects?.length,
      editorPlacedObjectsLength: this.hostScene.editorPlacedObjects?.length,
      occupiedCells: this.occupiedCells?.size,
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

    this.drawTimer -= delta
    if (this.drawTimer > 0) return

    if (this.toolController.is('erase')) {
      if (this.selectionController.deleteObjectAtPointer(rawPointer)) this.drawTimer = 50
      return
    }

    if (!this.toolController.is('place')) return

    if (this.dockController.selectedPaletteEntry) {
      const creates = this.getCreatesForCurrentTool()
      this.placeSelectedPaletteEntry(rawPointer, creates)
      this.drawTimer = 50
    }
  }
}
