import { AnilistResponse, GenreResponse, MediaResponse, PageResponse, PaginationParams } from "@/lib/anilist/utils/types"
import { apiRequest } from "../utils/api-request"
import { BASE_MEDIA_FIELDS } from "../utils/fragments"

export const GenreQueries = {

    async getGenres(): Promise<AnilistResponse<GenreResponse>> {
        const query = `
      query {
        GenreCollection
      }
    `
        return apiRequest<GenreResponse>(query)
    },

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
        perPage = 20,
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
}