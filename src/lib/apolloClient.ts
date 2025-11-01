"use client";

import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const GRAPHQL_URI = `${STRAPI_URL}/graphql`;

// ✅ Auth middleware (optional)
const authLink = setContext((_, { headers }) => {
  let token = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("jwt");
  }

  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  };
});

// ✅ Correct HttpLink setup
const httpLink = new HttpLink({
  uri: GRAPHQL_URI,
  fetch: (uri, options) =>
    fetch(uri, {
      ...options,
      method: "POST", // Force POST
      headers: {
        ...options?.headers,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }),
});

const client = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
});

export default client;
