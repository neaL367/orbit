/**
 * GraphQL utilities and execution
 * Consolidated GraphQL functionality for client and server
 */

import type { ExecutionResult } from 'graphql'
import { ANILIST_API_URL, GRAPHQL_BATCHER, CACHE_TAGS } from './constants'

// ============================================================================
// Types
// ============================================================================

type QueuedRequest = {
  query: string
  variables?: unknown
  resolve: (value: ExecutionResult<unknown>) => void
  reject: (error: Error) => void
  signal?: AbortSignal
}

type GraphQLResult<T> = {
  data?: T
  errors?: Array<{ message: string }>
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Extract query name from GraphQL query string
 */
export function getQueryName(queryString: string): string {
  const match = queryString.match(/(?:query|mutation|subscription)\s+(\w+)/)
  return match ? match[1] : 'unknown'
}

/**
 * Determine cache tags and revalidation time based on query type
 * Following Next.js caching best practices: https://nextjs.org/docs/app/guides/caching
 */
export function getCacheConfig(query: string, variables?: Record<string, unknown>): {
  tags: string[]
  revalidate: number
} {
  const queryName = getQueryName(query)
  const queryLower = query.toLowerCase()
  
  // Extract variables for dynamic tags
  const mediaId = variables?.id as number | undefined
  const season = variables?.season as string | undefined
  const seasonYear = variables?.seasonYear as number | undefined

  // Determine cache tags based on query type
  const tags: string[] = []
  let revalidate = 600 // Default: 10 minutes

  // Schedule queries - real-time data (revalidate every minute)
  if (queryLower.includes('airingschedule') || queryLower.includes('scheduleanime')) {
    tags.push(CACHE_TAGS.ANIME_SCHEDULE)
    revalidate = 60 // 1 minute
  }
  // Upcoming airing queries - real-time data
  else if (queryLower.includes('upcoming') || queryName.toLowerCase().includes('upcoming')) {
    tags.push(CACHE_TAGS.ANIME_UPCOMING)
    revalidate = 60 // 1 minute
  }
  // Anime detail queries - daily updates
  else if (queryLower.includes('media(id:') || queryLower.includes('animebyid') || mediaId) {
    tags.push(CACHE_TAGS.ANIME_DETAIL)
    if (mediaId) {
      tags.push(CACHE_TAGS.animeById(mediaId))
    }
    revalidate = 86400 // 1 day
  }
  // Trending queries - frequently updated (every 10 minutes)
  else if (queryLower.includes('trending') || queryName.toLowerCase().includes('trending')) {
    tags.push(CACHE_TAGS.ANIME_LIST)
    tags.push(CACHE_TAGS.TRENDING)
    revalidate = 600 // 10 minutes
  }
  // Popular queries - frequently updated (every 10 minutes)
  else if (queryLower.includes('popular') || queryName.toLowerCase().includes('popular')) {
    tags.push(CACHE_TAGS.ANIME_LIST)
    tags.push(CACHE_TAGS.POPULAR)
    revalidate = 600 // 10 minutes
  }
  // Seasonal queries - hourly updates
  else if (queryLower.includes('season') || queryName.toLowerCase().includes('seasonal')) {
    tags.push(CACHE_TAGS.ANIME_LIST)
    tags.push(CACHE_TAGS.SEASONAL)
    if (season && seasonYear) {
      tags.push(CACHE_TAGS.animeBySeason(season, seasonYear))
    }
    revalidate = 3600 // 1 hour
  }
  // Top rated queries - hourly updates
  else if (queryLower.includes('top') || queryName.toLowerCase().includes('toprated')) {
    tags.push(CACHE_TAGS.ANIME_LIST)
    tags.push(CACHE_TAGS.TOP_RATED)
    revalidate = 3600 // 1 hour
  }
  // Search queries - frequently updated (every 10 minutes)
  else if (queryLower.includes('search') || queryName.toLowerCase().includes('search')) {
    tags.push(CACHE_TAGS.ANIME_LIST)
    tags.push(CACHE_TAGS.ANIME_SEARCH)
    revalidate = 600 // 10 minutes
  }
  // Default - general anime list
  else {
    tags.push(CACHE_TAGS.ANIME_LIST)
    revalidate = 600 // 10 minutes
  }

  return { tags, revalidate }
}

/**
 * Check if error is an abort error
 */
export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError'
}

/**
 * Create a timeout error message
 */
export function createTimeoutError(): Error {
  return new Error('Request timeout. Please try again.')
}

/**
 * Handle GraphQL execution errors with proper error messages
 */
export function handleGraphQLErrors(result: ExecutionResult<unknown>): never {
  if (!result.errors || result.errors.length === 0) {
    throw new Error('Unknown GraphQL error')
  }

  // Check for rate limit errors
  const rateLimitError = result.errors.find((e) => {
    const message = e.message?.toLowerCase() || ''
    return message.includes('rate limit') || message.includes('too many requests')
  })
  
  if (rateLimitError) {
    throw new Error('Rate limit exceeded. Please wait a moment and try again.')
  }

  // Format and throw error message
  const errorMessage = result.errors.map((e) => e.message || 'Unknown error').join(', ')
  throw new Error(errorMessage)
}

// ============================================================================
// GraphQL Batcher (Client-side)
// ============================================================================

