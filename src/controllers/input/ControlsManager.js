export default class ControlsManager {
  constructor(scene) {
    this.scene = scene
    this.controls = {
      up: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      jump: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      possess: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      release: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
      reload: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R),
      edit: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L),
      fullscreen: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F),
    }
  }

  fetchControls() {
    return this.controls
  }
}
