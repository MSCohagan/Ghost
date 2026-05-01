import AssetManager from '../controllers/AssetManager.js'

export default class LevelEditor extends Phaser.Scene {
    
    constructor() {
        super('LevelEditor')
    }

    create(data) { 
        this.hostScene = data.hostScene
        this.AssetManager = new AssetManager(this.hostScene)
        this.editorPalette = this.hostScene.cache.json.get('palette') ?? { palette: {}}
        this.paletteEntries = []
        this.selectedPaletteEntry = {}
        this.hostScene.editorPlacedObjects ??= []
        this.occupiedCells = new Set()
        this.placedObjects = this.hostScene.editorPlacedObjects

        this.assets = this.AssetManager.getAllSelectableAssets()

        this.dockOpen = true
        this.dockHeight = 96
        this.closedDockHeight = 16
        this.paintCooldown = 80
        this.drawTimer = 0

        const y = this.getDockTop()

        this.dock = this.add.rectangle(
            0,
            y,
            this.scale.width,
            this.dockHeight,
            0x000000,
            0.55
        ).setOrigin(0, 0).setDepth(9000)

        this.assetItems = []
        this.scrollX = 0

        this.selectedTool = 'place'

        this.renderAssetDock()
        this.getPaletteEntries()

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
        )
        .setInteractive()
        .setDepth(10001)
        .setScrollFactor(0)

        this.dockHandle.on('pointerdown', () => {
            this.toggleDock()
        })

        this.input.on('pointerdown', (pointer) => {
            if(this.isPointerInDock((pointer))) return

            if(this.selectedTool === 'erase') {
                this.deleteObjectAtPointer(pointer)
                return
            }

            if(this.selectedTool === 'place') {
                if(!this.selectedAsset) return

                this.placeSelectedPaletteEntry(pointer)
            }
        })

        this.input.keyboard.on('keydown-BACKSPACE', () => {
            this.selectedTool = 
                this.selectedTool === 'erase' ? 'place' : 'erase'
            console.log('selectedTool ', this.selectedTool)
        })

        this.input.keyboard.on('keydown-P', () => {
            this.printLevelJson()
            this.saveRoomJson()
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

                thumb.on('pointerdown', (pointer) => {
                    pointer.event.stopPropagation()

                    this.selectedAsset = asset
                    this.selectedTool = 'place'
                    this.createPreview(asset)
                    this.selectPaletteEntry(asset)
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
        return this.dockOpen && pointer.y >= this.getDockTop()
    }

    createPreview(asset) {
        if(this.previewImage) {
            this.previewImage.destroy()
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
            .setOrigin(0,0)
    }

    getPaletteEntries() {
        return this.editorPalette.palette.map(obj => {
            this.paletteEntries.push(obj)
        })
    }

    selectPaletteEntry(entry) {
        const match = this.paletteEntries.find(paletteEntry => {
            return (
                entry.texture?.toLowerCase() === paletteEntry.creates.texture?.toLowerCase() &&
                Number(entry.frame) === Number(paletteEntry.creates.frame)
            )
        })

        this.selectedPaletteEntry = match ?? null

        return this.selectedPaletteEntry
    }

    getSnappedPointerPosition(pointer) {
        const gridSize = 48
        return {
            x: Math.floor(pointer.x / gridSize) * gridSize, 
            y: Math.floor(pointer.y / gridSize) * gridSize, 
        }
    }

    placeSelectedPaletteEntry(pointer) {
        const snapped = this.getSnappedPointerPosition(pointer)
        const x = snapped.x
        const y = snapped.y
        if(!this.selectedPaletteEntry?.creates) return false
        const creates = this.selectedPaletteEntry.creates
        const scale = creates.scale ?? 1
        const cellKey = `${x}, ${y}, ${creates.type}`
        if(this.occupiedCells.has(cellKey)) return false
        this.occupiedCells.add(cellKey)

        const placed = this.hostScene.add.image(
            x,
            y,
            creates.texture,
            creates.frame ?? undefined,
        )

        placed.setScale(scale)
        placed.setOrigin(0,0)

        placed.editorData = {
            type: creates.type,
            texture: creates.texture,
            frame: creates.frame,
            x: x,
            y: y,
            scale,
            solid: creates.solid?? false,
            cellKey
        }

        this.hostScene.editorPlacedObjects.push(placed)
        this.placedObjects = this.hostScene.editorPlacedObjects

        return true
    }

    deleteObjectAtPointer(pointer) {
        const clicked = [...this.placedObjects].reverse().find(obj => {

            return Phaser.Geom.Rectangle.Contains(obj.getBounds(), pointer.x, pointer.y)
    
        })

        if (!clicked) return false

        if(clicked.editorData?.cellKey) {
            this.occupiedCells.delete(clicked.editorData.cellKey)
        }

        clicked.destroy()

        this.hostScene.editorPlacedObjects =
            this.hostScene.editorPlacedObjects.filter(obj => obj !== clicked)

        this.placedObjects = this.hostScene.editorPlacedObjects

        return true
    }

    printLevelJson() {
        const objects = this.placedObjects.map(obj => {
            const { cellKey, ...clean } = obj.editorData   
            return clean
        })

        console.log(JSON.stringify({ objects }, null, 2))
        return objects
    }

    getCleanLevelObjects() {
        return this.placedObjects.map(({ editorData }) => {
            const { cellKey, ...clean} = editorData
            return clean
        })
    }

    async saveRoomJson() {
        const objects = this.getCleanLevelObjects()

        try {
                const response = await fetch('http://localhost:3001/save-room', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({
                    roomKey: this.hostScene.roomKey,
                    data: { objects }
                })
                
            })
            const result = await response.json()
            console.log(result)

            window.location.reload()
        } catch(err) {
            console.error(err)
        }
    }

    update(time, delta) {
        const rawPointer = this.input.activePointer
        const pointer = this.getSnappedPointerPosition(rawPointer)

        if(this.previewImage) {
            this.previewImage.setPosition(pointer.x, pointer.y)
        }

        if(!rawPointer.isDown) return
        if(this.isPointerInDock(rawPointer)) return

        this.drawTimer -= delta
        if(this.drawTimer > 0) return

        if(this.selectedTool === 'erase') {
            if(this.deleteObjectAtPointer(pointer)) this.drawTimer = 50
            return
        }
        
        if(this.selectedTool === 'place' && this.selectedPaletteEntry) {
            this.placeSelectedPaletteEntry(pointer)
            this.drawTimer = 50
        }
    }
}