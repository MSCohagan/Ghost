export default class PressurePad extends Phaser.GameObjects.Rectangle {

    constructor(scene, x, y, options = {}) {
        const {
            width = 12,
            height = 48,
            color = 0xf000000,
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