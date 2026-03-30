/**
 * GraphQL cache configuration
 * Determines cache tags and revalidation times based on query type
 */

import { CACHE_TAGS } from '@/lib/constants'

/**
 * Extract query name from GraphQL query string
 */
export function getQueryName(queryString: string): string {
  const match = queryString.match(/(?:query|mutation|subscription)\s+(\w+)/)
  return match ? match[1] : 'unknown'
}

/**
 * Determine cache tags and revalidation time based on query type
 * Following Next.js caching best practices
 */
export function getCacheConfig(query: string, variables?: Record<string, unknown>): {
  tags: string[]
  revalidate: number
} {
  const queryName = getQueryName(query)
  const queryLower = query.toLowerCase()
  
  // Extract variables for dynamic tags
  const mediaId = variables?.id as number | undefined
  const season = variables?.season as string | undefined
  const seasonYear = variables?.seasonYear as number | undefined

  // Determine cache tags based on query type
  const tags: string[] = []
  let revalidate = 600 // Default: 10 minutes

  // Schedule queries - real-time data (revalidate every minute)
  if (queryLower.includes('airingschedule') || queryLower.includes('scheduleanime')) {
    tags.push(CACHE_TAGS.ANIME_SCHEDULE)
    revalidate = 60 // 1 minute
  }
  // Upcoming airing queries - real-time data
  else if (queryLower.includes('upcoming') || queryName.toLowerCase().includes('upcoming')) {
    tags.push(CACHE_TAGS.ANIME_UPCOMING)
    revalidate = 60 // 1 minute
  }
  // Anime detail queries - daily updates
  else if (queryLower.includes('media(id:') || queryLower.includes('animebyid') || mediaId) {
    tags.push(CACHE_TAGS.ANIME_DETAIL)
    if (mediaId) {
      tags.push(CACHE_TAGS.animeById(mediaId))
    }
    revalidate = 86400 // 1 day
  }
  // Trending queries - frequently updated (every 10 minutes)
  else if (queryLower.includes('trending') || queryName.toLowerCase().includes('trending')) {
    tags.push(CACHE_TAGS.ANIME_LIST)
    tags.push(CACHE_TAGS.TRENDING)
    revalidate = 600 // 10 minutes
  }
  // Popular queries - frequently updated (every 10 minutes)
  else if (queryLower.includes('popular') || queryName.toLowerCase().includes('popular')) {
    tags.push(CACHE_TAGS.ANIME_LIST)
    tags.push(CACHE_TAGS.POPULAR)
    revalidate = 600 // 10 minutes
  }
  // Seasonal queries - hourly updates
  else if (queryLower.includes('season') || queryName.toLowerCase().includes('seasonal')) {
    tags.push(CACHE_TAGS.ANIME_LIST)
    tags.push(CACHE_TAGS.SEASONAL)
    if (season && seasonYear) {
      tags.push(CACHE_TAGS.animeBySeason(season, seasonYear))
    }
    revalidate = 3600 // 1 hour
  }
  // Top rated queries - hourly updates
  else if (queryLower.includes('top') || queryName.toLowerCase().includes('toprated')) {
    tags.push(CACHE_TAGS.ANIME_LIST)
    tags.push(CACHE_TAGS.TOP_RATED)
    revalidate = 3600 // 1 hour
  }
  // Search queries - frequently updated (every 10 minutes)
  else if (queryLower.includes('search') || queryName.toLowerCase().includes('search')) {
    tags.push(CACHE_TAGS.ANIME_LIST)
    tags.push(CACHE_TAGS.ANIME_SEARCH)
    revalidate = 600 // 10 minutes
  }
  // Default - general anime list
  else {
    tags.push(CACHE_TAGS.ANIME_LIST)
    revalidate = 600 // 10 minutes
  }

  return { tags, revalidate }
}

