import { applyGhostMovement } from '../helpers/movement.js'

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, options = {}) {
        const {
            texture = 'ghost',
            frame = 0,
            speed = 200,
            jumpVelocity = -350,
            gravityY = 0,
            bodyWidth = 32,
            bodyHeight = 32,
        } = options

        super(scene, x, y, texture, frame)

        this.setVisible(false)
        this.bodySprite = scene.add.sprite(x, y, 'ghostOrb').setScale(2)
        this.tailSprite = scene.add.sprite(x, y, 'ghostTail').setScale(2)

        this.speed = speed
        this.jumpVelocity = jumpVelocity
        this.normalGravityY = gravityY
        this.possess = scene.controls.possess
        this.setScale(2)

        this.scene.add.existing(this)
        this.scene.physics.add.existing(this)

        this.body.setSize(bodyWidth, bodyHeight)
        this.body.setCollideWorldBounds(true)
        this.body.setGravityY(gravityY)

        this.bodySprite.play('ghostFloat')
        this.tailSprite.play('tailBounce')
    }

    updateTailRotation(delta = 16.67) {
        const vx = this.body.velocity.x
        const vy = this.body.velocity.y

        const tailArtOffset = Phaser.Math.DegToRad(215)
        const turnSpeed = 0.005 * delta

        let targetRotation

        if( vx !== 0 || vy !== 0) {
            const movementAngle = Math.atan2(vy, vx)
            targetRotation = movementAngle + Math.PI + tailArtOffset 
        } else {
            targetRotation = !this.bodySprite.flipX
                ? Phaser.Math.DegToRad(0)
                : Phaser.Math.DegToRad(270)
        } 

        this.tailSprite.rotation = Phaser.Math.Angle.RotateTo(
            this.tailSprite.rotation,
            targetRotation,
            turnSpeed
        )
    }

    setGhostVisible(visible) {
        this.bodySprite.setVisible(visible)
        this.tailSprite.setVisible(visible)

        if(visible) {
            this.bodySprite.anims.resume()
            this.tailSprite.anims.resume()
        } else {
            this.bodySprite.anims.pause()
            this.tailSprite.anims.pause()
        }
    }

    update(time, delta = 16.67) {
        const controls = this.scene.controls

        applyGhostMovement(this, controls)      

        this.bodySprite.setPosition(this.x, this.y)
        this.tailSprite.setPosition(this.x, this.y)

        if(controls.left.isDown) {
            this.bodySprite.setFlipX(true)
        }

        if(controls.right.isDown) {
            this.bodySprite.setFlipX(false)
        }

        this.updateTailRotation(delta)
    }
}