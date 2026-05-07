import AssetManager from '../render/AssetManager.js'

export default class EditorDockController {
  constructor(editor) {
    this.editor = editor
    this.host = editor.hostScene
  }

  create() {
    this.AssetManager = new AssetManager(this.host)
    this.assets = this.AssetManager.getAllSelectableAssets()
    this.editorPalette = this.host.cache.json.get('palette') ?? { palette: {} }
    this.paletteEntries = []
    this.selectedPaletteEntry = {}
    this.setUpDock()
    this.renderAssetDock()
    this.getPaletteEntries()
  }

  setUpDock() {
    this.dockOpen = true
    this.dockHeight = 96
    this.closedDockHeight = 0
    this.paintCooldown = 80
    this.drawTimer = 0

    const y = this.getDockTop()

    this.dock = this.editor.add
      .rectangle(0, y, this.editor.scale.width, this.dockHeight, 0x000000, 0.55)
      .setOrigin(0, 0)
      .setDepth(9000)
      .setScrollFactor(0)

    this.assetItems = []
    this.scrollX = 0

    this.tooltip = this.editor.add
      .text(0, 0, '', {
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 6, y: 4 },
      })
      .setDepth(10003)
      .setScrollFactor(0)
      .setVisible(false)

    this.editor.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
      this.scrollDock(-deltaY * 0.5)
    })

    this.dockHandle = this.editor.add
      .rectangle(this.editor.scale.width / 2, this.getDockTop() + 8, 90, 12, 0xffffff, 0.4)
      .setInteractive()
      .setDepth(10001)
      .setScrollFactor(0)

    this.dockHandle.on('pointerdown', () => {
      this.toggleDock()
    })
  }

  renderAssetDock() {
    const itemSize = 48
    const gap = 12
    const startX = 16
    const y = this.editor.scale.height - 72

    this.assets.forEach((asset, index) => {
      const x = startX + index * (itemSize + gap)
      const frame = asset.frame ?? undefined

      const thumb = this.editor.add
        .image(x, y, asset.texture, frame)
        .setOrigin(0, 0)
        .setDisplaySize(itemSize, itemSize)
        .setInteractive()
        .setDepth(9999)
        .setScrollFactor(0)

      thumb.on('pointerdown', (pointer) => {
        pointer.event.stopPropagation()

        this.selectedAsset = asset
        this.editor.toolController.setTool('place')
        this.createPreview(asset)
        this.selectPaletteEntry(asset)
      })

      thumb.on('pointerover', () => {
        this.tooltip
          .setText(asset.label ?? asset.id ?? `${asset.texture}:${asset.frame ?? ''}`)
          .setPosition(thumb.x, thumb.y - 28)
          .setVisible(true)
      })

      thumb.on('pointerout', () => {
        this.tooltip.setVisible(false)
      })

      this.assetItems.push(thumb)
    })
  }

  scrollDock(amount) {
    const itemSize = 48
    const gap = 12
    const itemSpacing = itemSize + gap

    const contentWidth = this.assetItems.length * itemSpacing
    const visibleWidth = this.editor.scale.width

    const minScroll = Math.min(0, visibleWidth - contentWidth - 16)
    const maxScroll = 0

    this.scrollX = Phaser.Math.Clamp(this.scrollX + amount, minScroll, maxScroll)

    this.assetItems.forEach((item, index) => {
      item.setX(16 + index * itemSpacing + this.scrollX)
    })
  }

  getDockTop() {
    const height = this.dockOpen ? this.dockHeight : this.closedDockHeight
    return this.editor.scale.height - height
  }

  toggleDock() {
    this.dockOpen = !this.dockOpen

    const y = this.getDockTop()
    const height = this.dockOpen ? this.dockHeight : this.closedDockHeight

    this.dock.setY(y)
    this.dock.setSize(this.editor.scale.width, height)

    this.assetItems.forEach((item) => {
      item.setVisible(this.dockOpen)
    })
  }

  isPointerInDock(pointer) {
    return this.dockOpen && pointer.y >= this.getDockTop()
  }

  createPreview(asset) {
    if (this.previewImage) {
      this.previewImage.destroy()
    }

    this.previewImage = this.editor.add
      .image(
        this.editor.input.activePointer.x,
        this.editor.input.activePointer.y,
        asset.texture,
        asset.frame ?? undefined
      )
      .setAlpha(0.5)
      .setDepth(10000)
      .setDisplaySize(48, 48)
      .setScrollFactor(0)
      .setOrigin(0, 0)
  }

  updatePreviewPosition(pointer) {
    if (!this.previewImage) return
    this.previewImage.setPosition(pointer.x, pointer.y)
  }

  getPaletteEntries() {
    return this.editorPalette.palette.map((obj) => {
      this.paletteEntries.push(obj)
    })
  }

  selectPaletteEntry(entry) {
    const match = this.paletteEntries.find((paletteEntry) => {
      return (
        entry.texture?.toLowerCase() === paletteEntry.creates.texture?.toLowerCase() &&
        Number(entry.frame) === Number(paletteEntry.creates.frame)
      )
    })

    this.selectedPaletteEntry = match ?? null

    return this.selectedPaletteEntry
  }
}
