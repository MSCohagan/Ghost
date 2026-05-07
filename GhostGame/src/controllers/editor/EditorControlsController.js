export default class EditorControlsController {
  constructor(editor) {
    this.editor = editor
    this.host = editor.hostScene
  }

  create() {
    const editor = this.editor

    editor.input.on('pointerdown', (pointer) => {
      if (editor.dockController.isPointerInDock(pointer)) return

      if (editor.toolController.is('erase')) {
        editor.selectionController.deleteObjectAtPointer(pointer)
        return
      }

      if (editor.toolController.is('spawn')) {
        editor.placementController.placeSpawn(pointer)
        return
      }

      if (editor.toolController.is('select')) {
        editor.selectionController.findObjectAtPointer(pointer)
        return
      }
    })

    editor.input.keyboard.on('keydown-BACKSPACE', () => {
      editor.toolController.cycleTool()
    })

    editor.input.keyboard.on('keydown-P', () => {
      editor.saveController.printLevelJson()
      editor.saveController.saveRoomJson()
    })

    editor.input.keyboard.on('keydown-G', () => {
      editor.terrainMode = editor.terrainMode === 'ground' ? 'platform' : 'ground'
    })
  }

  update(time, delta) {
    const editor = this.editor
    const host = this.host
    const rawPointer = editor.input.activePointer

    this.updateCamera()

    editor.dockController.updatePreviewPosition?.(rawPointer)

    if (!rawPointer.isDown) return
    if (editor.dockController.isPointerInDock(rawPointer)) return
    if (editor.selectionController.isDraggingObject) return

    editor.placementController.update(time, delta, rawPointer)
  }

  updateCamera() {
    const { controls } = this.editor
    const cam = this.host.cameras.main
    const speed = 8

    if (controls.left.isDown) cam.scrollX -= speed
    if (controls.right.isDown) cam.scrollX += speed
    if (controls.up.isDown) cam.scrollY -= speed
    if (controls.down.isDown) cam.scrollY += speed
  }
}
