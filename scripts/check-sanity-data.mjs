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

const client = createClient({ projectId: PROJECT_ID, dataset: DATASET, apiVersion: API_VERSION, token, useCdn: false })

const posts = await client.fetch(`*[_type == "post"] { _id, title, slug, "categories": categories[] { _key, _ref }, "author": author._ref, "hasMainImage": defined(mainImage.asset) } | order(title)`)
const categories = await client.fetch(`*[_type == "category"] { _id, title, "slug": slug.current } | order(title)`)
const authors = await client.fetch(`*[_type == "author"] { _id, name, "slug": slug.current, "bioLength": length(bio) } | order(name)`)
const images = await client.fetch(`count(*[_type == "sanity.imageAsset"])`)

console.log('=== POSTS ===')
for (const p of posts) {
  const missing = (p.categories || []).filter((c) => !c._key).length
  console.log(`  ${p._id} | slug=${p.slug?.current} | cats=${JSON.stringify(p.categories)} | missingKeys=${missing} | image=${p.hasMainImage}`)
}
console.log('=== CATEGORIES ===', categories.length)
for (const c of categories) console.log(`  ${c._id} | ${c.title} | ${c.slug}`)
console.log('=== AUTHORS ===', authors.length)
for (const a of authors) console.log(`  ${a._id} | ${a.name} | ${a.slug} | bio=${a.bioLength}`)
console.log('=== IMAGE ASSETS ===', images)