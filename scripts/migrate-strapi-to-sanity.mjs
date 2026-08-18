#!/usr/bin/env node
// One-time migration: Strapi Cloud → Sanity (project bysrofv4 / dataset production)
//
// Usage:
//   SANITY_API_TOKEN=<token> node scripts/migrate-strapi-to-sanity.mjs
//
// Token falls back to the local Sanity CLI auth token in ~/.config/sanity/config.json.
// Idempotent: documents are created with stable `_id`s (post-<strapiId>, category-<strapiId>, author-<strapiId>).

import { readFileSync, existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { createClient } from '@sanity/client'

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'bysrofv4'
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const API_VERSION = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-08-16'
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://honorable-breeze-55074c763a.strapiapp.com'

let token = process.env.SANITY_API_TOKEN
if (!token) {
  const configPath = join(homedir(), '.config', 'sanity', 'config.json')
  if (existsSync(configPath)) {
    const config = JSON.parse(readFileSync(configPath, 'utf8'))
    token = config.authToken
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

const slugify = (s) =>
  String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'untitled'

async function strapiGet(path) {
  const res = await fetch(`${STRAPI_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) throw new Error(`Strapi ${path} -> HTTP ${res.status}`)
  return res.json()
}

async function fetchStrapi() {
  const [authors, categories, blogs] = await Promise.all([
    strapiGet('/api/authors?pagination[pageSize]=100'),
    strapiGet('/api/categories?pagination[pageSize]=100'),
    strapiGet('/api/blogs?populate=*&pagination[pageSize]=100'),
  ])
  return { authors: authors.data, categories: categories.data, blogs: blogs.data }
}

async function uploadCover(image, fallbackName) {
  if (!image || !image.url) return null
  const res = await fetch(image.url)
  if (!res.ok) throw new Error(`Failed to download image ${image.url} (HTTP ${res.status})`)
  const buffer = Buffer.from(await res.arrayBuffer())
  const name = image.name || fallbackName || 'cover'
  const contentType = image.mime || res.headers.get('content-type') || 'image/jpeg'
  const asset = await client.assets.upload('image', buffer, {
    filename: name,
    contentType,
  })
  return {
    _type: 'image',
    asset: { _type: 'reference', _ref: asset._id },
    alt: image.alternativeText || fallbackName || '',
  }
}

async function main() {
  console.log(`Fetching Strapi data from ${STRAPI_URL}...`)
  const { authors, categories, blogs } = await fetchStrapi()
  console.log(`Strapi: ${blogs.length} blogs, ${categories.length} categories, ${authors.length} authors`)

  const authorRefs = new Map()
  for (const a of authors) {
    const doc = {
      _id: `author-${a.id}`,
      _type: 'author',
      name: a.name,
      email: a.email,
      slug: { _type: 'slug', current: slugify(a.name) },
    }
    await client.createOrReplace(doc)
    authorRefs.set(a.id, `author-${a.id}`)
    console.log(`  author  ${a.name} -> ${doc._id}`)
  }

  const categoryRefs = new Map()
  for (const c of categories) {
    const doc = {
      _id: `category-${c.id}`,
      _type: 'category',
      title: c.name,
      slug: { _type: 'slug', current: c.slug || slugify(c.name) },
      description: c.description || undefined,
    }
    await client.createOrReplace(doc)
    categoryRefs.set(c.id, `category-${c.id}`)
    console.log(`  category  ${c.name} -> ${doc._id}`)
  }

  for (const b of blogs) {
    const mainImage = await uploadCover(b.cover, b.title)
    const categoryIds = Array.isArray(b.category)
      ? b.category.map((c) => categoryRefs.get(c.id)).filter(Boolean)
      : []
    const authorId = b.author ? authorRefs.get(b.author.id) : null

    const doc = {
      _id: `post-${b.id}`,
      _type: 'post',
      title: b.title,
      slug: { _type: 'slug', current: b.slug },
      description: b.description,
      content: b.content || '',
      publishedAt: b.publishedAt || b.createdAt,
      ...(mainImage ? { mainImage } : {}),
      ...(categoryIds.length
        ? {
            categories: categoryIds.map((_ref) => ({
              _key: _ref,
              _type: 'reference',
              _ref,
            })),
          }
        : {}),
      ...(authorId ? { author: { _type: 'reference', _ref: authorId } } : {}),
    }
    await client.createOrReplace(doc)
    console.log(`  post     ${b.slug} -> ${doc._id}`)
  }

  const total = await client.fetch(`count(*[_type in ["post", "category", "author"]])`)
  console.log(`\nDone. Sanity dataset now has ${total} documents.`)
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})