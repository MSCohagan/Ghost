export default class Gate extends Phaser.GameObjects.Rectangle {

    constructor (scene, x, y, options = {}) {
        const {
            width = 24,
            height = 32,
            color = 0x88ffff,
            key = '',
        } = options

        super(scene, x, y, width, height, color)

        this.key = key
        this.color = color

        this.scene.add.existing(this)
        this.scene.physics.add.existing(this, true)
        this.body.updateFromGameObject()
    }
}