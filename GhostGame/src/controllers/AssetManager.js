export default class AssetManager {

    constructor(scene) {
        this.scene = scene
        this.manifest = this.scene.cache.json.get('assetManifest') ?? { images: [] }
    }

    getImages() {
        return this.manifest.images
    }

    getImagesKeys() {
        return this.getImages().map(asset => asset.key)
    }

    getAssetByKey(key) {
        return this.getImages().find(asset => asset.key === key)
    }

    listAssets() {
        console.log(manifest)
    }
}