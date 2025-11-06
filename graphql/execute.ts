import type { ExecutionResult } from 'graphql'
import type { TypedDocumentString } from './graphql'
import { GRAPHQL_TIMEOUT } from '@/lib/constants'
import { handleGraphQLErrors, isAbortError, createTimeoutError, batchGraphQLRequest, executeServerGraphQL } from '@/lib/graphql'

// Lazy batcher import - only loads when actually needed (prevents preload warning)
let batcherLoaded = false

/**
 * Create abort controller with timeout
 */
function createTimeoutController(signal?: AbortSignal): {
  controller: AbortController
  timeoutId: NodeJS.Timeout
  signal: AbortSignal
} {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), GRAPHQL_TIMEOUT)
  const finalSignal = signal || controller.signal

  if (signal) {
    signal.addEventListener('abort', () => clearTimeout(timeoutId))
  }

  return { controller, timeoutId, signal: finalSignal }
}

/**
 * Execute GraphQL query on client side using batcher
 */
async function executeClient<TResult>(
  query: string,
  variables: unknown,
  signal: AbortSignal
): Promise<ExecutionResult<TResult>> {
  if (!batcherLoaded) {
    // Lazy load batcher to prevent preload warning
    await import('@/lib/graphql')
    batcherLoaded = true
  }
  return batchGraphQLRequest(query, variables, signal) as Promise<ExecutionResult<TResult>>
}

/**
 * Execute GraphQL query on server side
 * Uses shared server-side execution from lib/graphql
 */
async function executeServer<TResult>(
  query: string,
  variables: unknown,
  signal: AbortSignal
): Promise<ExecutionResult<TResult>> {
  return executeServerGraphQL<TResult>(query, variables, signal)
}

export async function execute<TResult, TVariables>(
  query: TypedDocumentString<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
): Promise<ExecutionResult<TResult>>
export async function execute<TResult, TVariables>(
  query: TypedDocumentString<TResult, TVariables>,
  variables: TVariables,
  options: { signal?: AbortSignal }
): Promise<ExecutionResult<TResult>>
export async function execute<TResult, TVariables>(
  query: TypedDocumentString<TResult, TVariables>,
  variablesOrEmpty?: TVariables | undefined,
  options?: { signal?: AbortSignal }
): Promise<ExecutionResult<TResult>> {
  const variables = variablesOrEmpty as TVariables | undefined
  const { timeoutId, signal } = createTimeoutController(options?.signal)
  const queryString = query.toString()
  const isClient = typeof window !== 'undefined'

  try {
    const result = isClient
      ? await executeClient<TResult>(queryString, variables, signal)
      : await executeServer<TResult>(queryString, variables, signal)

    clearTimeout(timeoutId)

    if (result.errors && result.errors.length > 0) {
      handleGraphQLErrors(result)
    }

    return result
  } catch (error) {
    clearTimeout(timeoutId)
    if (isAbortError(error)) {
      throw createTimeoutError()
    }
    throw error
  }
}