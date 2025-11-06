/**
 * GraphQL utilities and execution
 * Consolidated GraphQL functionality for client and server
 */

import type { ExecutionResult } from 'graphql'
import { ANILIST_API_URL, CACHE_TIMES, GRAPHQL_BATCHER } from './constants'

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
 * Check if error is a rate limit error
 */
export function isRateLimitError(error: { message?: string }): boolean {
  const message = error.message?.toLowerCase() || ''
  return message.includes('rate limit') || message.includes('too many requests')
}

/**
 * Format GraphQL errors into a single error message
 */
export function formatGraphQLErrors(errors: ReadonlyArray<{ message?: string | null }>): string {
  return errors.map((e) => e.message || 'Unknown error').join(', ')
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

  const rateLimitError = result.errors.find(isRateLimitError)
  if (rateLimitError) {
    throw new Error('Rate limit exceeded. Please wait a moment and try again.')
  }

  throw new Error(formatGraphQLErrors(result.errors))
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
 */
async function fetchGraphQLServer<T>(
  query: string,
  variables?: unknown,
  options?: { signal?: AbortSignal; revalidate?: number }
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
    ...(options?.revalidate !== undefined && { next: { revalidate: options.revalidate } }),
  })

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<ExecutionResult<T>>
}

/**
 * Execute GraphQL query on server-side (for typed execute function)
 * Used by graphql/execute.ts
 */
export async function executeServerGraphQL<TResult>(
  query: string,
  variables: unknown,
  signal: AbortSignal
): Promise<ExecutionResult<TResult>> {
  return fetchGraphQLServer<TResult>(query, variables, { signal })
}

/**
 * Execute GraphQL query on server-side (for metadata generation)
 * Used for server components and generateMetadata functions
 */
export async function executeGraphQL<T = unknown>(
  query: string,
  variables?: Record<string, unknown>
): Promise<GraphQLResult<T>> {
  try {
    const result = await fetchGraphQLServer<T>(query, variables, { revalidate: CACHE_TIMES.SHORT })
    
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

