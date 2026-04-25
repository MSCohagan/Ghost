export default class PossessionController {

    constructor (scene, player) {
        this.scene = scene
        this.player = player
        this.currentHost = null
        this.controlled = player
    }

    tryPossess(currentHost) {
        const distance = Phaser.Math.Distance.Between(
            this.player.x,
            this.player.y,
            currentHost.x,
            currentHost.y
        )

        if(distance <= 40) {
            this.controlledEntity = currentHost
            this.player.setVisible(false)
            this.player.body.enable = false
            currentHost.setFillStyle(0xffffff)
        }
    }

    releasePossession(currentHost) {
        if (this.controlledEntity !== this.currentHost) return

        this.currentHost.body.setVelocityX(0)

        this.releaseX = this.currentHost.x + 30
        this.releaseY = this.currentHost.y

        this.player.setPosition(this.releaseX, this.releaseY)
        this.player.body.reset(this.releaseX, this.releaseY)
        this.player.setVisible(true)
        this.player.body.enable = true

        this.box.setFillStyle(0x000000)

        this.controlledEntity = this.player
    }

    update(keys) {
        this.controlled.keys(keys)
    }
}