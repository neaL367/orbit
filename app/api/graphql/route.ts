import { NextRequest, NextResponse } from 'next/server'
import { fetchGraphQLServer } from '@/lib/graphql'

/**
 * GraphQL API Route Handler
 * 
 * Purpose: Proxy for client-side GraphQL requests
 * - Client components can't directly call external APIs (CORS)
 * - Client-side batcher sends batched requests here
 * - This route then uses the shared fetchGraphQLServer function
 * 
 * Flow: Client Component → batchGraphQLRequest → /api/graphql → fetchGraphQLServer → AniList API
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
      if (!req.query) {
        return NextResponse.json(
          { error: 'Query is required for all requests' },
          { status: 400 }
        )
      }
    }

    // Use the shared fetchGraphQLServer function
    // This ensures consistent caching behavior across server and client requests
    const responses = await Promise.all(
      requests.map(async (req) => {
        return fetchGraphQLServer(req.query, req.variables)
      })
    )

    // Return batch response as array if batch request, otherwise single response
    return NextResponse.json(isBatch ? responses : responses[0])
  } catch (error) {
    console.error('GraphQL proxy error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}