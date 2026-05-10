import { describe, expect, it, vi } from 'vitest'
import { applyPlatformerMovement } from './movement.js'

function makeBody(overrides = {}) {
  return {
    blocked: { down: false },
    setVelocityX: vi.fn(),
    setVelocityY: vi.fn(),
    onFloor: vi.fn(() => false),
    ...overrides,
  }
}

function makeControls(overrides = {}) {
  return {
    left: { isDown: false },
    right: { isDown: false },
    jump: {},
    ...overrides,
  }
}

describe('applyPlatformerMovement', () => {
  it('moves left when left control is held', () => {
    const body = makeBody()
    const entity = { body }
    const controls = makeControls({ left: { isDown: true } })

    globalThis.Phaser = {
      Input: {
        Keyboard: {
          JustDown: vi.fn(() => false),
        },
      },
    }

    applyPlatformerMovement(entity, controls, 200, -300)

    expect(body.setVelocityX).toHaveBeenCalledWith(0)
    expect(body.setVelocityX).toHaveBeenCalledWith(-200)
    expect(body.setVelocityY).not.toHaveBeenCalled()
  })

  it('jumps only when JustDown is true and grounded', () => {
    const body = makeBody({ onFloor: vi.fn(() => true) })
    const entity = { body }
    const controls = makeControls()

    globalThis.Phaser = {
      Input: {
        Keyboard: {
          JustDown: vi.fn(() => true),
        },
      },
    }

    applyPlatformerMovement(entity, controls, 180, -360)

    expect(body.setVelocityY).toHaveBeenCalledWith(-360)
  })

  it('does not jump when JustDown is true but not grounded', () => {
    const body = makeBody({
      onFloor: vi.fn(() => false),
      blocked: { down: false },
    })
    const entity = { body }
    const controls = makeControls()

    globalThis.Phaser = {
      Input: {
        Keyboard: {
          JustDown: vi.fn(() => true),
        },
      },
    }

    applyPlatformerMovement(entity, controls, 180, -300)

    expect(body.setVelocityY).not.toHaveBeenCalled()
  })
})
