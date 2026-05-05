export default class PuzzleController {

    constructor(scene, options = {}) {
        this.scene = scene
        
        const {
            gates = [],
            pressurePlates = [],
            possessables = []
        } = options

        this.gates = gates
        this.pressurePlates = pressurePlates
        this.possessables = possessables
    }

    updatePressurePlatePuzzles() {
        if(!this.pressurePlates?.length || !this.gates?.length) return
        if(!this.possessables?.length) return

        this.pressurePlates.forEach(plate => {
            const pressed = this.possessables.some(possessable => {
                return this.scene.physics.overlap(possessable, plate)
            })

            const targetGate = this.gates.find(gate => {
                if(plate.targetGate) {
                    return gate.key === plate.targetGate
                }

                return gate.key === plate.key
            }) ?? this.gates[0]

            if(!targetGate) return

            if(pressed) {
                plate.press?.()
                targetGate.open?.()
            } else {
                plate.releasePlate?.()
                targetGate.close?.()
            }
        })
    }
}