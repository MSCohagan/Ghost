export default class PossessionController {
  constructor(scene, player) {
    this.scene = scene
    this.player = player
    this.currentHost = null
    this.possessables = scene.roomObjects.entities.possessables
  }

  refreshPossessables(possessables) {
    this.possessables = possessables
  }

  findNearestPossessable(player) {
    let nearestPossessable = null
    let nearestDistance = Infinity
    let maxDistance = 60

    this.possessables.forEach((possessable) => {
      const distance = Phaser.Math.Distance.Between(
        player.x,
        player.y,
        possessable.x,
        possessable.y
      )
      if (distance < maxDistance) {
        nearestDistance = distance
        nearestPossessable = possessable
      }
    })
    return nearestPossessable
  }

  tryPossess(currentHost) {
    if (!currentHost) return

    this.currentHost = currentHost

    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.currentHost.x,
      this.currentHost.y
    )

    if (distance <= 40) {
      this.scene.controlledEntity = this.currentHost
      this.player.setVisible(false)
      this.player.body.enable = false
      this.currentHost.setFillStyle(0xffffff)
      this.player.setGhostVisible(false)
      this.scene.camera.startFollow(this.currentHost, true, 0.08, 0.08)
    }
  }

  releasePossession() {
    if (this.scene.controlledEntity !== this.currentHost) return

    this.currentHost.body.setVelocityX(0)

    this.releaseX = this.currentHost.x + 30
    this.releaseY = this.currentHost.y

    this.player.setGhostVisible(true)
    this.player.setPosition(this.releaseX, this.releaseY)
    this.player.body.reset(this.releaseX, this.releaseY)
    this.player.body.enable = true

    this.currentHost.setFillStyle(0x000000)

    this.scene.controlledEntity = this.player
    this.scene.camera.startFollow(this.player, true, 0.08, 0.08)
  }
}
