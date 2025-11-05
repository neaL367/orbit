import type { ExecutionResult } from 'graphql'
import type { TypedDocumentString } from './graphql'

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
  const variables = variablesOrEmpty
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
  
  // Use provided signal or create a new one
  const signal = options?.signal || controller.signal
  
  // If external signal is provided, abort our timeout controller when external signal aborts
  if (options?.signal) {
    options.signal.addEventListener('abort', () => {
      clearTimeout(timeoutId)
    })
  }
  
  const vars = variables as TVariables | undefined

  try {
    const response = await fetch('https://graphql.anilist.co/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        query: query.toString(),
        variables: vars || undefined
      }),
      signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`)
    }

    const result = await response.json() as ExecutionResult<TResult>
    
    if (result.errors && result.errors.length > 0) {
      // Handle rate limiting specifically
      const rateLimitError = result.errors.find((e) => 
        e.message?.toLowerCase().includes('rate limit') || 
        e.message?.toLowerCase().includes('too many requests')
      )
      if (rateLimitError) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.')
      }
      throw new Error(result.errors.map((e) => e.message).join(', '))
    }
   
    return result
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout. Please try again.')
    }
    throw error
  }
}