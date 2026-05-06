export default class PuzzleController {
    constructor(scene, entities = {}) {
        this.scene = scene
        this.gates = entities.gates ?? []
        this.pressurePlates = entities.pressurePlates ?? []
        this.possessables = entities.possessables ?? []

        this.setupPressurePlateEvents()
    }

    setupPressurePlateEvents() {
        this.pressurePlates.forEach(plate => {
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
        return this.gates.find(gate => {
            if(plate.targetGate) return gate.key === plate.targetGate
            return gate.key === plate.key
        }) ?? this.gates[0]
    }

    update() {
        this.pressurePlates.forEach(plate => {
            const pressed = this.possessables.some(obj => 
                this.scene.physics.overlap(obj, plate)
            )
            plate.setPressed(pressed)
        })
    }
}