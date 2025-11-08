/**
 * Server-side GraphQL execution
 * Handles server-side requests with Next.js caching
 */

import type { ExecutionResult } from 'graphql'
import { ANILIST_API_URL } from '@/lib/constants'
import { getCacheConfig } from './cache'

// ============================================================================
// Types
// ============================================================================

type CacheOptions = {
  revalidate?: number
  tags?: string[]
}

// ============================================================================
// Server-side Execution
// ============================================================================

/**
 * Fetch GraphQL query on server-side with Next.js caching
 */
export async function fetchGraphQLServer<T>(
  query: string,
  variables?: unknown,
  options?: { signal?: AbortSignal } & CacheOptions
): Promise<ExecutionResult<T>> {
  // Use provided cache config or auto-detect from query
  const cacheConfig = options?.tags && options?.revalidate !== undefined
    ? { tags: options.tags, revalidate: options.revalidate }
    : getCacheConfig(query, variables as Record<string, unknown>)

  const response = await fetch(ANILIST_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: variables || undefined,
    }),
    signal: options?.signal,
    cache: 'force-cache', // Explicitly opt into Data Cache
    next: {
      revalidate: cacheConfig.revalidate,
      ...(cacheConfig.tags.length > 0 && { tags: cacheConfig.tags }),
    },
  })

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<ExecutionResult<T>>
}

/**
 * Execute GraphQL query on server-side (for typed execute function)
 */
export async function executeServerGraphQL<TResult>(
  query: string,
  variables: unknown,
  signal: AbortSignal,
  options?: CacheOptions
): Promise<ExecutionResult<TResult>> {
  return fetchGraphQLServer<TResult>(query, variables, {
    signal,
    ...options,
  })
}

/**
 * Execute GraphQL query on server-side (for metadata generation and server components)
 */
export async function executeGraphQL<T = unknown>(
  query: string,
  variables?: Record<string, unknown>,
  options?: CacheOptions
): Promise<{ data?: T; errors?: Array<{ message: string }> }> {
  try {
    const result = await fetchGraphQLServer<T>(
      query,
      variables,
      options
    )
    
    if (result.errors && result.errors.length > 0) {
      return {
        errors: result.errors.map((e: { message: string }) => ({ message: e.message })),
      }
    }

    return { data: result.data ?? undefined }
  } catch (error) {
    console.error('GraphQL execution error:', error)
    return {
      errors: [{ message: error instanceof Error ? error.message : 'Unknown error' }],
    }
  }
}

