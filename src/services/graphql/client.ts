/**
 * Client-side GraphQL execution
 * Handles batching and client-side request routing
 */

import type { ExecutionResult } from 'graphql'
import { GRAPHQL_BATCHER } from '@/lib/constants'

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
 * Execute GraphQL query on client-side (with batching)
 */
export async function executeClientGraphQL<TResult>(
  query: string,
  variables?: unknown,
  signal?: AbortSignal
): Promise<ExecutionResult<TResult>> {
  return batcher.add(query, variables, signal) as Promise<ExecutionResult<TResult>>
}

