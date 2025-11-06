/**
 * Application constants
 * Centralized constants for reuse across the application
 */

/**
 * AniList GraphQL API endpoint
 */
export const ANILIST_API_URL = 'https://graphql.anilist.co/'

/**
 * Cache and revalidation constants
 */
export const CACHE_TIMES = {
  /** 10 minutes in seconds */
  SHORT: 600,
  /** 5 minutes in milliseconds */
  MEDIUM: 5 * 60 * 1000,
  /** 10 minutes in milliseconds */
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

