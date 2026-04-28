export default class BootScene extends Phaser.Scene {

    constructor() {
        super()
    }

    preload() {
        this.load.json('assetManifest', 'assets/assetManifest.json')
    }

    create() {
        const manifest = this.cache.json.get('assetManifest')

        manifest.images.forEach(asset => {
            this.load.image(asset.key, asset.path)
        })

        this.load.once('complete', () => {
            this.scene.start('Room1')
        })

        this.load.start()
    }
}