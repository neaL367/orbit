/**
 * Server-side GraphQL execution
 */

import type { ExecutionResult } from 'graphql'
import { ANILIST_API_URL } from '@/lib/constants'
import { getCacheConfig } from './cache'
import { updateAniListRateLimit, setRateLimitExceeded } from './rate-limit'

export type CacheOptions = {
    revalidate?: number
    tags?: string[]
}

/**
 * Core fetch function for AniList GraphQL API
 */
export async function fetchGraphQLServer<T>(
    query: string,
    variables?: unknown,
    options?: { signal?: AbortSignal; headers?: HeadersInit } & CacheOptions
): Promise<ExecutionResult<T>> {
    const cacheConfig = options?.tags && options?.revalidate !== undefined
        ? { tags: options.tags, revalidate: options.revalidate }
        : getCacheConfig(query, variables as Record<string, unknown>)

    const headers = new Headers({
        'Content-Type': 'application/json',
        Accept: 'application/json',
    })
    if (options?.headers) {
        const extra = new Headers(options.headers)
        extra.forEach((value, key) => {
            headers.set(key, value)
        })
    }

    const response = await fetch(ANILIST_API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            query,
            variables: variables || undefined,
        }),
        signal: options?.signal,
        cache: 'force-cache',
        next: {
            revalidate: cacheConfig.revalidate,
            ...(cacheConfig.tags.length > 0 && { tags: cacheConfig.tags }),
        },
    })

    updateAniListRateLimit(response.headers)

    if (response.status === 429) {
        setRateLimitExceeded(response.headers.get('x-ratelimit-reset'))

        return await response.json().catch(() => ({
            data: null,
            errors: [{ message: 'Too Many Requests.', status: 429 }],
        })) as ExecutionResult<T>
    }

    if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`)
    }

    return response.json() as Promise<ExecutionResult<T>>
}

/**
 * Execute GraphQL query on server-side
 */
export async function executeServerGraphQL<TResult>(
    query: string,
    variables: unknown,
    signal: AbortSignal,
    options?: CacheOptions & { headers?: HeadersInit }
): Promise<ExecutionResult<TResult>> {
    return fetchGraphQLServer<TResult>(query, variables, {
        signal,
        ...options,
    })
}

/**
 * Execute GraphQL query (simplified version for metadata/server components)
 */
export async function executeGraphQL<T = unknown>(
    query: string,
    variables?: Record<string, unknown>,
    options?: CacheOptions
): Promise<{ data?: T; errors?: Array<{ message: string }> }> {
    try {
        const result = await fetchGraphQLServer<T>(query, variables, options)

        if (result.errors && result.errors.length > 0) {
            return {
                errors: result.errors.map(e => ({ message: e.message })),
            }
        }

        return { data: result.data ?? undefined }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        if (!message.includes('404')) {
            console.error('[GraphQL Server Error]:', error)
        }
        return {
            errors: [{ message }],
        }
    }
}
