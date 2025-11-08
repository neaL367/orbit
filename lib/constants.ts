/**
 * Application constants
 * Centralized constants for reuse across the application
 */

/**
 * AniList GraphQL API endpoint
 */
export const ANILIST_API_URL = 'https://graphql.anilist.co/'

/**
 * GitHub repository URL
 */
export const GITHUB_REPO_URL = 'https://github.com/neaL367/orbit'

/**
 * Cache and revalidation constants (in milliseconds)
 */
export const CACHE_TIMES = {
  /** 5 minutes */
  MEDIUM: 5 * 60 * 1000,
  /** 10 minutes */
  LONG: 10 * 60 * 1000,
} as const

/**
 * GraphQL request timeout (30 seconds)
 */
export const GRAPHQL_TIMEOUT = 30000

/**
 * GraphQL batcher configuration
 */
export const GRAPHQL_BATCHER = {
  /** Batch delay in milliseconds */
  DELAY: 50,
  /** Maximum requests per batch */
  MAX_SIZE: 10,
} as const


export const CACHE_TAGS = {
  // Query types
  ANIME_DETAIL: 'anime-detail',
  ANIME_LIST: 'anime-list',
  ANIME_SEARCH: 'anime-search',
  ANIME_SCHEDULE: 'anime-schedule',
  ANIME_UPCOMING: 'anime-upcoming',
  
  // Specific queries
  TRENDING: 'anime-trending',
  POPULAR: 'anime-popular',
  TOP_RATED: 'anime-top-rated',
  SEASONAL: 'anime-seasonal',
  
  // Dynamic tags
  animeById: (id: number) => `anime-${id}`,
  animeBySeason: (season: string, year: number) => `anime-season-${season}-${year}`,
} as const