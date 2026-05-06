export function applyGhostMovement(entity, controls, speed = 180) {
  const body = entity.body

  body.setVelocity(0, 0)

  if (controls.left.isDown) body.setVelocityX(-speed)
  if (controls.right.isDown) body.setVelocityX(speed)
  if (controls.up.isDown) body.setVelocityY(-speed)
  if (controls.down.isDown) body.setVelocityY(speed)
}

export function applyPlatformerMovement(entity, controls, speed = 180, jumpVelocity = -300) {
  const body = entity.body
  if (!body) return

  body.setVelocityX(0)

  if (controls.left.isDown) {
    body.setVelocityX(-speed)
  } else if (controls.right.isDown) {
    body.setVelocityX(speed)
  }

  const isOnFloor = body.blocked.down || body.touching.down

  if (controls.jump.isDown && isOnFloor) {
    body.setVelocityY(jumpVelocity)
  }
}
