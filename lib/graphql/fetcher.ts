import { execute } from './execute'

/**
 * Custom fetcher for graphql-codegen with react-query
 * This bridges the generated hooks with our existing execution engine
 */
export const fetcher = <TData, TVariables>(
  query: any,
  variables?: TVariables,
  headers?: RequestInit['headers']
): (() => Promise<TData>) => {
  return async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (execute as any)(query, variables, { headers })
    if (result.errors) {
      throw new Error(result.errors[0].message)
    }
    return result.data as TData
  }
}
