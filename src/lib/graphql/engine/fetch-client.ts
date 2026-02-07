/**
 * Client-side GraphQL execution
 */

import type { ExecutionResult } from 'graphql'
import { batcher } from './batcher'

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
