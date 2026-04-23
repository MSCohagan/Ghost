export default class Player extends Phaser.GameObjects.Rectangle {

    constructor(scene, x, y, options = {}) {
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
        this.mode = 'ghost'
        this.normalGravityY = gravityY

        scene.add.existing(this)
        scene.physics.add.existing(this)

        this.body.setCollideWorldBounds(true)
        this.body.setGravityY(gravityY)

        this.cursors = scene.input.keyboard.createCursorKeys()
        this.jumpKey = scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        )

        this.setGhostMode()

        this.toggleKey = scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.T
        )

        this.moveLeft = scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.A
        )
        
        this.moveRight = scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.D
        )

    }

    setGhostMode() {
        this.mode = 'ghost'
        this.setFillStyle(0x88ffff)
        this.setAlpha(0.6)

        this.body.setAllowGravity(false)
        this.body.setVelocity(0, 0)
    }

    setPhysicalMode() {
        this.mode = 'physical'
        this.setFillStyle(0xff00ff)
        this.setAlpha(1)

        this.body.setAllowGravity(true)
        this.body.setGravityY(this.normalGravityY)
        this.body.setVelocity(0, 0)
    }


     update() {
        if (this.mode === 'ghost') {
            this.updateGhostMovement()
        } else {
            this.updatePhysicalMovement()
        }

        if (Phaser.Input.Keyboard.JustDown(this.toggleKey)) {

            console.log('before toggle', this.x, this.y, this.mode)

            if (this.mode === 'ghost') {
                this.setPhysicalMode()
            } else {
                this.setGhostMode()
            }

            console.log('after toggle', this.x, this.y, this.mode, this.body.velocity.x, this.body.velocity.y)
            console.log('box', this.body.x, this.body.y, this.body.velocity.y)
            console.log('player visible', this.visible)
            console.log('player active', this.active)
            console.log('player alpha', this.alpha)
            console.log('player scale', this.scaleX, this.scaleY)

        }
    }

    updateGhostMovement() {
        const body = this.body
        body.setVelocity(0, 0)

        if (this.cursors.left.isDown) {
            body.setVelocityX(-this.moveSpeed)
        } else if (this.cursors.right.isDown) {
            body.setVelocityX(this.moveSpeed)
        }

        if (this.cursors.up.isDown) {
            body.setVelocityY(-this.moveSpeed)
        } else if (this.cursors.down.isDown) {
            body.setVelocityY(this.moveSpeed)
        }
    }

    updatePhysicalMovement() {
        const body = this.body
        body.setVelocityX(0)

        if (this.moveLeft.isDown) {
            body.setVelocityX(-this.moveSpeed)
        } else if (this.moveRight.isDown) {
            body.setVelocityX(this.moveSpeed)
        }

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