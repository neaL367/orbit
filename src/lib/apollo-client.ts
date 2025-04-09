import { ApolloClient, InMemoryCache } from '@apollo/client';
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";
import { BatchHttpLink } from "@apollo/client/link/batch-http";

const httpLink = new BatchHttpLink({
  uri: 'https://graphql.anilist.co',
  batchMax: 5, // Max number of operations per batch
  batchInterval: 20 // Wait time in ms to batch operations
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
      fetchPolicy: "network-only"
    }
  }
});


if (process.env.NODE_ENV !== "production") {
    loadDevMessages();
    loadErrorMessages();
}

