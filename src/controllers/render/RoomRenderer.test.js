import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

let RoomRenderer

afterEach(() => {
  vi.restoreAllMocks()
})

beforeAll(async () => {
  globalThis.Phaser = {
    GameObjects: {
      Sprite: class {},
      Image: class {},
      Rectangle: class {},
    },
  }

  RoomRenderer = (await import('./RoomRenderer.js')).default
})

function makeScene() {
  return {
    physics: {
      add: {
        staticGroup: vi.fn(() => ({
          create: vi.fn(() => ({
            setOrigin: vi.fn(),
            setScale: vi.fn(),
            refreshBody: vi.fn(),
          })),
        })),
        group: vi.fn(() => ({
          create: vi.fn(() => ({
            setOrigin: vi.fn(),
            setScale: vi.fn(),
            refreshBody: vi.fn(),
          })),
        })),
      },
    },
    add: {
      rectangle: vi.fn(() => ({
        setOrigin: vi.fn(),
        setAlpha: vi.fn(),
        setVisible: vi.fn(),
      })),
      image: vi.fn(() => ({
        setOrigin: vi.fn(),
        setScale: vi.fn(),
      })),
    },
  }
}

describe('RoomRenderer contract validation', () => {
  let renderer
  let warnSpy

  beforeEach(() => {
    renderer = new RoomRenderer(makeScene())
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('warns when requiresId object is missing key', () => {
    renderer.validateObjectContract(
      { type: 'loadingZone', targetRoom: 'Room2' },
      { requiresId: true, referencesTargets: false }
    )

    expect(warnSpy).toHaveBeenCalled()
  })

  it('does not warn for requiresId object when key exists', () => {
    renderer.validateObjectContract(
      { type: 'gate', key: 'Room1_gate_01' },
      { requiresId: true, referencesTargets: false }
    )

    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('accepts legacy targetGate fallback when targetIds is missing', () => {
    renderer.validateObjectContract(
      { type: 'pressurePlate', key: 'Room1_plate_01', targetGate: 'Room1_gate_01' },
      {
        requiresId: true,
        referencesTargets: true,
        targetField: 'targetIds',
        allowLegacyTargetField: 'targetGate',
      }
    )

    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('warns when both targetIds and legacy target are missing', () => {
    renderer.validateObjectContract(
      { type: 'pressurePlate', key: 'Room1_plate_01' },
      {
        requiresId: true,
        referencesTargets: true,
        targetField: 'targetIds',
        allowLegacyTargetField: 'targetGate',
      }
    )

    expect(warnSpy).toHaveBeenCalled()
  })

  it('warns when required fields are missing', () => {
    renderer.validateObjectContract(
      { type: 'loadingZone', key: 'Room1_zone_01' },
      {
        requiresId: true,
        referencesTargets: false,
        requiresFields: ['targetRoom'],
      }
    )

    expect(warnSpy).toHaveBeenCalled()
  })

  it('does not warn for non-referenceable object with no key', () => {
    renderer.validateObjectContract(
      { type: 'ground' },
      { requiresId: false, referencesTargets: false }
    )

    expect(warnSpy).not.toHaveBeenCalled()
  })
})
