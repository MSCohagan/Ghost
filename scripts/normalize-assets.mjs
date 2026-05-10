import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

const configPath = path.join(root, 'public/assets/assetConfig.json')
const manifestPath = path.join(root, 'public/assets/assetManifest.json')

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))

const normalizedSpritesheets = (manifest.spritesheets ?? []).map((sheet) => ({
  ...sheet,
  category: sheet.category ?? 'sprites',
  margin: sheet.margin ?? 0,
  spacing: sheet.spacing ?? 0,
}))

const normalizedImages = (manifest.images ?? []).map((image) => ({
  ...image,
  category: image.category ?? 'images',
}))

const normalizedConfig = {
  ...config,
  spritesheets: Object.fromEntries(
    Object.entries(config.spritesheets ?? {}).map(([key, value]) => [
      key,
      {
        ...value,
        category: value.category ?? value.cathegory ?? 'sprites',
      },
    ])
  ),
}

fs.writeFileSync(configPath, JSON.stringify(normalizedConfig, null, 2))
fs.writeFileSync(
  manifestPath,
  JSON.stringify(
    {
      images: normalizedImages,
      spritesheets: normalizedSpritesheets,
    },
    null,
    2
  )
)

console.log(`Normalized ${normalizedSpritesheets.length} spritesheets in manifest`)
console.log(`Normalized ${normalizedImages.length} images in manifest`)
console.log(`Wrote ${manifestPath}`)
console.log(`Wrote ${configPath}`)
