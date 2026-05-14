import { beforeEach, describe, expect, it, vi } from 'vitest'
import RoomStreamingController from './RoomStreamingController.js'

function makeZone(overrides = {}) {
  return {
    targetRoom: 'Room2',
    direction: 'right',
    offsetX: 1280,
    offsetY: 0,
    inLoadingZone: false,
    _streamListenersBound: false,
    on: vi.fn(),
    getBounds: vi.fn(() => ({
      left: 1000,
      right: 1096,
      top: 0,
      bottom: 720,
    })),
    ...overrides,
  }
}

function makeScene(overrides = {}) {
  return {
    player: {
      body: { enable: true },
      getBounds: vi.fn(() => ({
        left: 900,
        right: 950,
        top: 0,
        bottom: 64,
      })),
    },
    physics: {
      overlap: vi.fn(() => false),
      world: {
        bounds: { width: 1280, height: 720 },
        setBounds: vi.fn(),
      },
    },
    camera: {
      setBounds: vi.fn(),
    },
    roomRenderer: {
      render: vi.fn(() => ({
        entities: {
          possessables: [],
          gates: [],
          pressurePlates: [],
          loadingZones: [],
        },
        groups: {},
        collisionRules: {},
        collisionObjects: [],
      })),
    },
    colliderController: {
      wireRoomCollisions: vi.fn(),
    },
    possessionController: {
      refreshPossessables: vi.fn(),
      possessables: [],
    },
    puzzleController: {
      setupPressurePlateEventsFor: vi.fn(),
    },
    possessables: [],
    gates: [],
    pressurePlates: [],
    entities: { loadingZones: [] },
    ...overrides,
  }
}

describe('RoomStreamingController', () => {
  let zone
  let scene
  let controller

  beforeEach(() => {
    zone = makeZone()
    scene = makeScene({ entities: { loadingZones: [zone] } })
    controller = new RoomStreamingController(scene, { loadingZones: [zone], possessables: [] })
  })

  it('prefetches when zone is within configured margin', () => {
    const loadSpy = vi.spyOn(controller, 'loadRoom').mockResolvedValue()
    scene.player.getBounds.mockReturnValue({
      left: 600,
      right: 700,
      top: 0,
      bottom: 64,
    })
    zone.getBounds.mockReturnValue({
      left: 1000,
      right: 1096,
      top: 0,
      bottom: 720,
    })

    controller.checkPrefetchZones(zone)

    expect(loadSpy).toHaveBeenCalledWith('Room2', zone, { requireZoneEntry: false })
  })

  it('prefetches from currentHost bounds while possessing', () => {
    const loadSpy = vi.spyOn(controller, 'loadRoom').mockResolvedValue()
    const hostBounds = {
      left: 600,
      right: 700,
      top: 0,
      bottom: 64,
    }
    scene.player.body.enable = false
    scene.possessionController.currentHost = {
      body: { enable: true },
      getBounds: vi.fn(() => hostBounds),
    }
    zone.getBounds.mockReturnValue({
      left: 1000,
      right: 1096,
      top: 0,
      bottom: 720,
    })

    controller.checkPrefetchZones(zone)

    expect(loadSpy).toHaveBeenCalledWith('Room2', zone, { requireZoneEntry: false })
  })

  it('does not prefetch when target room is already loaded', () => {
    const loadSpy = vi.spyOn(controller, 'loadRoom').mockResolvedValue()
    controller.loadedRooms.set('Room2', {})

    controller.checkPrefetchZones(zone)

    expect(loadSpy).not.toHaveBeenCalled()
  })

  it('does not prefetch when target room is in-flight', () => {
    const loadSpy = vi.spyOn(controller, 'loadRoom').mockResolvedValue()
    controller.inflightLoads.add('Room2')

    controller.checkPrefetchZones(zone)

    expect(loadSpy).not.toHaveBeenCalled()
  })

  it('skips load when requireZoneEntry is true and zone is not entered', async () => {
    const roomDataSpy = vi.spyOn(controller, 'getRoomData')
    zone.inLoadingZone = false

    await controller.loadRoom('Room2', zone, { requireZoneEntry: true })

    expect(roomDataSpy).not.toHaveBeenCalled()
  })

  it('loads room when prefetch path calls with requireZoneEntry false', async () => {
    vi.spyOn(controller, 'getRoomData').mockResolvedValue({
      roomWidth: 3200,
      roomHeight: 720,
      objects: [],
    })

    await controller.loadRoom('Room2', zone, { requireZoneEntry: false })

    expect(scene.roomRenderer.render).toHaveBeenCalled()
    expect(controller.loadedRooms.has('Room2')).toBe(true)
    expect(controller.inflightLoads.has('Room2')).toBe(false)
  })

  it('isWithinPrefetchMargin handles unsupported directions safely', () => {
    const result = controller.isWithinPrefetchMargin(
      { left: 0, right: 100, top: 0, bottom: 100 },
      makeZone({ direction: 'diagonal' })
    )

    expect(result).toBe(false)
  })
})
