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
    pressurePlates.forEach((plate) => {
      if (plate._puzzleListenersBound) return

      plate.on('pressed', () => {
        const gate = this.findGateForPlate(plate)
        gate?.open()
      })

      plate.on('released', () => {
        const gate = this.findGateForPlate(plate)
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
      }) ?? null

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
    this.pressurePlates.forEach((plate) => {
      const overlapHits = this.possessables.filter((obj) => this.scene.physics.overlap(obj, plate))
      const pressed = overlapHits.length > 0

      plate.setPressed(pressed)
    })
  }
}
