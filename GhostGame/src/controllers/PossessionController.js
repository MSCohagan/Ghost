export default class PossessionController {

    constructor (player) {
        this.player = player
        this.currentHost = null
        this.controlled = player
    }

    tryPossess(currentHost) {

        this.currentHost = currentHost

        const distance = Phaser.Math.Distance.Between(
            this.player.x,
            this.player.y,
            this.currentHost.x,
            this.currentHost.y
        )

        if(distance <= 40) {
            this.controlledEntity = this.currentHost
            this.player.setVisible(false)
            this.player.body.enable = false
            this.currentHost.setFillStyle(0xffffff)
            this.player.setGhostVisible(false)
        }
    }

    releasePossession() {
        if (this.controlledEntity !== this.currentHost) return

        this.currentHost.body.setVelocityX(0)

        this.releaseX = this.currentHost.x + 30
        this.releaseY = this.currentHost.y

        this.player.setPosition(this.releaseX, this.releaseY)
        this.player.body.reset(this.releaseX, this.releaseY)
        this.player.body.enable = true

        this.currentHost.setFillStyle(0x000000)
        this.player.setGhostVisible(true)

        this.controlledEntity = this.player
    }

    update(keys) {
        this.controlled.keys(keys)
    }
}