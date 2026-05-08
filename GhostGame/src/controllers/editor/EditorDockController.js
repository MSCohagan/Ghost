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
    const entries = this.editorPalette.palette ?? []
    const itemSize = 48
    const gap = 12
    const startX = 16
    const y = this.editor.scale.height - 72
    let thumb

    entries.forEach((entry, index) => {
      const x = startX + index * (itemSize + gap)
      const frame = entry.frame ?? undefined
      const preview = entry.preview
      const icon = entry.icon

      if (icon?.type === 'rectangle') {
        thumb = this.editor.add
          .rectangle(x, y, itemSize, itemSize, Number(icon?.color ?? 0xff88ff), icon?.alpha ?? 0.6)
          .setOrigin(0, 0)
      } else {
        thumb = this.editor.add
          .image(x, y, preview.texture, preview.frame ?? undefined)
          .setOrigin(0, 0)
          .setDisplaySize(itemSize, itemSize)
      }

      thumb.setInteractive().setDepth(9999).setScrollFactor(0)

      thumb.on('pointerdown', (pointer) => {
        pointer.event.stopPropagation()

        this.selectedAsset = entry
        this.editor.toolController.setTool('place')
        this.createPreview(entry)
        this.selectedPaletteEntry = entry
      })

      thumb.on('pointerover', (pointer) => {
        this.tooltip
          .setText(
            entry.label ?? entry.id ?? `${entry.preview?.texture}:${entry.preview?.frame ?? ''}`
          )
          .setPosition(pointer.x + 12, pointer.y - 28)
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

    const pointer = this.editor.input.activePointer

    if (asset.icon?.type === 'rectangle') {
      this.previewImage = this.editor.add
        .rectangle(pointer.x, pointer.y, 48, 48, Number(asset.icon.color ?? 0xffffff), 0.6)
        .setAlpha(0.5)
        .setDepth(10000)
        .setDisplaySize(48, 48)
        .setScrollFactor(0)
        .setOrigin(0, 0)
    } else {
      this.previewImage = this.editor.add
        .image(pointer.x, pointer.y, asset.preview.texture, asset.frame ?? undefined)
        .setAlpha(0.5)
        .setDepth(10000)
        .setDisplaySize(48, 48)
        .setScrollFactor(0)
        .setOrigin(0, 0)
    }
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
}
