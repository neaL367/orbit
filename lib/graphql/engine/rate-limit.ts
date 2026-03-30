/**
 * AniList Rate Limit Tracking
 */

export type AniListRateLimit = {
    limit: number
    remaining: number
    resetTime: number
    lastUpdated: number
}

// Global AniList rate limit tracker (shared across all requests)
// NOTE: AniList API is currently in degraded state: 30 requests/minute (temporary)
let anilistRateLimit: AniListRateLimit = {
    limit: 30,
    remaining: 30,
    resetTime: Date.now() + 60000,
    lastUpdated: Date.now(),
}

export function updateAniListRateLimit(headers: Headers): void {
    const limit = headers.get('x-ratelimit-limit')
    const remaining = headers.get('x-ratelimit-remaining')
    const reset = headers.get('x-ratelimit-reset')

    if (limit) anilistRateLimit.limit = parseInt(limit, 10)
    if (remaining !== null) anilistRateLimit.remaining = parseInt(remaining, 10)
    if (reset) anilistRateLimit.resetTime = parseInt(reset, 10) * 1000
    anilistRateLimit.lastUpdated = Date.now()
}

export function getAniListRateLimit(): AniListRateLimit {
    const now = Date.now()

    if (now > anilistRateLimit.resetTime) {
        anilistRateLimit = {
            limit: 30,
            remaining: 30,
            resetTime: now + 60000,
            lastUpdated: now,
        }
    }

    return { ...anilistRateLimit }
}

export function canMakeAniListRequest(): boolean {
    return getAniListRateLimit().remaining > 0
}

export function setRateLimitExceeded(resetSeconds?: string | null): void {
    anilistRateLimit.remaining = 0
    if (resetSeconds) {
        anilistRateLimit.resetTime = parseInt(resetSeconds, 10) * 1000
    }
}
