import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";
import { AnimeMedia } from './types';

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

              const existingIds = new Set((existing.media || []).map((item: AnimeMedia) => item.id));
              const mergedMedia = [
                ...(existing.media || []),
                ...(incoming.media || []).filter((item: AnimeMedia) => item && !existingIds.has(item.id)),
              ];

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
      fetchPolicy: "cache-and-network",
    }
  }
});

if (process.env.NODE_ENV !== "production") {
  loadDevMessages();
  loadErrorMessages();
}

