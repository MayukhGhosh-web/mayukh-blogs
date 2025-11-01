// src/graphql/queries.ts
import { gql } from "@apollo/client";

export const GET_ALL_POSTS_QUERY = gql`
  query GetAllPosts($page: Int!, $pageSize: Int!, $search: String) {
    blogs(
      pagination: { page: $page, pageSize: $pageSize }
      filters: { title: { containsi: $search } }
      sort: "createdAt:desc"
      publicationState: LIVE
    ) {
      data {
        id
        attributes {
          slug
          title
          description
          createdAt
          cover { data { attributes { url } } }
          categories { data { attributes { name } } }
          author { data { attributes { name } } }
        }
      }
      meta {
        pagination {
          page
          pageSize
          pageCount
          total
        }
      }
    }
  }
`;
