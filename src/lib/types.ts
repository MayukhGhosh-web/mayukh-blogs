// src/lib/types.ts

// ✅ Image interface (for optional author avatar)
export interface ImageData {
  url: string;
  alt?: string;
}

// ✅ Author interface
export interface Author {
  id: string | number;
  name: string;
  email?: string;
  avatar?: ImageData;
}

// ✅ Category interface
export interface Category {
  id: string | number;
  name: string;
  slug?: string;
  description?: string;
}

// ✅ Blog Post interface
export interface BlogPost {
  id: string | number;
  title: string;
  slug: string;
  description: string;
  content: string;
  createdAt: string;
  cover?: string; // ✅ Absolute image URL
  author?: Author;
  categories?: Category[];
}