import { ApolloClient, InMemoryCache } from '@apollo/client'
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";

export const client = new ApolloClient({
    uri: 'https://graphql.anilist.co',
    cache: new InMemoryCache({
        typePolicies: {
            Query: {
                fields: {
                    Page: {
                        keyArgs: false, // or specify which arguments should be used to uniquely identify this field
                        merge(existing = [], incoming) {
                            // Customize merge logic. This is a basic example merging the objects.
                            return { ...existing, ...incoming };
                        },
                    },
                    coverImage: {
                        merge(existing = [], incoming) {
                            return { ...existing, ...incoming };
                        }
                    }
                },
            },
            Page: {
                // Disable merging so new queries replace previous data
                keyFields: false,
                merge(incoming) {
                    return incoming;
                },
            },
        },
    })
});


if (process.env.NODE_ENV !== "production") {
    loadDevMessages();
    loadErrorMessages();
}

