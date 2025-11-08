import { format, intervalToDuration } from 'date-fns'
import type { Media } from '@/graphql/graphql'

/**
 * Extract the best available title from a Media object
 */
export function getAnimeTitle(anime: Media | null | undefined): string {
  if (!anime) return 'Unknown'
  return (
    anime.title?.userPreferred ||
    anime.title?.romaji ||
    anime.title?.english ||
    'Unknown'
  )
}

/**
 * Extract subtitle (English title if different from main title)
 */
export function getAnimeSubtitle(anime: Media | null | undefined): string | undefined {
  if (!anime) return undefined
  const title = getAnimeTitle(anime)
  const english = anime.title?.english
  return english && english !== title ? english : undefined
}

/**
 * Extract media list from GraphQL Page response
 */
export function extractMediaList(
  data: unknown
): Array<Media & { __typename?: 'Media' }> {
  const pageData = data as { Page?: { media?: Array<Media | null> } } | undefined
  return (
    pageData?.Page?.media?.filter(
      (anime: Media | null): anime is Media => anime !== null && !anime.isAdult
    ) || []
  )
}

/**
 * Convert hex color to rgba string
 */
export function hexToRgba(hex: string | null | undefined, opacity: number = 1): string {
  if (!hex || hex.length < 7) return `rgba(26, 26, 26, ${opacity})`
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

/**
 * Format date object to YYYY-MM-DD string
 */
export function formatDate(date?: {
  year?: number | null
  month?: number | null
  day?: number | null
}): string | null {
  if (!date?.year) return null
  const year = date.year
  const month = date.month ?? 1
  const day = date.day ?? 1
  const dateObj = new Date(year, month - 1, day)
  return format(dateObj, 'yyyy-MM-dd')
}

/**
 * Format seconds until airing to human-readable string
 */
export function formatTimeUntilAiring(seconds?: number): string | null {
  if (!seconds || seconds <= 0) return null
  
  const now = new Date()
  const target = new Date(now.getTime() + seconds * 1000)
  const duration = intervalToDuration({ start: now, end: target })
  
  if (duration.days && duration.days > 0) {
    return `${duration.days}d ${duration.hours || 0}h`
  }
  if (duration.hours && duration.hours > 0) {
    return `${duration.hours}h ${duration.minutes || 0}m`
  }
  return `${duration.minutes || 0}m`
}

/**
 * Format time until airing with detailed breakdown (for carousels)
 */
export function formatTimeUntilAiringDetailed(seconds?: number): {
  days: number
  hours: number
  minutes: number
  seconds: number
} {
  if (!seconds || seconds <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }
  
  const now = new Date()
  const target = new Date(now.getTime() + seconds * 1000)
  const duration = intervalToDuration({ start: now, end: target })
  
  return {
    days: duration.days ?? 0,
    hours: duration.hours ?? 0,
    minutes: duration.minutes ?? 0,
    seconds: duration.seconds ?? 0,
  }
}

