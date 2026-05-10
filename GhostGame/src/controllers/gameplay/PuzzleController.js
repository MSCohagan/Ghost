export default class PuzzleController {
  constructor(scene, entities = {}) {
    this.scene = scene

    this.setupPressurePlateEventsFor(this.pressurePlates)
  }

  get gates() {
    return this.scene.gates ?? []
  }

  get pressurePlates() {
    return this.scene.pressurePlates ?? []
  }

  get possessables() {
    return this.scene.possessables ?? []
  }

  setupPressurePlateEventsFor(pressurePlates) {
    console.log(
      '[PuzzleController] setupPressurePlateEventsFor count=',
      pressurePlates?.length ?? 0
    )

    pressurePlates.forEach((plate) => {
      if (plate._puzzleListenersBound) return
      console.log('[PuzzleController] binding plate listeners', {
        key: plate.key,
        targetGate: plate.targetGate,
        x: plate.x,
        y: plate.y,
      })

      plate.on('pressed', () => {
        const gate = this.findGateForPlate(plate)
        console.log('[PuzzleController] plate pressed', {
          plateKey: plate.key,
          targetGate: plate.targetGate,
          resolvedGate: gate?.key ?? null,
        })
        gate?.open()
      })

      plate.on('released', () => {
        const gate = this.findGateForPlate(plate)
        console.log('[PuzzleController] plate released', {
          plateKey: plate.key,
          targetGate: plate.targetGate,
          resolvedGate: gate?.key ?? null,
        })
        gate?.close()
      })
      plate._puzzleListenersBound = true
    })
  }

  findGateForPlate(plate) {
    const resolved =
      this.gates.find((gate) => {
        if (plate.targetGate) return gate.key === plate.targetGate
        return gate.key === plate.key
      }) ?? this.gates[0]

    if (!resolved) {
      console.warn('[PuzzleController] no gate resolved for plate', {
        plateKey: plate.key,
        targetGate: plate.targetGate,
        gateCount: this.gates.length,
      })
    }

    return resolved
  }

  update() {
    if (!this._debugTick || this._debugTick % 120 === 0) {
      console.log('[PuzzleController] update snapshot', {
        gateCount: this.gates.length,
        plateCount: this.pressurePlates.length,
        possessableCount: this.possessables.length,
      })
    }
    this._debugTick = (this._debugTick ?? 0) + 1

    this.pressurePlates.forEach((plate) => {
      const overlapHits = this.possessables.filter((obj) => this.scene.physics.overlap(obj, plate))
      const pressed = overlapHits.length > 0

      if (pressed !== plate.isPressed) {
        console.log('[PuzzleController] plate overlap state changed', {
          plateKey: plate.key,
          targetGate: plate.targetGate,
          plateX: plate.x,
          plateY: plate.y,
          overlapHits: overlapHits.length,
        })
      }

      plate.setPressed(pressed)
    })
  }
}
