export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene')
  }

  preload() {
    const manifest = this.cache.json.get('assetManifest')

    this.load.spritesheet('ghostBody', '/assets/sprites/Ghost_orb.png', {
      frameWidth: 32,
      frameHeight: 32,
    })
    this.load.spritesheet('ghostTail', '/assets/sprites/Ghost_tail.png', {
      frameWidth: 32,
      frameHeight: 32,
    })

    manifest.images.forEach((asset) => {
      this.load.image(asset.key, asset.path)
    })

    manifest.spritesheets.forEach((sheet) => {
      this.load.spritesheet(sheet.key, sheet.path, {
        frameWidth: sheet.frameWidth,
        frameHeight: sheet.frameHeight,
        margin: sheet.margin ?? 0,
        spacing: sheet.spacing ?? 0,
      })
    })

    this.load.json('Room1', `/assets/rooms/Room1.json?v=${Date.now()}`)
  }

  create() {
    this.createAnimations()

    this.scene.start('Room1')
  }

  createAnimations() {
    if (!this.anims.exists('ghostFloat')) {
      this.anims.create({
        key: 'ghostFloat',
        frames: this.anims.generateFrameNumbers('ghostBody', {
          start: 0,
          end: 11,
        }),
        frameRate: 12,
        repeat: -1,
      })
    }

    if (!this.anims.exists('tailBounce')) {
      this.anims.create({
        key: 'tailBounce',
        frames: this.anims.generateFrameNumbers('ghostTail', {
          start: 0,
          end: 11,
        }),
        frameRate: 12,
        repeat: -1,
      })
    }
  }
}
