/**
 * Unified GraphQL hook for both regular and infinite queries
 * Consolidates useGraphQL and useInfiniteGraphQL into one hook
 */

import { useQuery, useInfiniteQuery, type UseQueryResult, type UseInfiniteQueryResult } from '@tanstack/react-query'
import type { ExecutionResult } from 'graphql'
import type { TypedDocumentString } from '@/lib/graphql/types/graphql'
import { execute } from './execute'
import { CACHE_TIMES } from '@/lib/constants'
import { getQueryName } from './cache'

// ============================================================================
// Types
// ============================================================================

type QueryOptions = {
  staleTime?: number
  retry?: number | boolean
  enabled?: boolean
}

type InfiniteQueryOptions = QueryOptions & {
  getNextPageParam?: (lastPage: unknown) => { page: number } | undefined
}

// ============================================================================
// Regular Query Hook
// ============================================================================

/**
 * Parse useGraphQL parameters to determine if second param is variables or options
 */
function parseUseGraphQLParams<TVariables>(
  variablesOrOptions?: TVariables | QueryOptions,
  options?: QueryOptions
): { variables?: TVariables; queryOptions?: QueryOptions } {
  if (options !== undefined) {
    return {
      variables: variablesOrOptions as TVariables,
      queryOptions: options,
    }
  }

  if (
    variablesOrOptions &&
    typeof variablesOrOptions === 'object' &&
    ('staleTime' in variablesOrOptions || 'retry' in variablesOrOptions || 'enabled' in variablesOrOptions)
  ) {
    return {
      variables: undefined,
      queryOptions: variablesOrOptions as QueryOptions,
    }
  }

  return {
    variables: variablesOrOptions as TVariables | undefined,
    queryOptions: undefined,
  }
}

/**
 * Regular GraphQL query hook
 */
export function useGraphQL<TResult, TVariables>(
  document: TypedDocumentString<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
): UseQueryResult<TResult>
export function useGraphQL<TResult, TVariables>(
  document: TypedDocumentString<TResult, TVariables>,
  variables: TVariables,
  options: QueryOptions
): UseQueryResult<TResult>
export function useGraphQL<TResult, TVariables>(
  document: TypedDocumentString<TResult, TVariables>,
  variablesOrOptions?: TVariables | QueryOptions,
  options?: QueryOptions
): UseQueryResult<TResult> {
  const queryString = document.toString()
  const queryName = getQueryName(queryString)
  const { variables, queryOptions } = parseUseGraphQLParams(variablesOrOptions, options)

  return useQuery({
    queryKey: [queryName, variables],
    queryFn: async ({ signal }) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (execute as any)(
          document,
          variables,
          { signal }
        ) as ExecutionResult<TResult>
        return result.data as TResult
      } catch (error) {
        if (signal?.aborted) {
          throw new Error('Request was cancelled')
        }
        throw error
      }
    },
    enabled: queryOptions?.enabled ?? true,
    staleTime: queryOptions?.staleTime ?? CACHE_TIMES.LONG,
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: queryOptions?.retry ?? 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

// ============================================================================
// Infinite Query Hook
// ============================================================================

/**
 * Infinite GraphQL query hook
 */
export function useInfiniteGraphQL<TResult, TVariables extends Record<string, unknown> & { page?: number; perPage?: number }>(
  document: TypedDocumentString<TResult, TVariables>,
  baseVariables: Omit<TVariables, 'page'>,
  options?: InfiniteQueryOptions
): UseInfiniteQueryResult<TResult> {
  const queryString = document.toString()
  const queryName = getQueryName(queryString)
  
  return useInfiniteQuery({
    queryKey: [queryName, baseVariables],
    queryFn: async ({ pageParam = { page: 1 }, signal }) => {
      const variables = { ...baseVariables, page: pageParam.page } as TVariables
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (execute as any)(document, variables, { signal })
        return result.data as TResult
      } catch (error) {
        // Check if request was cancelled
        if (signal?.aborted) {
          throw new Error('Request was cancelled')
        }
        throw error
      }
    },
    initialPageParam: { page: 1 },
    getNextPageParam: options?.getNextPageParam || ((lastPage) => {
      const pageData = lastPage as { Page?: { pageInfo?: { hasNextPage?: boolean; currentPage?: number } } } | undefined
      const pageInfo = pageData?.Page?.pageInfo
      if (pageInfo?.hasNextPage && pageInfo.currentPage) {
        return { page: pageInfo.currentPage + 1 }
      }
      return undefined
    }),
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? CACHE_TIMES.MEDIUM, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: options?.retry ?? 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  })
}
