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
  const month = date.month ? String(date.month).padStart(2, '0') : '01'
  const day = date.day ? String(date.day).padStart(2, '0') : '01'
  return `${year}-${month}-${day}`
}

/**
 * Format seconds until airing to human-readable string
 */
export function formatTimeUntilAiring(seconds?: number): string | null {
  if (!seconds) return null
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (days > 0) {
    return `${days}d ${hours}h`
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

/**
 * Format time until airing with detailed breakdown (for carousels)
 */
export function formatTimeUntilAiringDetailed(seconds?: number): {
  days: number
  hours: number
  minutes: number
} {
  if (!seconds) return { days: 0, hours: 0, minutes: 0 }
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return { days, hours, minutes }
}

