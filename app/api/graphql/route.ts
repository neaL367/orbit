import { NextRequest, NextResponse } from 'next/server'

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

    const responses = await Promise.all(
      requests.map(async (req) => {
        const response = await fetch('https://graphql.anilist.co/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            query: req.query,
            variables: req.variables || undefined,
          }),
        })

        if (!response.ok) {
          throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`)
        }

        return response.json()
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

