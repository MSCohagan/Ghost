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

    wireRoomCollisions({ player, possessables, groups}) {
        console.log('collider groups', groups)
        console.log('collider possessables', possessables)
        if(groups.platform) {
            console.log('groups.plaftform')
            possessables.forEach(possessable => {
                this.addCollider(possessable, groups.platform)
            })
        }

        if(groups.ground) {
            this.addCollider(player, groups.platform)

            possessables.forEach(possessable => {
                this.addCollider(possessable, groups.platform)
            })
        }

        if(groups.gate) {
            this.addCollider(player, groups.gate)

            possessables.forEach(possessable => {
                this.addCollider(possessable, groups.gate)
            })

        }
    }
}