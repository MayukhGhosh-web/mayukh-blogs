#!/usr/bin/env node
// Repair Sanity documents whose array fields are missing `_key` values.
//
// Background: the original migration (scripts/migrate-strapi-to-sanity.mjs)
// created `post.categories[]` reference items without a `_key`, which Sanity
// requires for every array item. Without it the Studio reports the
// "Missing keys" warning and refuses to edit the list.
//
// This script back-fills deterministic `_key` values on every array field in
// the migrated schema (post.categories, author.bio).
//
// Usage:
//   SANITY_API_TOKEN=<token> node scripts/repair-sanity-keys.mjs
//
// Token falls back to the local Sanity CLI auth token in ~/.config/sanity/config.json.
//
// Idempotent: keys are derived deterministically from existing item data, so
// re-running produces identical results. Documents with no missing keys are
// left untouched. No documents are created, deleted, or recreated.

import { readFileSync, existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { createClient } from '@sanity/client'

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'bysrofv4'
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const API_VERSION = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-08-16'

let token = process.env.SANITY_API_TOKEN
if (!token) {
  const configPath = join(homedir(), '.config', 'sanity', 'config.json')
  if (existsSync(configPath)) {
    token = JSON.parse(readFileSync(configPath, 'utf8')).authToken
  }
}
if (!token) {
  console.error('No SANITY_API_TOKEN found. Set it or run the Sanity CLI once to store auth.')
  process.exit(1)
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: API_VERSION,
  token,
  useCdn: false,
})

// Array fields in the migrated schema, keyed by document type.
const ARRAY_FIELDS = {
  post: ['categories'],
  author: ['bio'],
}

// Deterministically generate a unique `_key` for an array item based on its
// data. Reference items use their `_ref` (e.g. `category-3`). Anything else
// falls back to `${_type}-${index}`. Collisions (e.g. two refs to the same
// target) get a numeric suffix, so output is stable for a given input.
function keyFor(item, index, usedKeys) {
  let base = ''
  if (item._ref) base = String(item._ref)
  else base = `${item._type || 'item'}-${index}`

  let key = base
  let n = 2
  while (usedKeys.has(key)) {
    key = `${base}-${n++}`
  }
  usedKeys.add(key)
  return key
}

function repairArray(items) {
  const usedKeys = new Set()
  let repaired = 0

  const out = (items || []).map((item, index) => {
    if (item && typeof item === 'object' && item._key) {
      usedKeys.add(item._key)
      return item
    }
    const copy = item && typeof item === 'object' ? { ...item } : { ...item }
    copy._key = keyFor(copy, index, usedKeys)
    repaired += 1
    return copy
  })

  return { out, repaired }
}

async function main() {
  let totalRepaired = 0
  let docsTouched = 0

  for (const [type, fields] of Object.entries(ARRAY_FIELDS)) {
    const projection = fields.map((f) => `"${f}": ${f}`).join(', ')
    const docs = await client.fetch(`*[_type == "${type}"] { _id, ${projection} }`)

    for (const doc of docs) {
      const patches = {}
      let docRepaired = 0

      for (const field of fields) {
        if (doc[field] == null) continue
        const { out, repaired } = repairArray(doc[field])
        if (repaired > 0) {
          patches[field] = out
          docRepaired += repaired
        }
      }

      if (docRepaired > 0) {
        await client.patch(doc._id).set(patches).commit()
        totalRepaired += docRepaired
        docsTouched += 1
        console.log(`  ${type} ${doc._id}: repaired ${docRepaired} _key(s) in [${fields.join(', ')}]`)
      }
    }
  }

  console.log(`\nDone. Repaired ${totalRepaired} missing _key value(s) across ${docsTouched} document(s).`)
  if (totalRepaired === 0) console.log('No repairs needed — dataset is already clean.')
}

main().catch((err) => {
  console.error('Repair failed:', err)
  process.exit(1)
})