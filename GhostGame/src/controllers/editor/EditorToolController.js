export default class EditorToolController {
  constructor(editor) {
    this.editor = editor
    this.tools = ['place', 'erase', 'spawn', 'select']
    this.selectedToolIndex = 0
    this.selectedTool = this.tools[this.selectedToolIndex]
  }

  createText() {
    const editor = this.editor

    this.toolText = this.add
      .text(16, this.getDockTop() - 24, `Tool: ${this.selectedTool}`, {
        fontSize: '16px',
        color: '#ffffff',
      })
      .setScrollFactor(0)
      .setDepth(10002)
  }

  setTool(tool) {
    if (!this.tools.includes(tool)) return

    this.selectedTool = tool
    this.selectedToolIndex = this.tools.indexOf(tool)

    this.toolText?.setText(`Tool: ${this.selectedTool}`)

    if (this.selectedTool !== 'place') {
      this.editor.previewImage?.setVisible(false)
    } else {
      this.editor.previewImage?.setVisible(true)
    }
  }

  cycleTool() {
    this.selectedToolIndex = (this.selectedToolIndex + 1) % this.tools.length
    this.setTool(this.tools[this.selectedToolIndex])
  }

  is(tool) {
    return this.selectedTool === tool
  }
}
