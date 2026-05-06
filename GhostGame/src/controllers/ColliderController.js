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

    wireRoomCollisions({ player, possessables = [], groups = {}, collisionRules = {}, collisionObjects = [] }) {

        Object.entries(collisionRules).forEach(([groupName, targets]) => {
            const group = groups[groupName]

            if (!group) return

            console.log(targets)

            if (targets.has?.('player')) {
                this.addCollider(player, group)
            }
    
            if (targets.has?.('possessables')) {
                possessables.forEach(obj => this.addCollider(obj, group))
            }
        })

        console.log(collisionObjects)
    
        collisionObjects.forEach(({ object, collidesWith = [], overlapsWith = [] }) => {
            if (collidesWith.includes('player')) {
                this.addCollider(player, object)
            }
        
            if (collidesWith.includes('possessables')) {
                possessables.forEach(obj => this.addCollider(obj, object))
            }

            if (overlapsWith.includes('player')) {
                this.addOverlap(player, object) 
            }
        
            if (overlapsWith.includes('possessables')) {
                possessables.forEach(obj => this.addOverlap(obj, object))
            }
        })
    }
}