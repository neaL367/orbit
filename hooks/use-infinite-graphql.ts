import { useInfiniteQuery } from '@tanstack/react-query'
import type { ExecutionResult } from 'graphql'
import type { TypedDocumentString } from '@/graphql/graphql'
import { execute } from '@/graphql/execute'

// Helper to extract query name from GraphQL query string
function getQueryName(queryString: string): string {
  const match = queryString.match(/(?:query|mutation|subscription)\s+(\w+)/)
  return match ? match[1] : 'unknown'
}

export function useInfiniteGraphQL<TResult, TVariables extends Record<string, unknown> & { page?: number; perPage?: number }>(
  document: TypedDocumentString<TResult, TVariables>,
  baseVariables: Omit<TVariables, 'page'>
) {
  const queryString = document.toString()
  const queryName = getQueryName(queryString)
  
  return useInfiniteQuery({
    queryKey: [queryName, baseVariables],
    queryFn: async ({ pageParam = { page: 1 } }) => {
      const variables = { ...baseVariables, page: pageParam.page } as TVariables
      const result = await (execute as (doc: typeof document, vars: TVariables) => Promise<ExecutionResult<TResult>>)(document, variables)
      return result.data as TResult
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
  })
}

