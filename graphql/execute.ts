import type { ExecutionResult } from 'graphql'
import type { TypedDocumentString } from './graphql'
 
export async function execute<TResult, TVariables>(
  query: TypedDocumentString<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
): Promise<ExecutionResult<TResult>> {
  const response = await fetch('https://graphql.anilist.co/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      query: query.toString(),
      variables: variables || undefined
    })
  })
 
  if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`)
  }
 
  const result = await response.json() as ExecutionResult<TResult>
  
  if (result.errors && result.errors.length > 0) {
    throw new Error(result.errors.map((e) => e.message).join(', '))
  }
 
  return result
}