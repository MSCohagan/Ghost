export default class EditorRoomContextController {
  constructor(editor) {
    this.editor = editor
    this.host = editor.hostScene
    //this.worldPosition = this.editor.pointerController.getWorldPosition(editor.input.activePointer)
  }

  create() {
    console.log(this.getWorldBounds())
  }

  getWorldBounds() {
    const loadedRooms = this.host.roomStreamingController.loadedRooms
    return Array.from(loadedRooms.values(), (roomMeta) => ({
      roomKey: roomMeta.roomKey,
      bounds: roomMeta.bounds,
    }))
  }
}
