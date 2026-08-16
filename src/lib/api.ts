// lib/api.ts — Sanity-backed data layer (migrated from Strapi REST)
import { client } from "@/sanity/lib/client";
import type { BlogPost, Category } from "./types";

const PAGE_LIMIT = Number(process.env.NEXT_PUBLIC_PAGE_LIMIT) || 10;

// Shared projection for post documents
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
}`;

const mapSanityPost = (doc: any): BlogPost => ({
  id: doc._id,
  slug: doc.slug ?? "",
  title: doc.title ?? "",
  description: doc.description ?? "",
  content: doc.content ?? "",
  cover: doc.cover,
  categories: doc.categories ?? [],
  author: doc.author ?? null,
  createdAt: doc.createdAt ?? "",
});

// Sanitize a user search term into a GROQ `match` pattern (contains-style, case-insensitive)
const toMatchPattern = (query: string) =>
  `*${query.replace(/[*]/g, "").trim()}*`;

const postFilter = (searchQuery: string) =>
  searchQuery
    ? `&& (title match "${toMatchPattern(searchQuery)}" || description match "${toMatchPattern(searchQuery)}")`
    : "";

// ✅ Fetch all posts with pagination and optional search
export const getAllPosts = async (page = 1, searchQuery = "", pageSize?: number) => {
  const limit = pageSize ?? PAGE_LIMIT;
  const start = (page - 1) * limit;
  const end = start + limit;
  const filter = postFilter(searchQuery);

  const query = `*[_type == "post" ${filter}] | order(coalesce(publishedAt, _createdAt) desc)[$start...$end] ${POST_PROJECTION}`;
  const countQuery = `count(*[_type == "post" ${filter}])`;

  const [posts, total] = await Promise.all([
    client.fetch(query, { start, end }).then((rows: any[]) => rows.map(mapSanityPost)),
    client.fetch(countQuery),
  ]);

  return {
    posts: posts.map(mapSanityPost),
    pagination: {
      page,
      pageSize: limit,
      pageCount: Math.max(1, Math.ceil(total / limit)),
      total,
    },
  };
};

// ✅ Fetch single post by slug
export const getPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  try {
    const doc = await client.fetch(
      `*[_type == "post" && slug.current == $slug][0] ${POST_PROJECTION}`,
      { slug }
    );
    return doc ? mapSanityPost(doc) : null;
  } catch (err) {
    console.error("Error fetching post:", err);
    return null;
  }
};

// ✅ Fetch all categories
export const getAllCategories = async () => {
  const docs = await client.fetch(
    `*[_type == "category"] | order(title asc) { _id, "name": title, "slug": slug.current, description }`
  );
  return docs.map((item: any) => ({
    id: item._id,
    name: item.name,
    slug: item.slug,
    description: item.description,
  }));
};

// ✅ Fetch a category by slug with its posts
export const getCategoryWithPosts = async (slug: string) => {
  const result = await client.fetch(
    `*[_type == "category" && slug.current == $slug][0] {
      _id,
      "name": title,
      "slug": slug.current,
      description,
      "blogs": *[_type == "post" && references(^._id)] | order(coalesce(publishedAt, _createdAt) desc) {
        _id,
        title,
        "slug": slug.current,
        description,
        "createdAt": coalesce(publishedAt, _createdAt),
        "cover": mainImage.asset->url
      }
    }`,
    { slug }
  );

  if (!result) return null;

  return {
    name: result.name,
    blogs: (result.blogs ?? []).map((b: any) => ({
      id: b._id,
      title: b.title,
      slug: b.slug,
      description: b.description,
      cover: b.cover,
    })),
  };
};

// ✅ Search blogs by title/description (for search page)
export async function getBlogsBySearch(query: string): Promise<BlogPost[]> {
  try {
    const { posts } = await getAllPosts(1, query);
    return posts;
  } catch (error) {
    console.error("Error searching blogs:", error);
    return [];
  }
}
