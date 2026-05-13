'use client'

import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { useState } from 'react'
import { createIndexedDBStorage } from '@/lib/utils/idb-storage'
export function QueryProviders({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 1000 * 60 * 5, // 5 minutes
                        gcTime: 1000 * 60 * 60 * 24, // 24 hours
                        retry: 3,
                        refetchOnWindowFocus: false,
                        refetchOnReconnect: true,
                    },
                    mutations: {
                        retry: 1,
                    },
                },
            })
    )

    const [persister] = useState(() => 
        createAsyncStoragePersister({
            storage: createIndexedDBStorage(),
            serialize: JSON.stringify,
            deserialize: JSON.parse,
        })
    )

    return (
        <PersistQueryClientProvider 
            client={queryClient}
            persistOptions={{
                persister,
                maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
            }}
        >
            {children}
        </PersistQueryClientProvider>
    )
}
