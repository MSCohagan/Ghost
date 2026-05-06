import AssetManager from '../controllers/render/AssetManager.js'
import ControlsManager from '../controllers/input/ControlsManager.js'
import EditorToolController from '../controllers/editor/EditorToolController.js'

export default class LevelEditor extends Phaser.Scene {
  constructor() {
    super('LevelEditor')
  }

  create(data) {
    this.hostScene = data.hostScene
    this.roomData = data.roomData

    const controls = new ControlsManager(this.hostScene)
    this.controls = controls.fetchControls()
    this.AssetManager = new AssetManager(this.hostScene)
    this.editorPalette = this.hostScene.cache.json.get('palette') ?? { palette: {} }
    this.paletteEntries = []
    this.selectedPaletteEntry = {}
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

    this.selectedObject = null

    this.assets = this.AssetManager.getAllSelectableAssets()

    this.dockOpen = true
    this.dockHeight = 96
    this.closedDockHeight = 0
    this.paintCooldown = 80
    this.drawTimer = 0

    const y = this.getDockTop()

    this.dock = this.add
      .rectangle(0, y, this.scale.width, this.dockHeight, 0x000000, 0.55)
      .setOrigin(0, 0)
      .setDepth(9000)
      .setScrollFactor(0)

    this.assetItems = []
    this.scrollX = 0

    this.toolController = new EditorToolController(this)
    this.toolController.createText()
    this.toolController.setTool('place')

    this.terrainMode = 'platform'

    this.renderAssetDock()
    this.getPaletteEntries()
    this.tooltip = this.add
      .text(0, 0, '', {
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 6, y: 4 },
      })
      .setDepth(10003)
      .setScrollFactor(0)
      .setVisible(false)

    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
      this.scrollDock(-deltaY * 0.5)
    })

    this.dockHandle = this.add
      .rectangle(this.scale.width / 2, this.getDockTop() + 8, 90, 12, 0xffffff, 0.4)
      .setInteractive()
      .setDepth(10001)
      .setScrollFactor(0)

    this.dockHandle.on('pointerdown', () => {
      this.toggleDock()
    })

    this.input.on('pointerdown', (pointer) => {
      if (this.isPointerInDock(pointer)) return

      if (this.toolController.is('erase')) {
        this.deleteObjectAtPointer(pointer)
        return
      }

      if (this.toolController.is('spawn')) {
        this.placeSpawn(pointer)
        return
      }

      if (this.toolController.is('select')) {
        this.selectedObject = this.findObjectAtPointer(pointer)
        return
      }
    })

    this.isDraggingObject = false

    this.onHostDragStart = (pointer, gameObject) => {
      if (this.selectedTool !== 'select') return

      const isEditable = gameObject?.editorData || gameObject === this.hostScene.spawn.marker

      if (!isEditable) return

      this.isDraggingObject = true
    }

    this.onHostDragEnd = () => {
      this.isDraggingObject = false
    }

    this.onHostDrag = (pointer, gameObject) => {
      if (this.selectedTool !== 'select') return
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

    this.hostScene.input.on('dragstart', this.onHostDragStart)
    this.hostScene.input.on('dragend', this.onHostDragEnd)
    this.hostScene.input.on('drag', this.onHostDrag)

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.hostScene.input.off('dragstart', this.onHostDragStart)
      this.hostScene.input.off('dragend', this.onHostDragEnd)
      this.hostScene.input.off('drag', this.onHostDrag)
    })

    this.input.keyboard.on('keydown-BACKSPACE', () => {
      this.toolController.cycleTool()
    })

    this.input.keyboard.on('keydown-P', () => {
      this.printLevelJson()
      this.saveRoomJson()
    })

    this.input.keyboard.on('keydown-G', () => {
      this.terrainMode = this.terrainMode === 'ground' ? 'platform' : 'ground'
      console.log('terrainMode: ', this.terrainMode)
    })
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

  renderAssetDock() {
    const itemSize = 48
    const gap = 12
    const startX = 16
    const y = this.scale.height - 72

    this.assets.forEach((asset, index) => {
      const x = startX + index * (itemSize + gap)
      const frame = asset.frame ?? undefined

      const thumb = this.add
        .image(x, y, asset.texture, frame)
        .setOrigin(0, 0)
        .setDisplaySize(itemSize, itemSize)
        .setInteractive()
        .setDepth(9999)
        .setScrollFactor(0)

      thumb.on('pointerdown', (pointer) => {
        pointer.event.stopPropagation()

        this.selectedAsset = asset
        this.setSelectedTool('place')
        this.createPreview(asset)
        this.selectPaletteEntry(asset)
      })

      thumb.on('pointerover', () => {
        this.tooltip
          .setText(asset.label ?? asset.id ?? `${asset.texture}:${asset.frame ?? ''}`)
          .setPosition(thumb.x, thumb.y - 28)
          .setVisible(true)
      })

      thumb.on('pointerout', () => {
        this.tooltip.setVisible(false)
      })

      this.assetItems.push(thumb)
    })
  }

  scrollDock(amount) {
    const itemSize = 48
    const gap = 12
    const itemSpacing = itemSize + gap

    const contentWidth = this.assetItems.length * itemSpacing
    const visibleWidth = this.scale.width

    const minScroll = Math.min(0, visibleWidth - contentWidth - 16)
    const maxScroll = 0

    this.scrollX = Phaser.Math.Clamp(this.scrollX + amount, minScroll, maxScroll)

    this.assetItems.forEach((item, index) => {
      item.setX(16 + index * itemSpacing + this.scrollX)
    })
  }

  getDockTop() {
    const height = this.dockOpen ? this.dockHeight : this.closedDockHeight
    return this.scale.height - height
  }

  toggleDock() {
    this.dockOpen = !this.dockOpen

    const y = this.getDockTop()
    const height = this.dockOpen ? this.dockHeight : this.closedDockHeight

    this.dock.setY(y)
    this.dock.setSize(this.scale.width, height)

    this.assetItems.forEach((item) => {
      item.setVisible(this.dockOpen)
    })
  }

  isPointerInDock(pointer) {
    return this.dockOpen && pointer.y >= this.getDockTop()
  }

  createPreview(asset) {
    if (this.previewImage) {
      this.previewImage.destroy()
    }

    this.previewImage = this.add
      .image(
        this.input.activePointer.x,
        this.input.activePointer.y,
        asset.texture,
        asset.frame ?? undefined
      )
      .setAlpha(0.5)
      .setDepth(10000)
      .setDisplaySize(48, 48)
      .setScrollFactor(0)
      .setOrigin(0, 0)
  }

  getPaletteEntries() {
    return this.editorPalette.palette.map((obj) => {
      this.paletteEntries.push(obj)
    })
  }

  selectPaletteEntry(entry) {
    const match = this.paletteEntries.find((paletteEntry) => {
      return (
        entry.texture?.toLowerCase() === paletteEntry.creates.texture?.toLowerCase() &&
        Number(entry.frame) === Number(paletteEntry.creates.frame)
      )
    })

    this.selectedPaletteEntry = match ?? null

    return this.selectedPaletteEntry
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
    const creates = { ...this.selectedPaletteEntry.creates }

    const isTerrain =
      this.selectedPaletteEntry.category === 'terrain' ||
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

  findObjectAtPointer(pointer) {
    const worldPoint = this.getWorldPointerPosition(pointer)

    return [...this.placedObjects, this.hostScene.spawn.marker]
      .filter(Boolean)
      .reverse()
      .find((obj) => Phaser.Geom.Rectangle.Contains(obj.getBounds(), worldPoint.x, worldPoint.y))
  }

  deleteObjectAtPointer(pointer) {
    const worldPoint = this.getWorldPointerPosition(pointer)

    const clicked = [...this.placedObjects].reverse().find((obj) => {
      return Phaser.Geom.Rectangle.Contains(obj.getBounds(), worldPoint.x, worldPoint.y)
    })

    if (!clicked) return false

    if (clicked.editorData?.cellKey) {
      this.occupiedCells.delete(clicked.editorData.cellKey)
    }

    clicked.destroy()

    this.hostScene.editorPlacedObjects = this.hostScene.editorPlacedObjects.filter(
      (obj) => obj !== clicked
    )

    this.placedObjects = this.hostScene.editorPlacedObjects

    return true
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

  update(time, delta) {
    const cam = this.hostScene.cameras.main
    const speed = 8
    const rawPointer = this.input.activePointer

    if (this.controls.left.isDown) cam.scrollX -= speed
    if (this.controls.right.isDown) cam.scrollX += speed
    if (this.controls.up.isDown) cam.scrollY -= speed
    if (this.controls.down.isDown) cam.scrollY += speed

    if (this.previewImage) {
      const previewPos = this.getSnappedPointerPosition(rawPointer)
      this.previewImage.setPosition(previewPos.x, previewPos.y)
    }

    if (!rawPointer.isDown) return
    if (this.isPointerInDock(rawPointer)) return
    if (this.isDraggingObject) return

    this.drawTimer -= delta
    if (this.drawTimer > 0) return

    if (this.selectedTool === 'erase') {
      if (this.deleteObjectAtPointer(rawPointer)) this.drawTimer = 50
      return
    }

    if (this.selectedTool !== 'place') return

    if (this.selectedTool === 'place' && this.selectedPaletteEntry) {
      const creates = this.getCreatesForCurrentTool()
      this.placeSelectedPaletteEntry(rawPointer, creates)
      this.drawTimer = 50
    }
  }
}
