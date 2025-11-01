// lib/api.ts
import axios from "axios";
import { UserBlogPostData } from "./types";
import type { BlogPost } from "./types";

// --- Utility Functions for Strapi Data Transformation ---

/**
 * Maps a single Strapi response item (with nested 'attributes') to a flat object.
 */
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
    // Strapi relationships often have a 'data' array or object
    cover: attrs.cover?.data || null, 
    categories: attrs.categories?.data || [], 
    author: attrs.author?.data || null, 
    createdAt: attrs.createdAt,
    // Add other fields you might need
  } as BlogPost; // Cast to your BlogPost type
};


// --- API Client Setup ---
export const api: any = axios.create({
  baseURL: process.env.NEXT_PUBLIC_STRAPI_URL,
});


// ------------------------------------------------------------------
//🚀 API Endpoints
// ------------------------------------------------------------------

// ✅ Fetch all posts with pagination and optional search
export const getAllPosts = async (page = 1, searchQuery = "") => {
  try {
    // Ensure 'populate' includes all necessary relations
    const populateQuery = 'populate[0]=cover&populate[1]=categories&populate[2]=author';
    const searchFilter = searchQuery
      ? `&filters[title][$containsi]=${encodeURIComponent(searchQuery)}`
      : "";

    const response = await api.get(
      `/api/blogs?${populateQuery}&pagination[page]=${page}&pagination[pageSize]=${
        process.env.NEXT_PUBLIC_PAGE_LIMIT
      }${searchFilter}`
    );

    const mappedPosts = response.data.data.map(mapStrapiItemToBlogPost);

    return {
      posts: mappedPosts,
      pagination: response.data.meta?.pagination,
    };
  } catch (error) {
    console.error("Error fetching blogs:", error);
    // Use a specific error message for clarity
    throw new Error("Failed to fetch blog posts.");
  }
};



// ✅ Fetch single post by slug
export const getPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  try {
    // Populate all relations for the single post view
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

return data.data[0];


    // Strapi returns an array even for filtered queries, so grab the first item
    const item = data.data[0];
    
    // Map the Strapi structure to your flat BlogPost type
    return mapStrapiItemToBlogPost(item);

  } catch (err) {
    console.error("Error fetching post:", err);
    return null;
  }
};



// ✅ Fetch all categories (assumes you need a flat array of categories)
export const getAllCategories = async () => {
  try {
    const response = await api.get(`/api/categories`);
    
    // Map to flatten category data if necessary (e.g., to get id and name)
    return response.data.data.map((item: any) => ({
      id: item.id,
      name: item.attributes.name, // Assuming 'name' is the field in Strapi
      slug: item.attributes.slug,
    }));
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Failed to fetch categories.");
  }
};



// ✅ Upload cover image
// Note: Ensure the API client is configured with authentication for this endpoint if needed.
export const uploadImage = async (image: File, refId: number) => {
  try {
    const formData = new FormData();
    formData.append("files", image);
    formData.append("ref", "api::blog.blog"); // Strapi content-type UID
    formData.append("refId", refId.toString());
    formData.append("field", "cover"); // The name of the field in your model

    const response = await api.post(`/api/upload`, formData);
    return response.data[0]; // Returns the uploaded file object
  } catch (err) {
    console.error("Error uploading image:", err);
    throw err;
  }
};



// ✅ Create a new blog post
export const createPost = async (postData: UserBlogPostData) => {
  try {
    // Strapi requires the data payload to be wrapped in a 'data' object
    const reqData = { data: { ...postData } };
    const response = await api.post(`/api/blogs`, reqData);
    
    // Map and return the newly created post
    return mapStrapiItemToBlogPost(response.data.data);

  } catch (error) {
    console.error("Error creating post:", error);
    throw new Error("Failed to create post");
  }
};



// ✅ Search posts by title (This is now redundant, use getAllPosts with searchQuery)
// I recommend removing this function and using getAllPosts for all fetching needs.
/*
export async function getBlogsBySearch(query: string): Promise<BlogPost[]> {
  // Use getAllPosts with pagination and query logic combined
  // This avoids duplicate logic and inconsistent data mapping.
  // Example: 
  const result = await getAllPosts(1, query);
  return result.posts;
}
*/