/**
 * GraphQL error handling utilities
 */

import type { ExecutionResult } from 'graphql'

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

