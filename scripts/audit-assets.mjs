import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const assetsDir = path.join(root, 'public', 'assets')
const configPath = path.join(assetsDir, 'assetConfig.json')

const shouldRewrite = process.argv.includes('--rewrite')

function toPosix(value) {
  return value.replaceAll(path.sep, '/')
}

function walk(dir) {
  const out = []

  for (const name of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, name)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      out.push(...walk(fullPath))
    } else {
      out.push(fullPath)
    }
  }

  return out
}

function basenameMap(files) {
  const map = new Map()

  for (const f of files) {
    const base = path.basename(f).toLowerCase()
    const list = map.get(base) ?? []
    list.push(f)
    map.set(base, list)
  }

  return map
}

function warn(msg) {
  console.warn(`WARN ${msg}`)
}

function info(msg) {
  console.log(`INFO ${msg}`)
}

function pickCandidate(candidates) {
  if (candidates.length === 0) return null

  const thirdPartyCandidate = candidates.find((c) => c.startsWith('third_party/'))
  if (thirdPartyCandidate) return thirdPartyCandidate

  return candidates[0]
}

if (!fs.existsSync(configPath)) {
  console.error(`ERROR Missing config file: ${toPosix(path.relative(root, configPath))}`)
  process.exit(1)
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
const spritesheets = config.spritesheets ?? {}

const allAssetFiles = walk(assetsDir)
  .map((f) => toPosix(path.relative(assetsDir, f)))
  .filter(
    (f) => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.webp')
  )

const byBasename = basenameMap(allAssetFiles)

let warnings = 0
let rewrites = 0
const rewrittenSpritesheets = {}

for (const [relPath, value] of Object.entries(spritesheets)) {
  const normalized = relPath.replaceAll('\\\\', '/')
  const expectedPath = path.join(assetsDir, normalized)

  if (fs.existsSync(expectedPath)) {
    rewrittenSpritesheets[normalized] = value
    continue
  }

  warnings += 1
  warn(`[missing-path] Config entry not found on disk: ${normalized}`)

  const base = path.basename(normalized).toLowerCase()
  const candidates = byBasename.get(base) ?? []

  if (candidates.length > 0) {
    const selected = pickCandidate(candidates)

    if (selected) {
      warn(`[suggested-path] Likely replacement for ${normalized}: ${selected}`)

      if (shouldRewrite) {
        rewrittenSpritesheets[selected] = value
        rewrites += 1
        info(`[rewrite] ${normalized} -> ${selected}`)
      } else {
        rewrittenSpritesheets[normalized] = value
      }
    }
  } else {
    warn(`[suggested-path] No filename match found for ${normalized}`)
    rewrittenSpritesheets[normalized] = value
  }
}

if (shouldRewrite && rewrites > 0) {
  config.spritesheets = rewrittenSpritesheets
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
  info(`Wrote updated config: ${toPosix(path.relative(root, configPath))}`)
}

console.log('Asset audit complete')
console.log(`Mode: ${shouldRewrite ? 'rewrite' : 'warning-only'}`)
console.log(`Checked spritesheets: ${Object.keys(spritesheets).length}`)
console.log(`Warnings: ${warnings}`)
console.log(`Rewrites: ${rewrites}`)

if (!shouldRewrite && warnings > 0) {
  console.log('No files were modified. Re-run with --rewrite to apply suggested path updates.')
}
