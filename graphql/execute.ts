import type { ExecutionResult } from 'graphql'
import type { TypedDocumentString } from './graphql'

// Lazy batcher import - only loads when actually needed (prevents preload warning)
// Using a function that creates the import at runtime to prevent Next.js from preloading
let batcherModule: typeof import('@/lib/graphql-batcher') | null = null
let batcherPromise: Promise<typeof import('@/lib/graphql-batcher')> | null = null

const getBatcher = async () => {
  // Return cached module if already loaded
  if (batcherModule) {
    return batcherModule
  }
  
  // Return existing promise if already loading
  if (batcherPromise) {
    batcherModule = await batcherPromise
    return batcherModule
  }
  
  // Create new import promise - using dynamic import with webpack magic comments
  // This prevents Next.js from preloading the chunk
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - dynamic import to prevent preloading
  batcherPromise = import(
    /* webpackChunkName: "graphql-batcher" */
    /* webpackMode: "lazy" */
    /* webpackPrefetch: false */
    '@/lib/graphql-batcher'
  )
  batcherModule = await batcherPromise
  return batcherModule
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
    // Use batching for client-side requests to reduce network requests
    const isClient = typeof window !== 'undefined'
    
    if (isClient) {
      // Lazy load batcher only when needed (prevents preload warning)
      const batcher = await getBatcher()
      const result = await batcher.batchGraphQLRequest(query.toString(), vars, signal)
      return result as ExecutionResult<TResult>
    }
    
    // Server-side: call AniList API directly (no CORS)
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