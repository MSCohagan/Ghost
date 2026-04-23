export default class Box extends Phaser.GameObjects.Rectangle {

    constructor(scene, x, y, options = {})  {
        const {
            width = 24,
            height = 32,
            color = 0x88ffff,
            speed = 180,
            jumpVelocity = -300,
            gravityY = 700
        } = options

        super(scene, x, y, width, height, color)

        this.scene = scene
        this.moveSpeed = speed
        this.jumpVelocity = jumpVelocity
        this.normalGravityY = gravityY

        scene.add.existing(this)
        scene.physics.add.existing(this)

        this.body.setCollideWorldBounds(true)
        this.body.setGravityY(gravityY)

        this.cursors = scene.input.keyboard.createCursorKeys()
        this.jumpKey = scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        )

        this.toggleKey = scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.T
        )
    };

    update() {
        this.updatePhysicalMovement()
    };

    updatePhysicalMovement() {
        const body = this.body
        body.setVelocityX(0)

        if (this.cursors.left.isDown) {
            body.setVelocityX(-this.moveSpeed)
        } else if (this.cursors.right.isDown) {
            body.setVelocityX(this.moveSpeed)
        }

        const isOnFloor = body.blocked.down || body.touching.down

        if (Phaser.Input.Keyboard.JustDown(this.jumpKey) && isOnFloor) {
            body.setVelocityY(this.jumpVelocity)
        }
    }
}