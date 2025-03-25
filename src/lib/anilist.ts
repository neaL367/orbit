import { AnilistResponse, GenreResponse, MediaResponse, PageResponse } from "@/types"

// GraphQL endpoint for AniList API
const ANILIST_API = "https://graphql.anilist.co"

// Define a type for GraphQL variables
type GraphQLVariables = Record<string, unknown>

// Function to fetch data from AniList API without Redis caching
export async function fetchFromAnilist<T>(
  query: string,
  variables: GraphQLVariables = {},
): Promise<AnilistResponse<T>> {
  try {
    // Fetch directly from API with revalidation set to 1 hour
    const response = await fetch(ANILIST_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      throw new Error(`AniList API error: ${response.status}`)
    }

    const data = (await response.json()) as AnilistResponse<T>
    return data
  } catch (error) {
    console.error("Error fetching from AniList:", error)
    throw error
  }
}

// Query to get trending anime
export async function getTrendingAnime(page = 1, perPage = 20): Promise<AnilistResponse<PageResponse>> {
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
        }
      }
    }
  `
  return fetchFromAnilist<PageResponse>(query, { page, perPage })
}

// Query to get popular anime
export async function getPopularAnime(page = 1, perPage = 20): Promise<AnilistResponse<PageResponse>> {
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
        }
      }
    }
  `
  return fetchFromAnilist<PageResponse>(query, { page, perPage })
}

// Query to get seasonal anime
export async function getSeasonalAnime(
  season: string,
  year: number,
  page = 1,
  perPage = 20,
): Promise<AnilistResponse<PageResponse>> {
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
        }
      }
    }
  `
  return fetchFromAnilist<PageResponse>(query, { page, perPage, season: season.toUpperCase(), seasonYear: year })
}

// Query to search anime
export async function searchAnime(search: string, page = 1, perPage = 20): Promise<AnilistResponse<PageResponse>> {
  const query = `
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
        }
      }
    }
  `
  return fetchFromAnilist<PageResponse>(query, { page, perPage, search })
}

// Query to get anime by ID
export async function getAnimeById(id: number): Promise<AnilistResponse<MediaResponse>> {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        title {
          romaji
          english
          native
        }
        description
        coverImage {
          large
          extraLarge
        }
        bannerImage
        format
        episodes
        duration
        status
        genres
        tags {
          id
          name
          category
        }
        averageScore
        popularity
        season
        seasonYear
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
  return fetchFromAnilist<MediaResponse>(query, { id })
}

// Query to get anime by genre
export async function getAnimeByGenre(genre: string, page = 1, perPage = 20): Promise<AnilistResponse<PageResponse>> {
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
        }
      }
    }
  `
  return fetchFromAnilist<PageResponse>(query, { page, perPage, genre })
}

// Get all available genres
export async function getGenres(): Promise<AnilistResponse<GenreResponse>> {
  const query = `
    query {
      GenreCollection
    }
  `
  return fetchFromAnilist<GenreResponse>(query)
}
