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
            bodyHeight = 32
        } = options

        super(scene, x, y, texture, frame)

        this.hasBeenFlipped = false

        this.speed = speed
        this.jumpVelocity = jumpVelocity
        this.normalGravityY = gravityY
        this.possess = scene.controls.possess

        this.scene.add.existing(this)
        this.scene.physics.add.existing(this)

        this.body.setSize(bodyWidth, bodyHeight)
        this.body.setCollideWorldBounds(true)
        this.body.setGravityY(gravityY)

        this.play('ghostFloat')
    }

    update() {
        const controls = this.scene.controls

        applyGhostMovement(this, controls)

        if(controls.left.isDown) {
            this.setFlipX(true)
        }
        if(controls.right.isDown) {
            this.setFlipX(false)
        }

    }
}