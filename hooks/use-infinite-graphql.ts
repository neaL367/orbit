import { useInfiniteQuery } from '@tanstack/react-query'
import type { TypedDocumentString } from '@/graphql/graphql'
import { execute } from '@/graphql/execute'

// Helper to extract query name from GraphQL query string
function getQueryName(queryString: string): string {
  const match = queryString.match(/(?:query|mutation|subscription)\s+(\w+)/)
  return match ? match[1] : 'unknown'
}

export function useInfiniteGraphQL<TResult, TVariables extends Record<string, unknown> & { page?: number; perPage?: number }>(
  document: TypedDocumentString<TResult, TVariables>,
  baseVariables: Omit<TVariables, 'page'>,
  options?: {
    enabled?: boolean
    staleTime?: number
    retry?: number | boolean
  }
) {
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
    getNextPageParam: (lastPage) => {
      const pageData = lastPage as { Page?: { pageInfo?: { hasNextPage?: boolean; currentPage?: number } } } | undefined
      const pageInfo = pageData?.Page?.pageInfo
      if (pageInfo?.hasNextPage && pageInfo.currentPage) {
        return { page: pageInfo.currentPage + 1 }
      }
      return undefined
    },
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: options?.retry ?? 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  })
}

