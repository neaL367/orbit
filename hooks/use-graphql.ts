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
): UseQueryResult<TResult> {
  const queryString = document.toString()
  const queryName = getQueryName(queryString)
  
  return useQuery({
    queryKey: [queryName, variables],
    queryFn: async () => {
      // Type-safe call to execute - handle conditional type properly
      // Use type assertion to work around TypeScript's conditional type limitations
      const result = variables !== undefined
        ? await (execute as (doc: typeof document, vars: TVariables) => Promise<ExecutionResult<TResult>>)(document, variables)
        : await (execute as (doc: typeof document) => Promise<ExecutionResult<TResult>>)(document)
      return result.data as TResult
    },
  })
}

