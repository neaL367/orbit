import type { ExecutionResult } from 'graphql'
import type { TypedDocumentString } from '@/lib/graphql/types/graphql'
import { GRAPHQL_TIMEOUT } from '@/lib/constants'
import { handleGraphQLErrors, isAbortError, createTimeoutError } from './errors'
import { executeClientGraphQL } from './client'
import { executeServerGraphQL } from './server'

/**
 * Creates an abort signal with timeout that composes with an optional external signal
 * Works in both browser and Node.js environments
 */
function createAbortSignalWithTimeout(
  externalSignal?: AbortSignal
): { signal: AbortSignal; cleanup: () => void } {
  const controller = new AbortController()
  // setTimeout returns number in browser, NodeJS.Timeout in Node.js
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  // Set up timeout
  timeoutId = setTimeout(() => {
    controller.abort()
  }, GRAPHQL_TIMEOUT)

  // Compose with external signal if provided
  if (externalSignal) {
    // If external signal is already aborted, abort immediately
    if (externalSignal.aborted) {
      controller.abort()
      clearTimeout(timeoutId)
      return { signal: controller.signal, cleanup: () => {} }
    }

    // Listen to external signal and abort controller when it's aborted
    const abortHandler = () => {
      controller.abort()
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
      }
    }
    externalSignal.addEventListener('abort', abortHandler)

    return {
      signal: controller.signal,
      cleanup: () => {
        if (timeoutId !== null) {
          clearTimeout(timeoutId)
        }
        externalSignal.removeEventListener('abort', abortHandler)
      },
    }
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
      }
    },
  }
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
  const queryString = query.toString()
  const isClient = typeof window !== 'undefined'

  // Create abort signal with timeout
  const { signal, cleanup } = createAbortSignalWithTimeout(options?.signal)

  try {
    // Execute query (client uses batcher, server uses direct fetch)
    const result = isClient
      ? await executeClientGraphQL<TResult>(queryString, variables, signal)
      : await executeServerGraphQL<TResult>(queryString, variables, signal)

    cleanup()

    // Handle GraphQL errors
    if (result.errors && result.errors.length > 0) {
      handleGraphQLErrors(result)
    }

    return result
  } catch (error) {
    cleanup()

    // Handle abort/timeout errors
    if (isAbortError(error) || signal.aborted) {
      throw createTimeoutError()
    }

    throw error
  }
}
