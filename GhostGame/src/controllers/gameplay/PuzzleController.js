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
      plate.on('pressed', () => {
        const gate = this.findGateForPlate(plate)
        gate?.open()
      })

      plate.on('released', () => {
        const gate = this.findGateForPlate(plate)
        gate?.close()
      })
    })
  }

  findGateForPlate(plate) {
    return (
      this.gates.find((gate) => {
        if (plate.targetGate) return gate.key === plate.targetGate
        return gate.key === plate.key
      }) ?? this.gates[0]
    )
  }

  update() {
    this.pressurePlates.forEach((plate) => {
      const pressed = this.possessables.some((obj) => this.scene.physics.overlap(obj, plate))
      plate.setPressed(pressed)
    })
  }
}
