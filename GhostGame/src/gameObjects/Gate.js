export default class Gate extends Phaser.GameObjects.Rectangle {
    constructor (scene, x, y, options = {}) {
        const {
            width = 24,
            height = 32,
            color = 0x88ffff,
            key = '',
            isOpen = false
        } = options

        super(scene, x, y, width, height, color)

        this.key = key
        this.color = color
        this.isOpen = isOpen

        this.scene.add.existing(this)
        this.scene.physics.add.existing(this, true)
        this.body.updateFromGameObject()
    }

    open() {
        if(this.isOpen) return

        this.isOpen = true

        this.setVisible(false)

        this.body.enable = false
        this.body.checkCollision.none = true
    }

    close() {
        if(!this.isOpen) return

        this.isOpen = false

        this.setVisible(true)

        this.body.enable = true
        this.body.updateFromGameObject()
    }
}