// src/lib/types.ts

// ✅ Strapi Image interface
export interface StrapiImage {
  id?: number;
  url?: string;
  documentId?: string;
  name?: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: {
    thumbnail?: {
      url?: string;
      width?: number;
      height?: number;
    };
    small?: {
      url?: string;
      width?: number;
      height?: number;
    };
    medium?: {
      url?: string;
      width?: number;
      height?: number;
    };
    large?: {
      url?: string;
      width?: number;
      height?: number;
    };
  };
}

// ✅ Image interface (for optional author avatar)
export interface ImageData {
  url: string;
  alt?: string;
}

// ✅ Author interface
export interface Author {
  id: number;
  name: string;
  email?: string;
  avatar?: ImageData;
}

// ✅ Category interface
export interface Category {
  id: number;
  name: string;
  description?: string;
}

// ✅ Blog Post interface
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  createdAt: string;
  cover?: StrapiImage | string; // ✅ Handles both cases (URL string or Strapi object)
  author?: Author;
  categories?: Category[];
}

// ✅ Client-side blog post data
export interface UserBlogPostData {
  title: string;
  slug: string;
  description: string;
  content: string;
}

// ✅ API response types
export interface BlogPostResponse {
  data: BlogPost[];
}

export interface SingleBlogPostResponse {
  data: BlogPost;
}
