import { applyPlatformerMovement } from '../helpers/movement.js'
//import PossessionController from '../controllers/PossessionController.js'

export default class Box extends Phaser.GameObjects.Rectangle {

    constructor(scene, x, y, options = {})  {
        const {
            width = 24,
            height = 32,
            color = f000000,
            speed = 180,
            jumpVelocity = -300,
            gravityY = 700
        } = options

        super(scene, x, y, width, height, color)

        this.scene = scene
        this.moveSpeed = speed
        this.jumpVelocity = jumpVelocity
        this.normalGravityY = gravityY
        this.release = scene.controls.release

        this.scene.add.existing(this)
        this.scene.physics.add.existing(this)

        this.body.setCollideWorldBounds(true)
        this.body.setGravityY(gravityY)
    };

    update() {
        //if(this.release.isDown) PossessionController.release
        applyPlatformerMovement(this, this.scene.controls)
    };
}