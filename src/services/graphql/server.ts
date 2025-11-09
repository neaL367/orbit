/**
 * Server-side GraphQL execution
 * Handles server-side requests with Next.js caching and AniList rate limit tracking
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

export type AniListRateLimit = {
  limit: number
  remaining: number
  resetTime: number
  lastUpdated: number
}

// ============================================================================
// AniList Rate Limit Tracking
// ============================================================================

// Global AniList rate limit tracker (shared across all requests)
// NOTE: AniList API is currently in degraded state: 30 requests/minute (temporary)
// Normal limit: 90 requests per minute
// The actual limit is tracked from response headers and will auto-adjust
let anilistRateLimit: AniListRateLimit = {
  limit: 30,
  remaining: 30,
  resetTime: Date.now() + 60000,
  lastUpdated: Date.now(),
}

function updateAniListRateLimit(headers: Headers): void {
  const limit = headers.get('x-ratelimit-limit')
  const remaining = headers.get('x-ratelimit-remaining')
  const reset = headers.get('x-ratelimit-reset')

  if (limit) anilistRateLimit.limit = parseInt(limit, 10)
  if (remaining !== null) anilistRateLimit.remaining = parseInt(remaining, 10)
  if (reset) anilistRateLimit.resetTime = parseInt(reset, 10) * 1000
  anilistRateLimit.lastUpdated = Date.now()
}

export function getAniListRateLimit(): AniListRateLimit {
  const now = Date.now()
  
  if (now > anilistRateLimit.resetTime) {
    // Reset to current degraded state limit (30)
    // Will be updated from headers on next request
    anilistRateLimit = {
      limit: 30,
      remaining: 30,
      resetTime: now + 60000,
      lastUpdated: now,
    }
  }
  
  return { ...anilistRateLimit }
}

export function canMakeAniListRequest(): boolean {
  return getAniListRateLimit().remaining > 0
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
    cache: 'force-cache',
    next: {
      revalidate: cacheConfig.revalidate,
      ...(cacheConfig.tags.length > 0 && { tags: cacheConfig.tags }),
    },
  })

  updateAniListRateLimit(response.headers)

  if (response.status === 429) {
    const reset = response.headers.get('x-ratelimit-reset')
    const result = await response.json().catch(() => ({
      data: null,
      errors: [{ message: 'Too Many Requests.', status: 429 }],
    })) as ExecutionResult<T>

    if (reset) {
      anilistRateLimit.resetTime = parseInt(reset, 10) * 1000
      anilistRateLimit.remaining = 0
    }

    return result
  }

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

