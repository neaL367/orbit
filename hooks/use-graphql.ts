import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import type { ExecutionResult } from 'graphql'
import type { TypedDocumentString } from '@/graphql/graphql'
import { execute } from '@/graphql/execute'

// Helper to extract query name from GraphQL query string
function getQueryName(queryString: string): string {
  const match = queryString.match(/(?:query|mutation|subscription)\s+(\w+)/)
  return match ? match[1] : 'unknown'
}

export function useGraphQL<TResult, TVariables>(
  document: TypedDocumentString<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
): UseQueryResult<TResult>
export function useGraphQL<TResult, TVariables>(
  document: TypedDocumentString<TResult, TVariables>,
  variables: TVariables,
  options: {
    staleTime?: number
    retry?: number | boolean
    enabled?: boolean
  }
): UseQueryResult<TResult>
export function useGraphQL<TResult, TVariables>(
  document: TypedDocumentString<TResult, TVariables>,
  variablesOrOptions?: TVariables | { staleTime?: number; retry?: number | boolean; enabled?: boolean },
  options?: { staleTime?: number; retry?: number | boolean; enabled?: boolean }
): UseQueryResult<TResult> {
  const queryString = document.toString()
  const queryName = getQueryName(queryString)
  
  // Determine if second param is options or variables
  let variables: TVariables | undefined
  let queryOptions: { staleTime?: number; retry?: number | boolean; enabled?: boolean } | undefined
  
  if (options !== undefined) {
    // Second param is variables, third is options
    variables = variablesOrOptions as TVariables
    queryOptions = options
  } else if (variablesOrOptions && typeof variablesOrOptions === 'object' && ('staleTime' in variablesOrOptions || 'retry' in variablesOrOptions || 'enabled' in variablesOrOptions)) {
    // Second param is options (variables is undefined/empty)
    variables = undefined
    queryOptions = variablesOrOptions as { staleTime?: number; retry?: number | boolean; enabled?: boolean }
  } else {
    // Second param is variables
    variables = variablesOrOptions as TVariables | undefined
    queryOptions = undefined
  }
  
  return useQuery({
    queryKey: [queryName, variables],
    queryFn: async ({ signal }) => {
      try {
        // Type-safe call to execute - handle conditional type properly
        let result: ExecutionResult<TResult>
        if (variables !== undefined) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          result = await (execute as any)(document, variables, { signal })
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          result = await (execute as any)(document, undefined, { signal })
        }
        return result.data as TResult
      } catch (error) {
        // Check if request was cancelled
        if (signal?.aborted) {
          throw new Error('Request was cancelled')
        }
        throw error
      }
    },
    enabled: queryOptions?.enabled ?? true,
    staleTime: queryOptions?.staleTime ?? 10 * 60 * 1000, // 10 minutes default (detail pages change less frequently)
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: queryOptions?.retry ?? 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  })
}

