import { NextRequest, NextResponse } from 'next/server'
import { fetchGraphQLServer } from '@/lib/graphql'

/**
 * GraphQL API Route Handler
 * 
 * Purpose: Proxy for client-side GraphQL requests
 * - Client components can't directly call external APIs (CORS)
 * - Client-side batcher sends batched requests here
 * - This route uses fetchGraphQLServer which handles caching automatically
 * 
 * Flow: Client Component → executeClientGraphQL → /api/graphql → fetchGraphQLServer → AniList API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Support both single query and batch queries
    const isBatch = Array.isArray(body)
    const requests = isBatch ? body : [body]

    if (requests.length === 0) {
      return NextResponse.json(
        { error: 'At least one query is required' },
        { status: 400 }
      )
    }

    // Validate all requests
    for (const req of requests) {
      if (!req.query || typeof req.query !== 'string') {
        return NextResponse.json(
          { error: 'Valid query string is required for all requests' },
          { status: 400 }
        )
      }
    }

    // Execute all queries in parallel with automatic cache configuration
    const responses = await Promise.all(
      requests.map(async (req) => {
        try {
          const result = await fetchGraphQLServer(req.query, req.variables)
          // Ensure GraphQL ExecutionResult format (data may be undefined/null, errors may be present)
          return result
        } catch (error) {
          // Return error response in GraphQL ExecutionResult format for individual query in batch
          return {
            data: null,
            errors: [{
              message: error instanceof Error ? error.message : 'Unknown error'
            }]
          }
        }
      })
    )

    // Return batch response as array if batch request, otherwise single response
    return NextResponse.json(isBatch ? responses : responses[0])
  } catch (error) {
    console.error('GraphQL API route error:', error)
    // Return error in GraphQL ExecutionResult format
    return NextResponse.json(
      { 
        data: null,
        errors: [{
          message: error instanceof Error ? error.message : 'Internal server error'
        }]
      },
      { status: 500 }
    )
  }
}