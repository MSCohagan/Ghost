import { applyGhostMovement } from '../helpers/movement.js'
//import PossessionController from '../controllers/PossessionController.js'

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
        this.normalGravityY = gravityY
        this.possess = scene.controls.possess

        this.scene.add.existing(this)
        this.scene.physics.add.existing(this)

        this.body.setCollideWorldBounds(true)
        this.body.setGravityY(gravityY)
    }

    update() {
        const controls = this.scene.controls

        //if(this.possess.isDown) PossessionController.possess(this.scene.box)
        applyGhostMovement(this, controls)
    }
}