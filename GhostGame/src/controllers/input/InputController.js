export default class InputController {
  constructor(scene) {
    this.scene = scene
  }

  update() {
    const hostScene = this.scene
    const { controls, possessionController, player, camera, spawn } = hostScene

    if (Phaser.Input.Keyboard.JustDown(controls.possess)) {
      const nearest = possessionController.findNearestPossessable(player)
      if (nearest) possessionController.tryPossess(nearest)
    }

    if (Phaser.Input.Keyboard.JustDown(controls.release)) {
      possessionController.releasePossession()
    }

    if (Phaser.Input.Keyboard.JustDown(controls.reload)) {
      hostScene.scene.start(hostScene.scene.roomKey)
    }

    if (Phaser.Input.Keyboard.JustDown(controls.edit)) {
      if (hostScene.scene.isActive('LevelEditor')) {
        hostScene.scene.stop('LevelEditor')
        camera.startFollow(player, true, 0.08, 0.08)
        spawn.marker?.setVisible(false)
      } else {
        camera.stopFollow()
        player.body.setVelocity(0, 0)

        spawn.marker?.setVisible(true)

        hostScene.scene.launch('LevelEditor', {
          hostScene,
          roomData: hostScene.scene.roomData,
        })

        hostScene.scene.bringToTop('LevelEditor')
      }
    }
  }
}
