import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'bysrofv4',
  dataset: 'production',
  apiVersion: '2026-08-16',
  useCdn: true,
})

const POST_PROJECTION = `{
  _id,
  title,
  "slug": slug.current,
  description,
  content,
  publishedAt,
  "createdAt": coalesce(publishedAt, _createdAt),
  "cover": mainImage.asset->url,
  "categories": categories[]->{ _id, "name": title, "slug": slug.current },
  "author": author->{ _id, name, email }
}`

const all = await client.fetch(`*[_type == "post"] | order(coalesce(publishedAt, _createdAt) desc) ${POST_PROJECTION}`)
console.log('ALL POSTS:', all.length)
for (const p of all) {
  console.log(`  ${p.slug} | cover=${p.cover ? 'yes' : 'NO!'} | cats=${(p.categories || []).map((c) => c.name).join(',')} | author=${p.author?.name || 'NONE'}`)
}

const snow = await client.fetch(`*[_type == "post" && (title match "*snow*" || description match "*snow*")] ${POST_PROJECTION}`)
console.log('SEARCH "snow":', snow.length, snow.map((p) => p.slug).join(', '))

const cat = await client.fetch(`*[_type == "category" && slug.current == $slug][0] {
  _id, "name": title, "slug": slug.current, description,
  "blogs": *[_type == "post" && references(^._id)] | order(coalesce(publishedAt, _createdAt) desc) {
    _id, title, "slug": slug.current, description, "cover": mainImage.asset->url
  }
}`, { slug: 'lifewild' })
console.log('CATEGORY lifewild:', cat?.name, '| posts:', cat?.blogs?.length, cat?.blogs?.map((b) => b.slug).join(', '))

const one = await client.fetch(`*[_type == "post" && slug.current == $slug][0] ${POST_PROJECTION}`, { slug: '1st-Blog' })
console.log('POST 1st-Blog:', one?.title, '| cover:', one?.cover ? 'yes' : 'NO!', '| contentLen:', one?.content?.length)

const checkKeys = await client.fetch(`*[_type == "post"] { _id, "bad": length(categories[@._key == null]) } | order(_id)`)
console.log('POSTS WITH MISSING KEYS:', checkKeys.filter((p) => p.bad > 0).length)