/**
 * GraphQL Request Batcher
 * Queues requests and batches them together to reduce network requests
 */

type QueuedRequest = {
  query: string
  variables?: unknown
  resolve: (value: ExecutionResult<unknown>) => void
  reject: (error: Error) => void
  signal?: AbortSignal
}

type ExecutionResult<T> = {
  data?: T
  errors?: Array<{ message: string }>
}

class GraphQLBatcher {
  private queue: QueuedRequest[] = []
  private batchTimeout: NodeJS.Timeout | null = null
  private readonly BATCH_DELAY = 50 // 50ms batching window
  private readonly MAX_BATCH_SIZE = 10 // Maximum requests per batch

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
      activeBatch.forEach((req, index) => {
        if (req.signal?.aborted) {
          req.reject(new Error('Request was cancelled'))
        } else {
          const result = resultsArray[index] || resultsArray[0]
          if (result.errors && result.errors.length > 0) {
            req.reject(new Error(result.errors.map((e: { message: string }) => e.message).join(', ')))
          } else {
            req.resolve(result)
          }
        }
      })
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

export function batchGraphQLRequest(
  query: string,
  variables?: unknown,
  signal?: AbortSignal
): Promise<ExecutionResult<unknown>> {
  return batcher.add(query, variables, signal)
}

