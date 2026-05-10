import { describe, expect, it } from 'vitest'
import EditorPlacementController from './EditorPlacementController.js'

function makeController(editorPlacedObjects = [], roomKey = 'Room1') {
  const hostScene = { editorPlacedObjects, roomKey }
  const editor = { hostScene }
  return new EditorPlacementController(editor)
}

describe('EditorPlacementController.setIdForObjects', () => {
  it('starts at 01 when no existing objects of that type exist', () => {
    const controller = makeController([])
    const id = controller.setIdForObjects({ type: 'gate' }, 'gate')
    expect(id).toBe('Room1_gate_01')
  })

  it('increments max index for matching room/type', () => {
    const controller = makeController([
      { editorData: { type: 'gate', key: 'Room1_gate_01' } },
      { editorData: { type: 'gate', key: 'Room1_gate_02' } },
    ])
    const id = controller.setIdForObjects({ type: 'gate' }, 'gate')
    expect(id).toBe('Room1_gate_03')
  })

  it('ignores other types when computing next index', () => {
    const controller = makeController([
      { editorData: { type: 'pressurePlate', key: 'Room1_pressurePlate_07' } },
      { editorData: { type: 'gate', key: 'Room1_gate_02' } },
    ])
    const id = controller.setIdForObjects({ type: 'gate' }, 'gate')
    expect(id).toBe('Room1_gate_03')
  })

  it('ignores malformed keys and still computes next valid index', () => {
    const controller = makeController([
      { editorData: { type: 'gate', key: 'Room1_gate_XX' } },
      { editorData: { type: 'gate', key: 'Room1_gate_04' } },
    ])
    const id = controller.setIdForObjects({ type: 'gate' }, 'gate')
    expect(id).toBe('Room1_gate_05')
  })

  it('uses host roomKey in generated id prefix', () => {
    const controller = makeController([], 'Room3')
    const id = controller.setIdForObjects({ type: 'loadingZone' }, 'loadingZone')
    expect(id).toBe('Room3_loadingZone_01')
  })

  it('does not reuse lower deleted index values (max+1 strategy)', () => {
    const controller = makeController([
      { editorData: { type: 'gate', key: 'Room1_gate_01' } },
      { editorData: { type: 'gate', key: 'Room1_gate_03' } },
    ])
    const id = controller.setIdForObjects({ type: 'gate' }, 'gate')
    expect(id).toBe('Room1_gate_04')
  })
})
