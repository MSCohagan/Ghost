export default class EditorSelectionController {
  constructor(editor) {
    this.editor = editor
    this.selectedObject = null
    this.isDraggingObject = false
  }

  create() {
    const editor = this.editor
    const host = editor.hostScene

    host.input.on('dragstart', this.onDragStart)
    host.input.on('dragend', this.onDragEnd)
    host.input.on('drag', this.onDrag)

    editor.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      host.input.off('dragstart', this.onDragStart)
      host.input.off('dragend', this.onDragEnd)
      host.input.off('drag', this.onDrag)
    })
  }

  onDragStart = (pointer, gameObject) => {
    const editor = this.editor
    if (!editor.toolController.is('select')) return

    const isEditable = gameObject?.editorData || gameObject === editor.hostScene.spawn.marker

    if (!isEditable) return

    this.isDraggingObject = true

    if (gameObject.body && !this.isStaticBody(gameObject)) {
      gameObject.body.enable = false
    }
  }

  onDragEnd = (pointer, gameObject) => {
    this.isDraggingObject = false

    if (gameObject?.body) {
      gameObject.body.enable = true
      gameObject.body?.reset(gameObject.x, gameObject.y)
      gameObject.body.setVelocity?.(0, 0)
    }

    if (this.isStaticBody(gameObject)) {
      gameObject.refreshBody?.()
    }
    this.editor.debugEditorState?.('after drag')
  }

  onDrag = (pointer, gameObject) => {
    const editor = this.editor
    const host = editor.hostScene

    if (!editor.toolController.is('select')) return
    if (!gameObject?.editorData && gameObject !== host.spawn.marker) return

    const { x, y } = editor.getSnappedPointerPosition(pointer)

    gameObject.setPosition(x, y)

    if (this.isStaticBody(gameObject)) {
      gameObject.refreshBody?.()
    }

    if (gameObject === host.spawn.marker) {
      host.roomData.playerSpawn.x = x
      host.roomData.playerSpawn.y = y
      host.spawn.x = x
      host.spawn.y = y
      return
    }

    if (gameObject.editorData) {
      gameObject.editorData.x = x
      gameObject.editorData.y = y
    }
  }

  selectAtPointer(pointer) {
    this.selectedObject = this.findObjectAtPointer(pointer)
    return this.selectedObject
  }

  findObjectAtPointer(pointer) {
    const editor = this.editor
    const worldPoint = editor.getWorldPointerPosition(pointer)

    return [...editor.placementController.placedObjects, editor.hostScene.spawn.marker]
      .filter(Boolean)
      .reverse()
      .find((obj) => Phaser.Geom.Rectangle.Contains(obj.getBounds(), worldPoint.x, worldPoint.y))
  }

  deleteObjectAtPointer(pointer) {
    const editor = this.editor
    const worldPoint = editor.getWorldPointerPosition(pointer)

    const clicked = [...editor.placementController.placedObjects]
      .reverse()
      .find((obj) => Phaser.Geom.Rectangle.Contains(obj.getBounds(), worldPoint.x, worldPoint.y))

    if (!clicked) return false

    if (clicked.editorData?.cellKey) {
      editor.placementController.occupiedCells.delete(clicked.editorData.cellKey)
    }

    clicked.destroy()

    editor.hostScene.editorPlacedObjects = editor.hostScene.editorPlacedObjects.filter(
      (obj) => obj !== clicked
    )

    editor.placementController.placedObjects = editor.hostScene.editorPlacedObjects

    editor.debugEditorState?.('after delete')

    return true
  }

  isStaticBody(gameObject) {
    return gameObject.body?.physicsType === Phaser.Physics.Arcade.STATIC_BODY
  }
}
