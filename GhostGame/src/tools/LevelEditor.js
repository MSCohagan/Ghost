import AssetManager from '../controllers/AssetManager.js'

export default class LevelEditor extends Phaser.Scene {
    
    constructor() {
        super('LevelEditor')
    }

    create(data) { 

        this.hostScene = data.hostScene
        this.AssetManager = new AssetManager(this.hostScene)

        this.assets = this.AssetManager.getAllSelectableAssets()

        this.dockOpen = true
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
            this.scrollDock(-deltaY * 0.5)
        })

        this.dockHandle = this.add.rectangle(
            this.scale.width / 2,
            this.getDockTop() + 8,
            90,
            12,
            0Xffffff,
            0.4
        ).setInteractive()

        this.dockHandle.on('pointerdown', () => {
            this.toggleDock()
        })

        this.input.on('pointerdown', (pointer) => {
            if(this.isPointerInDock((pointer))) return
            if(!this.selectedAsset) return

            this.placeSelectedAsset(pointer)
        })
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
                this.createPreview(asset)
                console.log('selected asset: ', asset)
            })

            this.assetItems.push(thumb)
        });
    }

    scrollDock(amount) {
        const itemSize = 48
        const gap = 12
        const itemSpacing = itemSize + gap

        const contentWidth = this.assetItems.length * itemSpacing
        const visibleWidth = this.scale.width

        const minScroll = Math.min(0, visibleWidth - contentWidth - 16)
        const maxScroll = 0

        this.scrollX = Phaser.Math.Clamp(
            this.scrollX + amount,
            minScroll,
            maxScroll
        )

        this.assetItems.forEach((item, index) => {
            item.setX(16 + index * itemSpacing + this.scrollX)
        })
    }

    getDockTop() {
        const height = this.dockOpen ? this.dockHeight : this.closedDockHeight
        return this.scale.height - height
    }

    toggleDock() {
        this.dockOpen = !this.dockOpen
         
        const y = this.getDockTop()
        const height = this.dockOpen ? this.dockHeight : this.closedDockHeight

        this.dock.setY(y)
        this.dock.setSize(this.scale.width, height)

        this.assetItems.forEach(item => {
            item.setVisible(this.dockOpen)
        })
    }

    isPointerInDock(pointer) {
        return pointer.y >= this.getDockTop()
    }

    createPreview(asset) {
        if(this.previewImage) {
            this.previewImage.destroy
        }

        this.previewImage = this.add.image(
            this.input.activePointer.x,
            this.input.activePointer.y,
            asset.texture,
            asset.frame ?? undefined
        )
            .setAlpha(0.5)
            .setDepth(10000)
            .setDisplaySize(48, 48)
            .setScrollFactor(0)
    }

    placeSelectedAsset(pointer) {
        this.hostScene.add.image(
            pointer.x,
            pointer.y,
            this.selectedAsset.texture,
            this.selectedAsset.frame ?? undefined
        )
    }

    update() {
        if(this.previewImage) {
            const pointer = this.input.activePointer
            this.previewImage.setPosition(pointer.x, pointer.y)
        }
    }
}