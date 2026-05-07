export default class EditorSaveController {
  constructor(editor) {
    this.editor = editor
    this.host = editor.hostScene
  }

  create() {
    this.dedupePlacedObjects()
  }

  dedupePlacedObjects() {
    const seen = new Set()
    const deduped = []

    this.host.editorPlacedObjects.forEach((obj) => {
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

    this.host.editorPlacedObjects = deduped
    this.editor.placedObjects = this.getPlacedObjects()
  }

  getPlacedObjects() {
    return this.host.editorPlacedObjects ?? []
  }

  printLevelJson() {
    const objects = this.getPlacedObjects().map((obj) => {
      const { cellKey, ...clean } = obj.editorData
      return clean
    })

    console.log(JSON.stringify({ objects }, null, 2))
    return objects
  }

  getCleanLevelObjects() {
    return this.getPlacedObjects().map(({ editorData }) => {
      const { cellKey, ...clean } = editorData
      return clean
    })
  }

  async saveRoomJson() {
    const objects = this.getCleanLevelObjects()

    const existingRoomData = this.host.roomData

    const roomData = {
      ...existingRoomData,
      roomWidth: this.host.roomWidth,
      roomHeight: this.host.roomHeight,
      playerSpawn: this.host.roomData.playerSpawn,
      objects,
    }

    try {
      const response = await fetch('http://localhost:3001/save-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomKey: this.host.roomKey,
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
}
