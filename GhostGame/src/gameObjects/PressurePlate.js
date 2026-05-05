export default class PressurePlate extends Phaser.GameObjects.Rectangle {

    constructor(scene, x, y, options = {}) {
        const {
            width = 12,
            height = 48,
            color = 0xf000000,
            key = '',
            targetGate = '',
            pressDepth = 8
        } = options

        super(scene, x, y, width, height, color)

        this.key = key
        this.targetGate = targetGate
        this.color = color
        this.scene = scene
        this.isPressed = false
        this.upY = y
        this.downY = y + pressDepth

        this.scene.add.existing(this)
        this.scene.physics.add.existing(this, true)
        this.body.updateFromGameObject()
    }

    press() {
        if(this.isPressed) return
        this.isPressed = true
        
        this.scene.tweens.add({
            targets: this,
            y: this.downY,
            duration: 100
        })

    }

    releasePlate() {
        if (!this.isPressed) return
        this.isPressed = false

        this.scene.tweens.add({
            targets: this,
            y: this.upY,
            duration: 100
        })
    }
}