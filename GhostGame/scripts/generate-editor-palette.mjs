// scripts/generate-editor-palette.mjs
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

const manifestPath = path.join(root, 'public', 'assets', 'assetManifest.json')
const configPath = path.join(root, 'public', 'assets', 'assetConfig.json')
const outputPath = path.join(root, 'public', 'assets', 'editorPalette.json')

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))

const existingPalette = fs.existsSync(outputPath)
    ? JSON.parse(fs.readFileSync(outputPath, 'utf8'))
    : { palette: [] }

const existingById = new Map(
    (existingPalette.palette ?? []).map(entry => [entry.id, entry])
)

function titleCase(value) {
    return value
        .replace(/^sprites_/, '')
        .replaceAll('_', ' ')
        .replace(/\b\w/g, char => char.toUpperCase())
}

function makeEntryId(texture, frame = null) {
    return frame === null || frame === undefined
        ? texture
        : `${texture}_${frame}`
}

function makeImageEntry(asset) {
    const id = makeEntryId(asset.key)
    const existing = existingById.get(id)

    return {
        id,
        label: existing?.label ?? titleCase(asset.key),
        category: existing?.category ?? asset.category ?? 'images',
        preview: {
            texture: asset.key,
            frame: null
        },
        creates: {
            type: existing?.creates?.type ?? 'image',
            texture: asset.key,
            frame: null,
            scale: existing?.creates?.scale ?? 1,
            solid: existing?.creates?.solid ?? false
        }
    }
}

function makeSpritesheetEntries(sheet) {
    const entries = []

    for (let frame = 0; frame < sheet.frames; frame++) {
        const id = makeEntryId(sheet.key, frame)
        const existing = existingById.get(id)

        entries.push({
            id,
            label: existing?.label ?? `${titleCase(sheet.key)} ${frame}`,
            category: existing?.category ?? sheet.category ?? 'sprites',
            preview: {
                texture: sheet.key,
                frame
            },
            creates: {
                type: existing?.creates?.type ?? inferType(sheet, frame),
                texture: sheet.key,
                frame,
                scale: existing?.creates?.scale ?? inferScale(sheet),
                solid: existing?.creates?.solid ?? inferSolid(sheet)
            }
        })
    }

    return entries
}

function inferType(sheet) {
    if (sheet.category === 'terrain') return 'platform'
    return 'sprite-frame'
}

function inferScale(sheet) {
    if (sheet.category === 'terrain') return 3
    return 1
}

function inferSolid(sheet) {
    return sheet.category === 'terrain'
}

const generated = [
    ...(manifest.images ?? []).map(makeImageEntry),
    ...(manifest.spritesheets ?? []).flatMap(makeSpritesheetEntries)
]

const output = {
    palette: generated
}

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2))

console.log(`Generated ${generated.length} palette entries`)
console.log(`Wrote ${outputPath}`)