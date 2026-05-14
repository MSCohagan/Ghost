export default class EditorPointerController {
  constructor(editor) {
    this.editor = editor
    this.host = editor.hostScene
    this.gridSize = this.host.gridSize ?? this.host.roomData?.gridSize ?? 48
  }

  getWorldPosition(pointer) {
    if (!this.host?.cameras?.main) return { x: pointer.x, y: pointer.y }
    return this.host.cameras.main.getWorldPoint(pointer.x, pointer.y)
  }

  getSnappedPosition(pointer) {
    const world = this.getWorldPosition(pointer)
    const gridSize = this.host.gridSize ?? this.host.roomData?.gridSize ?? this.gridSize ?? 48

    return {
      x: Math.floor(world.x / gridSize) * gridSize,
      y: Math.floor(world.y / gridSize) * gridSize,
    }
  }

  isInDock(pointer) {
    return this.editor.dockController.isPointerInDock(pointer)
  }
}
