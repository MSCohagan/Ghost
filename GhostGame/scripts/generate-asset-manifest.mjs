import fs from 'fs'
import path from 'path'

const ASSETS_DIR = path.resolve('assets')
const OUTPUT_FILE = path.join(ASSETS_DIR, 'assetManifest.json')

const imageExtensions = new Set(['.png', 'jpg', 'jpeg', '.webp'])

function walk(dir) {
    const results = []

    for(const item of fs.readdirSync(dir)) {
        const fullPath = path.join(dir, item)
        const stat = fs.statSync(fullPath)

        if(stat.isDirectory()) {
            results.push(...walk(fullPath))
        } else {
            results.push(fullPath)
        }
    }

    return results
}

const files = walk(ASSETS_DIR)

const images = files
    .filter(file => imageExtensions.has(path.extname(file).toLowerCase()))
    .map(file => {
        const relativePath = path.relative(process.cwd(), file).replaceAll('\\', '/')
        const key = path
            .relative(ASSETS_DIR, file)
            .replaceAll('\\', '/')
            .replace(path.extname(file), '')
            .replaceAll('/', '_')

        return {
            key,
            path: relativePath
        }
    })

const manifest = {images}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2))

console.log(`Generated ${OUTPUT_FILE}`)
console.log(`Found ${images.length} images`)