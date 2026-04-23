export function applyGhostMovement( entity, controls, speed = 180) {

    const body = entity.body
    if(!body) return
    
    body.setVelocity(0, 0)

    if(controls.left.isDown) body.setVelocityX(-this.speed)
    if(controls.right.isDown) body.setVelocityX(this.speed)
    if(controls.up.isDown) body.setVelocityY(-this.speed)
    if(controls.down.isDown) body.setVelocity(this.speed)
}

export function applyPlatformerMovement( entity, controls, speed = 180, jumpVelocity = -300) {
    
    const body = entity.body
    if(!body) return

    body.setVelocityX(0)

    if (controls.left.isDown) {
        body.setVelocityX(-this.speed)
    } else if (controls.right.isDown) {
        body.setVelocityX(this.speed)
    }

    const isOnFloor = body.blocked.down || body.touching.down

    if (Phaser.Input.Keyboard.JustDown(this.jumpKey) && isOnFloor) {
        body.setVelocityY(this.jumpVelocity)
    }
}