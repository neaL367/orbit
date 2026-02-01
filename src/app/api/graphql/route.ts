import crypto from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { fetchGraphQLServer, getAniListRateLimit, canMakeAniListRequest } from '@/lib/graphql'
import type { AniListRateLimit } from '@/lib/graphql/server'

/**
 * GraphQL API Route Handler
 * 
 * Features:
 * - Request deduplication: Identical queries executed once per batch
 * - Rate limiting: Per-IP and global AniList rate limit tracking
 * - AniList API integration: Respects AniList rate limits (currently 30/min in degraded state)
 * 
 * NOTE: AniList API is currently in degraded state with 30 requests/minute limit (temporary).
 * The actual limit is tracked from response headers and will auto-adjust when restored.
 * 
 * Request Flow:
 * 1. Client Component → executeClientGraphQL(query, variables)
 * 2. GraphQLBatcher → Batches requests (max 10, 50ms delay)
 * 3. POST /api/graphql → Receives batched requests
 * 4. Rate Limiting → Early checks (before parsing body) per-IP (25/min) and AniList global (30/min)
 * 5. Parse & Validate → Single pass with inline validation
 * 6. Deduplication → Single pass grouping of identical queries by cache key
 * 7. Cache Separation → Separate cached, pending, and new requests
 * 8. Parallel Execution → Execute only new requests in parallel, await pending promises
 * 9. fetchGraphQLServer → Executes queries with Next.js caching
 * 10. AniList API → Returns results
 * 11. Result Mapping → Single pass mapping back to original request order
 * 12. Async Cleanup → Non-blocking cache cleanup
 * 13. Response → Returns with rate limit headers
 * 
 * Response includes rate limit headers:
 * - X-RateLimit-*: Client rate limit info
 * - X-AniList-RateLimit-*: AniList API rate limit info
 * - X-Execution-Time: Request processing time
 * - X-Deduplicated-Queries: Number of queries deduplicated
 */

// ============================================================================
// Request Deduplication
// ============================================================================

type CachedRequest = {
  result: unknown
  timestamp: number
  promise?: Promise<unknown>
}

const requestCache = new Map<string, CachedRequest>()
const DEDUPLICATION_CACHE_TTL = 1000

function generateCacheKey(query: string, variables?: unknown): string {
  const key = JSON.stringify({ query, variables })
  return crypto.createHash('sha256').update(key).digest('hex')
}

function cleanupCache() {
  const now = Date.now()
  const maxAge = DEDUPLICATION_CACHE_TTL * 10
  for (const [key, value] of requestCache.entries()) {
    if (now - value.timestamp > maxAge) {
      requestCache.delete(key)
    }
  }
}

// ============================================================================
// Rate Limiting
// ============================================================================

type RateLimitRecord = {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitRecord>()
// Client rate limit: Set below AniList's current degraded limit (30/min)
// AniList is currently in degraded state with 30 requests/minute (temporary)
const RATE_LIMIT_MAX = 25
const RATE_LIMIT_WINDOW = 60000

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  return forwarded?.split(',')[0] || realIP || 'unknown'
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    }
    rateLimitMap.set(ip, newRecord)
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX - 1,
      resetTime: newRecord.resetTime,
    }
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    }
  }

  record.count++
  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX - record.count,
    resetTime: record.resetTime,
  }
}

function cleanupRateLimits() {
  const now = Date.now()
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip)
    }
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function has429Error(result: unknown): boolean {
  if (!result || typeof result !== 'object') return false
  if (!('errors' in result) || !Array.isArray(result.errors)) return false
  
  return result.errors.some((e) => {
    return typeof e === 'object' && e !== null && 'status' in e && (e as { status?: number }).status === 429
  })
}

function create429Response(rateLimit: AniListRateLimit, isAniList: boolean) {
  const retryAfter = Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': rateLimit.limit.toString(),
    'X-RateLimit-Remaining': '0',
    'X-RateLimit-Reset': Math.floor(rateLimit.resetTime / 1000).toString(),
    'Retry-After': Math.max(retryAfter, 0).toString(),
  }
  
  if (isAniList) {
    headers['X-AniList-RateLimit'] = 'true'
  }

  return NextResponse.json(
    {
      data: null,
      errors: [{ message: 'Too Many Requests.', status: 429 }],
    },
    { status: 429, headers }
  )
}

