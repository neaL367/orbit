import { AnilistResponse, GenreResponse, MediaResponse, PageResponse } from "@/types"

// GraphQL endpoint for AniList API
const ANILIST_API = "https://graphql.anilist.co" as const

// Define a type for GraphQL variables with stricter typing
type GraphQLVariables = Record<string, string | number | boolean | null | undefined>

// Shared query fields to reduce repetition
const BASE_MEDIA_FIELDS = `
  id
  title {
    romaji
    english
    native
  }
  description
  coverImage {
    large
    medium
  }
  bannerImage
  format
  episodes
  duration
  status
  genres
  averageScore
  popularity
  season
  seasonYear
`

// Centralized error handling and fetch configuration
async function apiRequest<T>(
  query: string, 
  variables: GraphQLVariables = {},
  options: RequestInit = {}
): Promise<AnilistResponse<T>> {
  try {
    const response = await fetch(ANILIST_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 3600 }, // 1-hour cache
      ...options
    })

    if (!response.ok) {
      throw new Error(`AniList API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json() as AnilistResponse<T>
    
    // Basic validation
    if (!data || !data.data) {
      throw new Error("Invalid API response")
    }

    return data
  } catch (error) {
    console.error("AniList API request failed:", error)
    throw error
  }
}

// Pagination helper type
interface PaginationParams {
  page?: number
  perPage?: number
}

export const AnilistQueries = {
  // Trending anime with more robust typing
  async getTrending({ 
    page = 1, 
    perPage = 20 
  }: PaginationParams = {}): Promise<AnilistResponse<PageResponse>> {
    const query = `
      query ($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
            perPage
          }
          media(sort: TRENDING_DESC, type: ANIME) {
            ${BASE_MEDIA_FIELDS}
          }
        }
      }
    `
    return apiRequest<PageResponse>(query, { page, perPage })
  },

  // Popular anime with consistent structure
  async getPopular({ 
    page = 1, 
    perPage = 20 
  }: PaginationParams = {}): Promise<AnilistResponse<PageResponse>> {
    const query = `
      query ($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
            perPage
          }
          media(sort: POPULARITY_DESC, type: ANIME) {
            ${BASE_MEDIA_FIELDS}
          }
        }
      }
    `
    return apiRequest<PageResponse>(query, { page, perPage })
  },

  // Seasonal anime with type-safe parameters
  async getSeasonal({ 
    season, 
    year, 
    page = 1, 
    perPage = 20 
  }: {
    season: string, 
    year: number
  } & PaginationParams): Promise<AnilistResponse<PageResponse>> {
    const query = `
      query ($page: Int, $perPage: Int, $season: MediaSeason, $seasonYear: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
            perPage
          }
          media(season: $season, seasonYear: $seasonYear, type: ANIME, sort: POPULARITY_DESC) {
            ${BASE_MEDIA_FIELDS}
          }
        }
      }
    `
    return apiRequest<PageResponse>(query, { 
      page, 
      perPage, 
      season: season.toUpperCase(), 
      seasonYear: year 
    })
  },

  // Search with improved type safety
  async search({ 
    query: searchTerm, 
    page = 1, 
    perPage = 20 
  }: { 
    query: string 
  } & PaginationParams): Promise<AnilistResponse<PageResponse>> {
    const searchQuery = `
      query ($page: Int, $perPage: Int, $search: String) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
            perPage
          }
          media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
            ${BASE_MEDIA_FIELDS}
          }
        }
      }
    `
    return apiRequest<PageResponse>(searchQuery, { page, perPage, search: searchTerm })
  },

  // Detailed anime by ID with comprehensive data
  async getById(id: number): Promise<AnilistResponse<MediaResponse>> {
    const query = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          ${BASE_MEDIA_FIELDS}
          tags {
            id
            name
            category
          }
          startDate {
            year
            month
            day
          }
          endDate {
            year
            month
            day
          }
          studios {
            nodes {
              id
              name
            }
          }
          characters(sort: ROLE, role: MAIN, page: 1, perPage: 8) {
            nodes {
              id
              name {
                full
              }
              image {
                medium
                large
              }
              gender
              age
            }
          }
          relations {
            edges {
              relationType
              node {
                id
                title {
                  romaji
                  english
                }
                format
                coverImage {
                  medium
                }
              }
            }
          }
          recommendations(page: 1, perPage: 8) {
            nodes {
              mediaRecommendation {
                id
                title {
                  romaji
                  english
                }
                coverImage {
                  medium
                }
              }
            }
          }
          trailer {
            id
            site
            thumbnail
          }
          externalLinks {
            id
            url
            site
          }
        }
      }
    `
    return apiRequest<MediaResponse>(query, { id })
  },

  // Genre-based anime fetching
  async getByGenre({ 
    genre, 
    page = 1, 
    perPage = 20 
  }: { 
    genre: string 
  } & PaginationParams): Promise<AnilistResponse<PageResponse>> {
    const query = `
      query ($page: Int, $perPage: Int, $genre: String) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
            perPage
          }
          media(genre: $genre, type: ANIME, sort: POPULARITY_DESC) {
            ${BASE_MEDIA_FIELDS}
          }
        }
      }
    `
    return apiRequest<PageResponse>(query, { page, perPage, genre })
  },

  // Simple genres retrieval
  async getGenres(): Promise<AnilistResponse<GenreResponse>> {
    const query = `
      query {
        GenreCollection
      }
    `
    return apiRequest<GenreResponse>(query)
  }
}

export default AnilistQueries