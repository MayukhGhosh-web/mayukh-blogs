// lib/api.ts
import axios from "axios";
import { UserBlogPostData } from "./types";
import type { BlogPost } from "./types";

// --- Utility Functions for Strapi Data Transformation ---
const mapStrapiItemToBlogPost = (item: any): BlogPost => {
  if (!item || !item.attributes) {
    throw new Error("Invalid Strapi item structure for mapping.");
  }
  const attrs = item.attributes;

  return {
    id: item.id,
    slug: attrs.slug,
    title: attrs.title,
    description: attrs.description,
    content: attrs.content || null,
    cover: attrs.cover?.data || null,
    categories: attrs.categories?.data || [],
    author: attrs.author?.data || null,
    createdAt: attrs.createdAt,
  } as BlogPost;
};

// --- API Client Setup ---
export const api: any = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_STRAPI_URL ||
    "https://honorable-breeze-55074c763a.strapiapp.com",
});

// ------------------------------------------------------------------
// 🚀 API Endpoints
// ------------------------------------------------------------------

// ✅ Fetch all posts with pagination and optional search
export const getAllPosts = async (page = 1, searchQuery = "") => {
  try {
    const populateQuery =
      "populate[0]=cover&populate[1]=categories&populate[2]=author";
    const searchFilter = searchQuery
      ? `&filters[title][$containsi]=${encodeURIComponent(searchQuery)}`
      : "";

    const response = await api.get(
      `/api/blogs?${populateQuery}&pagination[page]=${page}&pagination[pageSize]=${
        process.env.NEXT_PUBLIC_PAGE_LIMIT || 10
      }${searchFilter}`
    );

    const mappedPosts = response.data.data.map(mapStrapiItemToBlogPost);

    return {
      posts: mappedPosts,
      pagination: response.data.meta?.pagination,
    };
  } catch (error) {
    console.error("Error fetching blogs:", error);
    throw new Error("Failed to fetch blog posts.");
  }
};

// ✅ Fetch single post by slug
export const getPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  try {
    const response = await api.get(`/api/blogs`, {
      params: {
        filters: {
          slug: { $eq: slug },
        },
        populate: {
          cover: true,
          categories: true,
          author: true,
        },
      },
    });

    const data = response.data;
    if (!data || !data.data || data.data.length === 0) {
      throw new Error("Post not found");
    }

    const item = data.data[0];
    return mapStrapiItemToBlogPost(item);
  } catch (err) {
    console.error("Error fetching post:", err);
    return null;
  }
};

// ✅ Fetch all categories
export const getAllCategories = async () => {
  try {
    const response = await api.get(`/api/categories`);
    return response.data.data.map((item: any) => ({
      id: item.id,
      name: item.attributes.name,
      slug: item.attributes.slug,
    }));
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Failed to fetch categories.");
  }
};

// ✅ Upload cover image
export const uploadImage = async (image: File, refId: number) => {
  try {
    const formData = new FormData();
    formData.append("files", image);
    formData.append("ref", "api::blog.blog");
    formData.append("refId", refId.toString());
    formData.append("field", "cover");

    const response = await api.post(`/api/upload`, formData);
    return response.data[0];
  } catch (err) {
    console.error("Error uploading image:", err);
    throw err;
  }
};

// ✅ Create new blog post
export const createPost = async (postData: UserBlogPostData) => {
  try {
    const reqData = { data: { ...postData } };
    const response = await api.post(`/api/blogs`, reqData);
    return mapStrapiItemToBlogPost(response.data.data);
  } catch (error) {
    console.error("Error creating post:", error);
    throw new Error("Failed to create post");
  }
};

// ✅ FIXED: Search blogs by title (for search page)
export async function getBlogsBySearch(query: string): Promise<BlogPost[]> {
  try {
    const { posts } = await getAllPosts(1, query);
    return posts;
  } catch (error) {
    console.error("Error searching blogs:", error);
    return [];
  }
}
