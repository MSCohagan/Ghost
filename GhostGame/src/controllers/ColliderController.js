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

    wireRoomCollisions({ player, possessables = [], groups = {}, collisionRules = {}}) {
        Object.entries(collisionRules).forEach(([groupName, targets]) => {
            const group = groups[groupName]
            if(!group) return
            
            if(targets.has('player')) {
                this.addCollider(player, group)
            }

            if(targets.has('possessables')) {
                possessables.forEach(possessable => {
                    this.addCollider(possessable, group)
                })
            }
        })
    }
}