export default class DevToolsController {
  constructor(scene) {
    this.scene = scene
    this.installGlobals()
  }

  installGlobals() {
    window.gotoRoom = (roomKey, x = 200, y = 500) => {
      if (this.scene.scene.isActive('LevelEditor')) {
        this.scene.scene.stop('LevelEditor')
      }
      this.scene.scene.start(roomKey, { spawnX: x, spawnY: y })
    }

    window.teleport = (x, y) => {
      this.scene.player?.setPosition(x, y)
      this.scene.playe?.body?.reset(x, y)
    }
  }
}