// ============================================================================
// API Route Handler
// ============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const ip = getClientIP(request)

  try {
    // Early rate limit checks (before parsing body)
    if (!canMakeAniListRequest()) {
      return create429Response(getAniListRateLimit(), true)
    }

    const rateLimit = checkRateLimit(ip)
    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many requests. Please try again after ${new Date(rateLimit.resetTime).toISOString()}`,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
            'Retry-After': retryAfter.toString(),
          },
        }
      )
    }

    // Parse and validate in single pass
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const isBatch = Array.isArray(body)
    const requestsArray: Array<{ query: string; variables?: unknown }> = isBatch 
      ? (body as Array<{ query: string; variables?: unknown }>)
      : [body as { query: string; variables?: unknown }]

    if (requestsArray.length === 0) {
      return NextResponse.json({ error: 'At least one query is required' }, { status: 400 })
    }

    // Optimized deduplication: single pass with validation
    const now = Date.now()
    const cacheKeyToIndices = new Map<string, number[]>()
    const uniqueRequests: Array<{
      query: string
      variables?: unknown
      cacheKey: string
      indices: number[]
    }> = []

    for (let index = 0; index < requestsArray.length; index++) {
      const req = requestsArray[index]
      
      // Validate while processing
      if (!req || typeof req !== 'object' || !('query' in req) || typeof req.query !== 'string') {
        return NextResponse.json({ error: 'Valid query string is required' }, { status: 400 })
      }

      const cacheKey = generateCacheKey(req.query, req.variables)
      const existingIndices = cacheKeyToIndices.get(cacheKey)
      
      if (existingIndices) {
        existingIndices.push(index)
      } else {
        cacheKeyToIndices.set(cacheKey, [index])
        uniqueRequests.push({
          query: req.query,
          variables: req.variables,
          cacheKey,
          indices: [index],
        })
      }
    }

    // Update indices for all unique requests
    for (const req of uniqueRequests) {
      req.indices = cacheKeyToIndices.get(req.cacheKey)!
    }

    // Separate cached and new requests for parallel execution
    const cachedResults = new Map<string, unknown>()
    const newRequests: typeof uniqueRequests = []
    const pendingPromises = new Map<string, Promise<unknown>>()

    for (const req of uniqueRequests) {
      const cached = requestCache.get(req.cacheKey)
      
      if (cached && now - cached.timestamp < DEDUPLICATION_CACHE_TTL) {
        // Cache hit
        cachedResults.set(req.cacheKey, cached.result)
      } else if (cached?.promise) {
        // Pending request - wait for it
        pendingPromises.set(req.cacheKey, cached.promise)
      } else {
        // New request
        newRequests.push(req)
      }
    }

    // Wait for pending promises
    for (const [cacheKey, promise] of pendingPromises) {
      try {
        const result = await promise
        cachedResults.set(cacheKey, result)
        // Update cache with result if not already updated
        const cached = requestCache.get(cacheKey)
        if (cached && !cached.result) {
          requestCache.set(cacheKey, {
            result,
            timestamp: Date.now(),
          })
        }
      } catch {
        // Error handled in original promise, remove from cache
        requestCache.delete(cacheKey)
      }
    }

    // Execute new requests in parallel
    const executionPromises = newRequests.map(async ({ query, variables, cacheKey }) => {
      const promise = fetchGraphQLServer(query, variables).catch((error) => {
        requestCache.delete(cacheKey)
        return {
          data: null,
          errors: [{
            message: error instanceof Error ? error.message : 'Unknown error',
          }],
        }
      })

      // Cache promise immediately for concurrent requests
      requestCache.set(cacheKey, {
        result: null as unknown,
        timestamp: now,
        promise,
      })

      const result = await promise

      // Update cache with result
      requestCache.set(cacheKey, {
        result,
        timestamp: Date.now(),
      })

      return { cacheKey, result }
    })

    const executionResults = await Promise.all(executionPromises)

    // Build result map (cached + newly executed)
    const resultMap = new Map<string, unknown>()
    for (const [key, value] of cachedResults) {
      resultMap.set(key, value)
    }
    for (const { cacheKey, result } of executionResults) {
      resultMap.set(cacheKey, result)
    }

    // Map results to original request order (single pass)
    const requestsCount = requestsArray.length
    const responses: unknown[] = new Array(requestsCount)
    for (const { cacheKey, indices } of uniqueRequests) {
      const result = resultMap.get(cacheKey) ?? {
        data: null,
        errors: [{ message: 'Query execution failed' }],
      }
      for (const index of indices) {
        responses[index] = result
      }
    }

    // Async cleanup (don't block response)
    if (requestCache.size > 1000) {
      setImmediate(() => cleanupCache())
    }
    if (rateLimitMap.size > 10000) {
      setImmediate(() => cleanupRateLimits())
    }

    // Build response headers
    const executionTime = Date.now() - startTime
    const deduplicatedCount = requestsCount - uniqueRequests.length
    const currentAnilistRateLimit = getAniListRateLimit()
    const hasAniList429 = executionResults.some(({ result }) => has429Error(result))

    const responseHeaders: Record<string, string> = {
      'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(),
      'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      'X-RateLimit-Reset': rateLimit.resetTime.toString(),
      'X-AniList-RateLimit-Limit': currentAnilistRateLimit.limit.toString(),
      'X-AniList-RateLimit-Remaining': currentAnilistRateLimit.remaining.toString(),
      'X-AniList-RateLimit-Reset': Math.floor(currentAnilistRateLimit.resetTime / 1000).toString(),
      'X-Execution-Time': `${executionTime}ms`,
      'X-Deduplicated-Queries': deduplicatedCount.toString(),
      'X-Total-Queries': requestsCount.toString(),
      'X-Unique-Queries': uniqueRequests.length.toString(),
    }

    if (hasAniList429 || currentAnilistRateLimit.remaining === 0) {
      const retryAfter = Math.ceil((currentAnilistRateLimit.resetTime - Date.now()) / 1000)
      if (retryAfter > 0) {
        responseHeaders['Retry-After'] = retryAfter.toString()
      }
    }

    return NextResponse.json(isBatch ? responses : responses[0], { headers: responseHeaders })
  } catch (error) {
    console.error('GraphQL API route error:', error)
    return NextResponse.json(
      {
        data: null,
        errors: [{
          message: error instanceof Error ? error.message : 'Internal server error',
        }],
      },
      { status: 500 }
    )
  }
}
