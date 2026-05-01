export default class BootScene extends Phaser.Scene {

    constructor() {
        super()
    }

    preload() {
        this.load.json('assetManifest', 'public/assets/assetManifest.json')
        this.load.json('palette', 'public/assets/editorPalette.json')
        this.load.json('assetConfig', 'public/assets/assetConfig.json')
        this.load.spritesheet('ghostBody', 'public/assets/sprites/Ghost_orb.png', {
            frameWidth: 32,
            frameHeight: 32
        })
        this.load.spritesheet('ghostTail', 'public/assets/sprites/Ghost_tail.png', {
            frameWidth: 32,
            frameHeight: 32
        })
    }

    create() {
        const manifest = this.cache.json.get('assetManifest')

        manifest.images.forEach(asset => {
            this.load.image(asset.key, asset.path)
        })

        manifest.spritesheets.forEach(sheet => {
            this.load.spritesheet(sheet.key, sheet.path, {
                frameWidth: sheet.frameWidth,
                frameHeight: sheet.frameHeight,
                margin: sheet.margin ?? 0,
                spacing: sheet.spacing ?? 0
            })
        })

        if(!this.anims.exists('ghostFloat')) {
            this.anims.create({
                key: 'ghostFloat',
                frames: this.anims.generateFrameNumbers('ghostBody', {
                    start: 0,
                    end: 11
                }),
                frameRate: 12,
                repeat: -1})
            }

            this.anims.create({
                key: 'tailBounce',
                frames: this.anims.generateFrameNumbers('ghostTail', {
                    start: 0,
                    end: 11
                }),
                frameRate: 12,
                repeat: -1
            })

        this.load.once('complete', () => {
            this.scene.start('Room1')
        })

        this.load.start()
    }
}