export default class LevelDesigner {

    constructor(scene) {
        this.scene = scene
        this.files = []
    }

    preload() {
        this.load.on('complete', () => {
            console.log('all preload assets finished')
        })

        this.scene.load.json('assetManifest', 'assets/assetManifest.json')

        this.scene.load.once('complete', () => {
            const manifest = this.scene.cache.json.get('assetManifest')

            if(!manifest) {
                console.warn('assetManifest not loaded')
                return
            }

            manifest.images.forEach(asset => {
                if(!this.scene.textures.exists(asset.key)) {
                    this.scene.load.image(asset.key, asset.path)
                }
            })

            this.scene.load.start()
        })
    }

    listFiles() {
        const manifest = this.scene.cache.json.get('assetManifest')

        if(!manifest) {
            console.warn('assetManifest not loaded')
            return
        }

        console.log(manifest)
    }
}