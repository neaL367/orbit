import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";

const httpLink = new HttpLink({
  uri: 'https://graphql.anilist.co'
});

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          Page: {
            merge(existing, incoming) {
              return incoming;
            },
          },
        },
      },
      Media: {
        fields: {
          coverImage: {
            merge(existing, incoming) {
              return { ...existing, ...incoming };
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      // Use cache-first as default strategy
      fetchPolicy: "cache-first",
      // Refetch on network connection if stale
      nextFetchPolicy: "cache-and-network",
      // Return partial results from cache if available
      returnPartialData: true,
    },
  }
});


if (process.env.NODE_ENV !== "production") {
  loadDevMessages();
  loadErrorMessages();
}

