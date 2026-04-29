export default class AssetManager {

    constructor(scene) {
        this.scene = scene
        this.manifest = this.scene.cache.json.get('assetManifest') ?? { images: [], spritesheets: [] }
    }

    getImages() {
        return this.manifest.images ?? []
    }
    
    getSpritesheets() {
        return this.manifest.spritesheets ?? []
    }

    getSpriteSheetFrameKeys(sheetKey) {
        const sheet = this.getSpritesheets().find(s => s.key === sheetKey)
        if(!sheet) return []

        return Array.from({ length: sheet.frames}, (_, frame) => ({
            key: `${sheet.key}_${frame}`,
            texture: sheet.key,
            frame,
            category: sheet.category
        }))
    }

    getAllSelectableAssets() {
        const images = this.getImages().map(image => ({
            key: image.key,
            texture: image.key,
            frame: null,
            type: 'image',
            category: image.category
        }))

        const frames = this.getSpritesheets().flatMap(sheet => this.getSpriteSheetFrameKeys(sheet.key).map(frameAsset => ({
            ...frameAsset,
            type: 'spritesheet-frame'
        })))

        return [...images, ...frames]
    }

    getImagesKeys() {
        return this.getImages().map(asset => asset.key)
    }

    getAssetByKey(key) {
        return this.getImages().find(asset => asset.key === key)
    }


    listAssets() {
        console.log(this.manifest)
    }
}