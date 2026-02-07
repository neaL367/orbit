import { format, intervalToDuration } from 'date-fns'
import type { Media } from '@/lib/graphql/types/graphql'

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

