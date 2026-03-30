/**
 * Client-side GraphQL request batcher
 */

import type { ExecutionResult } from 'graphql'
import { GRAPHQL_BATCHER } from '@/lib/constants'

type QueuedRequest = {
    query: string
    variables?: unknown
    resolve: (value: ExecutionResult<unknown>) => void
    reject: (error: Error) => void
    signal?: AbortSignal
}

export class GraphQLBatcher {
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
            if (signal?.aborted) {
                reject(new Error('Request was cancelled'))
                return
            }

            this.queue.push({ query, variables, resolve, reject, signal })

            if (this.queue.length >= this.MAX_BATCH_SIZE) {
                this.processBatch()
                return
            }

            if (this.batchTimeout) clearTimeout(this.batchTimeout)
            this.batchTimeout = setTimeout(() => this.processBatch(), this.BATCH_DELAY)
        })
    }

    private async processBatch() {
        if (this.batchTimeout) {
            clearTimeout(this.batchTimeout)
            this.batchTimeout = null
        }

        if (this.queue.length === 0) return

        const batch = this.queue.splice(0, this.MAX_BATCH_SIZE)
        const activeBatch = batch.filter(req => !req.signal?.aborted)

        // Reject cancelled requests
        batch.filter(req => req.signal?.aborted).forEach(req => req.reject(new Error('Request was cancelled')))

        if (activeBatch.length === 0) return

        try {
            const batchPayload = activeBatch.map(req => ({
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

            activeBatch.forEach((req, index) => {
                const result = resultsArray[index] || resultsArray[0]
                if (result.errors && result.errors.length > 0) {
                    const errorMessage = result.errors.map((e: { message: string }) => e.message).join(', ')
                    req.reject(new Error(errorMessage))
                } else {
                    req.resolve(result)
                }
            })
        } catch (error) {
            activeBatch.forEach(req => req.reject(error instanceof Error ? error : new Error('Unknown error')))
        }
    }
}

export const batcher = new GraphQLBatcher()
