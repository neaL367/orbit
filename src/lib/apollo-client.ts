import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";

const httpLink = new HttpLink({
  uri: 'https://graphql.anilist.co'
});

export const Client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          Page: {
            keyArgs: false,
            merge(existing, incoming) {
              if (!existing) return incoming;

              // Create a map of existing media items by ID
              const existingMediaMap = new Map(
                (existing.media || []).map((item: { id: number }) => [item.id, item])
              );

              // Add new media items that don't already exist
              const mergedMedia = [...(existing.media || [])];

              (incoming.media || []).forEach((item: { id: number }) => {
                if (!existingMediaMap.has(item.id)) {
                  mergedMedia.push(item);
                }
              });

              return {
                ...incoming,
                media: mergedMedia,
              };
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-first",
      nextFetchPolicy: "cache-first",
    },
    query: {
      fetchPolicy: "cache-first",
    }
  }
});


if (process.env.NODE_ENV !== "production") {
  loadDevMessages();
  loadErrorMessages();
}

