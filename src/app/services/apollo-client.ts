import { ApolloClient, InMemoryCache } from '@apollo/client'
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";

export const apolloClient = new ApolloClient({
    uri: 'https://graphql.anilist.co',
    cache: new InMemoryCache({
        typePolicies: {
            Query: {
                fields: {
                    Page: {
                        keyArgs: false, // or specify which arguments should be used to uniquely identify this field
                        merge(existing = {}, incoming) {
                            // Customize merge logic. This is a basic example merging the objects.
                            return { ...existing, ...incoming };
                        },
                    },
                },
            },
        },
    })
});


if (process.env.NODE_ENV !== "production") {
    loadDevMessages();
    loadErrorMessages();
}

