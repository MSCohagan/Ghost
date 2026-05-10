import fs from 'fs'
import path from 'path'

const ASSETS_DIR = path.resolve('public/assets')
const CONFIG_FILE = path.join(ASSETS_DIR, 'assetConfig.json')
const OUTPUT_FILE = path.join(ASSETS_DIR, 'assetManifest.json')

const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp'])

function walk(dir) {
  const results = []

  for (const item of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      results.push(...walk(fullPath))
    } else {
      results.push(fullPath)
    }
  }

  return results
}

function loadConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    return {
      spritesheets: {},
    }
  }

  const raw = fs.readFileSync(CONFIG_FILE, 'utf-8')
  return JSON.parse(raw)
}

const config = loadConfig()
const files = walk(ASSETS_DIR)

const images = []
const spritesheets = []

files
  .filter((file) => imageExtensions.has(path.extname(file).toLowerCase()))
  .filter((file) => !file.endsWith('assetManifest.json'))
  .forEach((file) => {
    const relativeAssetPath = path.relative(ASSETS_DIR, file).replaceAll('\\', '/')

    const key = relativeAssetPath.replace(path.extname(relativeAssetPath), '').replaceAll('/', '_')

    const browserPath = `assets/${relativeAssetPath}`

    const spritesheetConfig = config.spritesheets?.[relativeAssetPath] ?? config.spritesheets?.[key]

    if (spritesheetConfig) {
      spritesheets.push({
        key: spritesheetConfig.key ?? key,
        path: browserPath,
        frameWidth: spritesheetConfig.frameWidth,
        frameHeight: spritesheetConfig.frameHeight,
        frames: spritesheetConfig.frames,
        margin: spritesheetConfig.margin ?? 0,
        spacing: spritesheetConfig.spacing ?? 0,
        category: spritesheetConfig.category ?? spritesheetConfig.cathegory ?? 'sprites',
      })
    } else {
      images.push({
        key,
        path: browserPath,
        category: 'images',
      })
    }
  })

const manifest = {
  images,
  spritesheets,
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2))

console.log(`Generated ${OUTPUT_FILE}`)
console.log(`Found ${images.length} images`)
console.log(`Found ${spritesheets.length} spritesheets`)
