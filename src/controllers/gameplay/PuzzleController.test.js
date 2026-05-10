import { describe, expect, it, vi } from 'vitest'
import PuzzleController from './PuzzleController.js'

function makeScene(overrides = {}) {
  return {
    gates: [],
    pressurePlates: [],
    possessables: [],
    physics: {
      overlap: vi.fn(() => false),
    },
    ...overrides,
  }
}

describe('PuzzleController.findGateForPlate', () => {
  it('resolves gate by targetGate when provided', () => {
    const gateA = { key: 'Room1_gate_01' }
    const gateB = { key: 'Room1_gate_02' }
    const plate = { key: 'Room1_plate_01', targetGate: 'Room1_gate_02', on: vi.fn() }
    const scene = makeScene({ gates: [gateA, gateB], pressurePlates: [plate] })
    const controller = new PuzzleController(scene)

    const result = controller.findGateForPlate(plate)

    expect(result).toBe(gateB)
  })

  it('falls back to plate key matching when targetGate is missing', () => {
    const gateA = { key: 'Room1_gate_01' }
    const plate = { key: 'Room1_gate_01', targetGate: '', on: vi.fn() }
    const scene = makeScene({ gates: [gateA], pressurePlates: [plate] })
    const controller = new PuzzleController(scene)

    const result = controller.findGateForPlate(plate)

    expect(result).toBe(gateA)
  })

  it('returns null and warns when no gate can be resolved', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const plate = { key: 'Room2_plate_99', targetGate: 'Room2_gate_99', on: vi.fn() }
    const scene = makeScene({ gates: [], pressurePlates: [plate] })
    const controller = new PuzzleController(scene)

    const result = controller.findGateForPlate(plate)

    expect(result).toBeNull()
    expect(warnSpy).toHaveBeenCalled()
    warnSpy.mockRestore()
  })
})
