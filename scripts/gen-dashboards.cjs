#!/usr/bin/env node
const { readdirSync, statSync, writeFileSync } = require('node:fs')
const { resolve, relative, sep } = require('node:path')

const ROOT = resolve(__dirname, '..')
const PUBLIC = resolve(ROOT, 'public')
const ASSETS = resolve(PUBLIC, 'static', 'assets')

/**
 * Recursively walks a directory and returns a flat list of all file paths.
 * @param {string} dir - The directory to walk.
 * @returns {string[]} An array of absolute file paths.
 */
function walk(dir) {
  let out = []
  for (const name of readdirSync(dir)) {
    const p = resolve(dir, name)
    const s = statSync(p)
    if (s.isDirectory()) out = out.concat(walk(p))
    else out.push(p)
  }
  return out
}

/**
 * Converts an absolute file path to a URL relative to the public directory.
 * @param {string} abs - The absolute file path.
 * @returns {string} The relative URL path.
 */
function relUrl(abs) {
  const r = '/' + relative(PUBLIC, abs).split(sep).join('/')
  return r
}

/**
 * Main function to generate the dashboards.json file.
 * It finds all HTML files in the assets directory, creates a sorted list of entries,
 * and writes it to `public/static/assets/dashboards.json`.
 */
function main() {
  const paths = walk(ASSETS)
  const entries = []
  for (const p of paths) {
    if (!p.toLowerCase().endsWith('.html')) continue
    const url = relUrl(p)
    const parts = url.split('/')
    const name = parts[parts.length - 1]
    const folder = parts.slice(0, parts.length - 1).join('/')
    entries.push({ name, folder, url })
  }
  entries.sort((a, b) => a.url.localeCompare(b.url))
  const out = { generatedAt: new Date().toISOString(), entries }
  const target = resolve(ASSETS, 'dashboards.json')
  writeFileSync(target, JSON.stringify(out, null, 2))
  console.log(`[gen-dashboards] wrote ${target} with ${entries.length} entries`)
}

main()