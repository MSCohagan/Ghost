export default class PossessionController {

    constructor (scene, ghost) {
        this.scene = scene
        this.ghost = ghost
        this.currentHost = null
        this.controlled = ghost
    }

    possess(host) {
        this.currentHost = host
        this.controlled = host

        this.ghost.setVisible(false)
        this.ghost.body.enable = false
    }

    release() {
        if (!this.currentHost) return

        this.ghost.setPosition (
            this.currentHost.x + 30,
            this.currentHost.y
        )

        this.ghost.setVisible(true)
        this.ghost.body.enable = true

        this.currentHost = null
        this.controlled = ghost
    }

    update(keys) {
        this.controlled.keys(keys)
    }
}