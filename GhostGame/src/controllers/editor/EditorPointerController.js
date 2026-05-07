export default class EditorPointerController {
  constructor(editor) {
    this.editor = editor
    this.host = editor.hostScene
    this.gridSize = 48
  }

  getWorldPosition(pointer) {
    if (!this.host?.cameras?.main) return { x: pointer.x, y: pointer.y }
    return this.host.cameras.main.getWorldPoint(pointer.x, pointer.y)
  }

  getSnappedPosition(pointer) {
    const world = this.getWorldPosition(pointer)

    return {
      x: Math.floor(world.x / this.gridSize) * this.gridSize,
      y: Math.floor(world.y / this.gridSize) * this.gridSize,
    }
  }

  isInDock(pointer) {
    return this.editor.dockController.isPointerInDock(pointer)
  }
}
