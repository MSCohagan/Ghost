export default class BootScene extends Phaser.Scene {
  constructor() {
    super()
  }

  preload() {
    this.load.json('assetManifest', '/assets/assetManifest.json')
    this.load.json('palette', '/assets/editorPalette.json')
    this.load.json('assetConfig', '/assets/assetConfig.json')
  }

  create() {
    this.scene.start('PreloadScene')
  }
}