class GraphQLBatcher {
  private queue: QueuedRequest[] = []
  private batchTimeout: NodeJS.Timeout | null = null
  private readonly BATCH_DELAY = GRAPHQL_BATCHER.DELAY
  private readonly MAX_BATCH_SIZE = GRAPHQL_BATCHER.MAX_SIZE

  async add(
    query: string,
    variables?: unknown,
    signal?: AbortSignal
  ): Promise<ExecutionResult<unknown>> {
    return new Promise((resolve, reject) => {
      // Check if request was aborted
      if (signal?.aborted) {
        reject(new Error('Request was cancelled'))
        return
      }

      this.queue.push({
        query,
        variables,
        resolve,
        reject,
        signal,
      })

      // If queue reaches max size, process immediately
      if (this.queue.length >= this.MAX_BATCH_SIZE) {
        this.processBatch()
        return
      }

      // Set timeout to process batch
      if (this.batchTimeout) {
        clearTimeout(this.batchTimeout)
      }

      this.batchTimeout = setTimeout(() => {
        this.processBatch()
      }, this.BATCH_DELAY)
    })
  }

  /**
   * Resolve batch results for each request
   */
  private resolveBatchResults(
    batch: QueuedRequest[],
    results: ExecutionResult<unknown>[]
  ): void {
    batch.forEach((req, index) => {
      if (req.signal?.aborted) {
        req.reject(new Error('Request was cancelled'))
        return
      }

      const result = results[index] || results[0]
      if (result.errors && result.errors.length > 0) {
        const errorMessage = result.errors
          .map((e: { message: string }) => e.message)
          .join(', ')
        req.reject(new Error(errorMessage))
      } else {
        req.resolve(result)
      }
    })
  }

  private async processBatch() {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout)
      this.batchTimeout = null
    }

    if (this.queue.length === 0) return

    const batch = this.queue.splice(0, this.MAX_BATCH_SIZE)
    
    // Filter out aborted requests
    const activeBatch = batch.filter((req) => !req.signal?.aborted)
    
    if (activeBatch.length === 0) {
      // All requests were aborted
      batch.forEach((req) => req.reject(new Error('Request was cancelled')))
      return
    }

    try {
      // Send batch request to API route (which will handle parallel requests)
      const batchPayload = activeBatch.map((req) => ({
        query: req.query,
        variables: req.variables || undefined,
      }))

      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(batchPayload),
      })

      if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`)
      }

      const results = await response.json()
      const resultsArray = Array.isArray(results) ? results : [results]

      // Resolve each request with its corresponding result
      this.resolveBatchResults(activeBatch, resultsArray)
    } catch (error) {
      // Reject all requests with the error
      activeBatch.forEach((req) => {
        req.reject(error instanceof Error ? error : new Error('Unknown error'))
      })
    }
  }
}

// Singleton instance
const batcher = new GraphQLBatcher()

/**
 * Batch GraphQL request (client-side)
 */
export function batchGraphQLRequest(
  query: string,
  variables?: unknown,
  signal?: AbortSignal
): Promise<ExecutionResult<unknown>> {
  return batcher.add(query, variables, signal)
}

// ============================================================================
// Server-side GraphQL Execution
// ============================================================================

/**
 * Shared server-side fetch function
 * Used by both execute() and executeGraphQL()
 * Now supports Next.js caching
 * Can also be used by API routes
 */
export async function fetchGraphQLServer<T>(
  query: string,
  variables?: unknown,
  options?: { signal?: AbortSignal; revalidate?: number; tags?: string[] }
): Promise<ExecutionResult<T>> {
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
      ...(options?.revalidate !== undefined && { revalidate: options.revalidate }),
      ...(options?.tags && { tags: options.tags }),
    },
  })

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<ExecutionResult<T>>
}

/**
 * Execute GraphQL query on server-side (for typed execute function)
 * Used by graphql/execute.ts
 * Supports optional caching configuration
 */
export async function executeServerGraphQL<TResult>(
  query: string,
  variables: unknown,
  signal: AbortSignal,
  options?: { tags?: string[]; revalidate?: number }
): Promise<ExecutionResult<TResult>> {
  // Use dynamic cache configuration if not explicitly provided
  const cacheConfig = options?.tags && options?.revalidate
    ? { tags: options.tags, revalidate: options.revalidate }
    : getCacheConfig(query, variables as Record<string, unknown>)

  return fetchGraphQLServer<TResult>(query, variables, {
    signal,
    revalidate: cacheConfig.revalidate,
    tags: cacheConfig.tags,
  })
}

/**
 * Execute GraphQL query on server-side (for metadata generation)
 * Used for server components and generateMetadata functions
 * Now supports Next.js caching with dynamic cache configuration
 */
export async function executeGraphQL<T = unknown>(
  query: string,
  variables?: Record<string, unknown>,
  options?: { tags?: string[]; revalidate?: number }
): Promise<GraphQLResult<T>> {
  try {
    // Use dynamic cache configuration if not explicitly provided
    const cacheConfig = options?.tags && options?.revalidate
      ? { tags: options.tags, revalidate: options.revalidate }
      : getCacheConfig(query, variables)

    const result = await fetchGraphQLServer<T>(
      query,
      variables,
      {
        revalidate: cacheConfig.revalidate,
        tags: cacheConfig.tags,
      }
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

