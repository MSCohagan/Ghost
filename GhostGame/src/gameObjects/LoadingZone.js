export default class LoadingZone extends Phaser.GameObjects.Rectangle {
  constructor(scene, x, y, options = {}) {
    const {
      width = 96,
      height = 720,
      color = 0xff88ff,
      alpha = 0.25,
      targetRoom = '',
      direction = 'right',
      offsetX = 0,
      offsetY = 0,
    } = options

    super(scene, x, y, width, height, color)

    this.targetRoom = targetRoom
    this.direction = direction
    this.offsetX = offsetX
    this.offsetY = offsetY
    this.inLoadingZone = false

    this.scene.add.existing(this)
    this.scene.physics.add.existing(this, true)

    this.setOrigin(0, 0)
    this.body.updateFromGameObject()
  }

  enterLoadingZone() {
    if (!this.targetRoom || this.inLoadingZone) return

    this.inLoadingZone = true
    this.emit('enteredLoadizngZone', this)
  }

  exitLoadingZone() {
    if (!this.targetRoom || !this.inLoadingZone) return

    this.inLoadingZone = false
    this.emit('exitedLoadingZone', this)
  }

  load() {
    if (!this.targetRoom || !this.inLoadingZone) return

    // roomStreamingController load room
  }
}
