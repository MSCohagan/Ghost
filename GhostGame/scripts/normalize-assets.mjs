import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

const configPath = path.join(root, 'public/assets/assetConfig.json')
const manifestPath = path.join(root, 'public/assets/assetManifest.json')
const palettePath = path.join(root, 'public/assets/editorPalette.json')

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))

function titleCase(value) {
  return value
    .replace(/^sprites_/, '')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function createPaletteEntry(sheet, frame) {
  const isTerrain = sheet.category === 'terrain'

  return {
    id: `${sheet.key}_${frame}`,
    label: `${titleCase(sheet.key)} ${frame}`,
    category: sheet.category,
    preview: {
      texture: sheet.key,
      frame,
    },
    creates: {
      type: isTerrain ? 'platform' : 'spriteFrame',
      group: isTerrain ? 'platform' : null,
      texture: sheet.key,
      frame,
      scale: isTerrain ? 3 : 1,
      solid: isTerrain,
    },
  }
}

const spritesheets = Object.entries(config.spritesheets).map(([relativePath, sheet]) => ({
  key: sheet.key,
  path: `/assets/${relativePath}`,
  frameWidth: sheet.frameWidth,
  frameHeight: sheet.frameHeight,
  frames: sheet.frames,
  margin: sheet.margin ?? 0,
  spacing: sheet.spacing ?? 0,
  category: sheet.category,
}))

const manifest = {
  images: [],
  spritesheets,
}

const palette = {
  palette: spritesheets.flatMap((sheet) =>
    Array.from({ length: sheet.frames }, (_, frame) => createPaletteEntry(sheet, frame))
  ),
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
fs.writeFileSync(palettePath, JSON.stringify(palette, null, 2))

console.log(`Normalized ${spritesheets.length} spritesheets`)
console.log(`Wrote ${manifestPath}`)
console.log(`Wrote ${palettePath}`)
