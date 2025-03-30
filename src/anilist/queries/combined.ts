import type { AnilistResponse, PageInfo } from "../modal/common"
import type { AiringSchedule, AnimeMedia } from "../modal/media"
import { apiRequest } from "../utils/api-request"
import { BASE_MEDIA_FIELDS } from "../utils/fragments"

// Interface for combined homepage data
interface HomepageData {
    trending: {
        media: AnimeMedia[]
        pageInfo: PageInfo
    }
    popular: {
        media: AnimeMedia[]
        pageInfo: PageInfo
    }
    topRated: {
        media: AnimeMedia[]
        pageInfo: PageInfo
    }
    upcoming: {
        airingSchedules: AiringSchedule[]
    }
}


export const CombinedQueries = {
    /**
     * Fetch multiple data sets in a single GraphQL query to reduce API calls
     * This is useful for homepage and dashboard views
     */
    async getHomepageData(perPage = 10): Promise<AnilistResponse<HomepageData>> {
        // Get current timestamp and timestamp for 30 days later for upcoming premieres
        const now = Math.floor(Date.now() / 1000)
        const oneMonthLater = now + 2592000

        const query = `
      query {
        trending: Page(page: 1, perPage: ${perPage}) {
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
        popular: Page(page: 1, perPage: ${perPage}) {
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
        topRated: Page(page: 1, perPage: ${perPage}) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
            perPage
          }
          media(sort: SCORE_DESC, type: ANIME) {
            ${BASE_MEDIA_FIELDS}
          }
        }
        upcoming: Page(page: 1, perPage: ${perPage}) {
          airingSchedules(episode: 1, airingAt_greater: ${now}, airingAt_lesser: ${oneMonthLater}, sort: TIME) {
            id
            airingAt
            timeUntilAiring
            episode
            media {
              ${BASE_MEDIA_FIELDS}
            }
          }
        }
      }
    `

        return apiRequest<HomepageData>(query)
    },

    /**
     * Fetch anime details with related data in a single query
     * This reduces multiple API calls when viewing an anime's details page
     */
    async getAnimeWithRelated(id: number): Promise<AnilistResponse<AnimeMedia>> {
        const query = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          title {
            romaji
            english
            native
            userPreferred
          }
          description(asHtml: false)
          coverImage {
            large
            medium
            extraLarge
            color
          }
          bannerImage
          format
          episodes
          duration
          status
          genres
          averageScore
          meanScore
          popularity
          favourites
          season
          seasonYear
          source
          hashtag
          studios(isMain: true) {
            nodes {
              id
              name
              isAnimationStudio
            }
          }
          trailer {
            id
            site
            thumbnail
          }
          nextAiringEpisode {
            id
            airingAt
            timeUntilAiring
            episode
          }
          relations {
            edges {
              id
              relationType
              node {
                id
                title {
                  romaji
                  english
                  native
                }
                format
                type
                status
                coverImage {
                  large
                }
              }
            }
          }
          characters(sort: ROLE, role: MAIN, page: 1, perPage: 6) {
            edges {
              id
              role
              node {
                id
                name {
                  full
                  native
                }
                image {
                  large
                  medium
                }
              }
              voiceActors(language: JAPANESE) {
                id
                name {
                  full
                  native
                }
                image {
                  large
                }
                languageV2
              }
            }
          }
          recommendations(sort: RATING_DESC, page: 1, perPage: 6) {
            nodes {
              id
              rating
              mediaRecommendation {
                id
                title {
                  romaji
                  english
                }
                coverImage {
                  large
                }
                format
                episodes
              }
            }
          }
        }
      }
    `

        return apiRequest<AnimeMedia>(query, { id })
    },
}

