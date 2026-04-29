import AssetManager from '../controllers/AssetManager.js'

export default class LevelEditor extends Phaser.Scene {
    
    constructor() {
        super('LevelEditor')
    }

    create(data) { 

        this.hostScene = data.hostScene
        this.AssetManager = new AssetManager(this.hostScene)

        this.assets = this.AssetManager.getAllSelectableAssets()

        console.log(this.assets)

        const dockHeight = 96
        const y = this.scale.height - dockHeight

        this.dock = this.add.rectangle(
            0,
            y,
            this.scale.width,
            dockHeight,
            0x000000,
            0.55
        ).setOrigin(0, 0)

        this.assetItems = []
        this.scrollX = 0

        this.renderAssetDock()

        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            console.log('wheel', deltaY)
            this.scrollX -= deltaY * .5

            this.assetItems.forEach((item, index) => {
                const itemSize = 48
                const gap = 12
                item.x = 16 + index * (itemSize + gap) + this.scrollX
            })
        })

        console.log('assetItems', this.assetItems.length)
    }

    renderAssetDock()  {
        const itemSize = 48
        const gap = 12
        const startX = 16
        const y = this.scale.height - 72

        this.assets.forEach((asset, index) => {
            const x = startX + index * (itemSize + gap)
            const frame = asset.frame ?? undefined

            const thumb = this.add.image(x, y, asset.texture, frame)
                .setOrigin(0, 0)
                .setDisplaySize(itemSize, itemSize)
                .setInteractive()
                .setDepth(9999)
                .setScrollFactor(0)

            thumb.on('pointerdown', () => {
                this.selectedAsset = asset
                console.log('selected asset: ', asset)
            })

            this.assetItems.push(thumb)
        });
    }
}