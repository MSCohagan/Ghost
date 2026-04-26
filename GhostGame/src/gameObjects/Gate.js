export default class Gate extends Phaser.GameObjects.Rectangle {

    constructor (scene, key, x, y, options = {}) {
        const {
            width = 24,
            height = 32,
            color = 0x88ffff
        } = options

        super(scene, x, y, width, height, color)

        this.scene = scene
        this.x = x
        this.y = y
        this.key = key

        this.scene.add.existing(this)
        this.scene.physics.add.existing(this)

        this.body.setCollideWorldBounds(true)
    }
}