import { ApolloClient, InMemoryCache } from '@apollo/client'
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";

export const client = new ApolloClient({
    uri: 'https://graphql.anilist.co',
    cache: new InMemoryCache({
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

