export default class ColliderController {
    
    constructor(scene) {
        this.scene = scene
    }

    addCollider(entityOne, entityTwo) {
        this.scene.physics.add.collider(entityOne, entityTwo)
    }

    addOverlap(entityOne, entityTwo, callback) {
        this.scene.physics.add.overlap(entityOne, entityTwo, callback)
    }
}