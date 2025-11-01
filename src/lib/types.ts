// lib/types.ts

// Image interface
export interface ImageData {
  url: string;
  alt?: string; // Optional alt text
}

// Author interface
export interface Author {
  id: number;
  name: string;
  email?: string;
  avatar?: ImageData; // optional
}

// Category interface
export interface Category {
  id: number; // Strapi returns numeric IDs
  name: string;
  description?: string;
}

// Blog post interface
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  createdAt: string;
  cover?: string; // optional
  author?: Author;   // optional
  categories?: Category[]; // optional
}

// For creating a post (client-side)
export interface UserBlogPostData {
  title: string;
  slug: string;
  description: string;
  content: string;
}

// Response types
export interface BlogPostResponse {
  data: BlogPost[];
}

export interface SingleBlogPostResponse {
  data: BlogPost;
}
