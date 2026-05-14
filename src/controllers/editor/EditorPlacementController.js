import { objectContractRules } from '@/data/objectContractRules.js'
export default class EditorPlacementController {
  constructor(editor) {
    this.editor = editor
    this.host = editor.hostScene
    this.terrainMode = 'platform'
  }

  create() {
    this.host.editorPlacedObjects ??= []
    this.occupiedCells = new Set()
    this.placedObjects = this.host.editorPlacedObjects

    this.populateOccupiedCells()
    this.placedObjects.forEach((obj) => {
      obj.setInteractive?.()
      this.host.input.setDraggable(obj)
    })
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

  getCreatesForCurrentTool() {
    const creates = { ...this.editor.dockController.selectedPaletteEntry.creates }

    const isTerrain =
      this.editor.dockController.selectedPaletteEntry.category === 'terrain' ||
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

  toggleTerrainMode() {
    this.terrainMode = this.terrainMode === 'ground' ? 'platform' : 'ground'
    console.log('terrainMode: ', this.terrainMode)
  }

  placeSelectedPaletteEntry(
    pointer,
    creates = this.editor.dockController.selectedPaletteEntry?.creates
  ) {
    const { x, y } = this.editor.pointerController.getSnappedPosition(pointer)

    if (!creates) return false

    const scale = creates.scale ?? 1
    const cellKey = `${x}, ${y}, ${creates.type}`
    let placed

    if (this.occupiedCells.has(cellKey)) return false
    this.occupiedCells.add(cellKey)

    const rules = objectContractRules[creates.type]
    if (rules?.requiresId) {
      creates.key = this.setIdForObjects(creates, creates.type)
    }

    const selectedEntry = this.editor.dockController.selectedPaletteEntry
    const useRectangle = creates.type === 'loadingZone' || selectedEntry?.icon?.type === 'rectangle'
    const gridSize = this.host.gridSize ?? this.host.roomData?.gridSize ?? 48

    if (useRectangle) {
      placed = this.host.add.rectangle(
        x,
        y,
        creates.width ?? gridSize,
        creates.height ?? gridSize,
        Number(creates.color ?? 0xff88ff),
        0.35
      )

      placed.setOrigin(0, 0)
    } else {
      placed = this.host.add.image(x, y, creates.texture, creates.frame ?? undefined)

      placed.setScale(scale)
      placed.setOrigin(0, 0)
    }

    placed.editorData = {
      ...creates,

      x: x,
      y: y,
      scale,
      solid: creates.solid ?? false,
      collidesWith: creates.collidesWith ?? [],
      overlapsWith: creates.overlapsWith ?? [],
      cellKey,
    }

    placed.setInteractive()
    this.host.input.setDraggable(placed)

    this.host.editorPlacedObjects.push(placed)
    this.placedObjects = this.host.editorPlacedObjects

    return true
  }

  setIdForObjects(creates, type) {
    const roomKey = this.host.roomKey ?? 'Room'
    const prefix = `${roomKey}_${type}_`

    const maxIndex = this.host.editorPlacedObjects.reduce((max, obj) => {
      const key = obj?.editorData?.key
      const objType = obj?.editorData?.type
      if (objType !== type || typeof key !== 'string' || !key.startsWith(prefix)) return max

      const raw = key.slice(prefix.length)
      const n = Number.parseInt(raw, 10)
      return Number.isFinite(n) ? Math.max(max, n) : max
    }, 0)

    const next = maxIndex + 1
    const padded = String(next).padStart(2, '0')
    return `${prefix}${padded}`
  }

  placeSpawn(pointer) {
    const { x, y } = this.editor.pointerController.getSnappedPosition(pointer)

    this.host.roomData.playerSpawn = {
      x,
      y,
      width: 24,
      height: 40,
      color: '0x00ff00',
    }

    this.host.spawn.x = x
    this.host.spawn.y = y
    this.host.spawn.marker?.setPosition(x, y)
  }

  update(time, delta, pointer) {
    this.drawTimer ??= 0

    this.drawTimer -= delta
    if (this.drawTimer > 0) return

    if (!this.editor.toolController.is('place')) return
    if (!this.editor.dockController.selectedPaletteEntry) return

    const creates = this.getCreatesForCurrentTool()
    this.placeSelectedPaletteEntry(pointer, creates)
    this.drawTimer = 50
  }
}
