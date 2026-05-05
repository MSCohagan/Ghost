export default class InputController {

    constructor(scene) {
        this.scene = scene
    }

    update() {
        const {
            controls,
            possessionController,
            player,
            scene,
            camera,
            spawn
        } = this.scene

        if (Phaser.Input.Keyboard.JustDown(controls.possess)) {
            const nearest = possessionController.findNearestPossessable(player)
            if (nearest) possessionController.tryPossess(nearest)
        }
    
        if (Phaser.Input.Keyboard.JustDown(controls.release)) {
            possessionController.releasePossession()
        }
    
        if (Phaser.Input.Keyboard.JustDown(controls.reload)) {
            scene.start(scene.roomKey)
        }
    
        if (Phaser.Input.Keyboard.JustDown(controls.edit)) {
            if (scene.isActive('LevelEditor')) {
                scene.stop('LevelEditor')
                camera.startFollow(player, true, 0.08, 0.08)
                spawn.marker?.setVisible(false)
            } else {
                camera.stopFollow()
                player.body.setVelocity(0, 0)

                spawn.marker?.setVisible(true)

                scene.launch('LevelEditor', {
                    hostScene: scene,
                    roomData: scene.roomData
                })

                scene.bringToTop('LevelEditor')
            }
        }
    }
}