
import { AnilistResponse } from "../modal/common"
import { GenreResponse, MediaResponse, PageResponse, PaginationParams } from "../modal/response"
import { apiRequest } from "../utils/api-request"
import { BASE_MEDIA_FIELDS, MEDIA_DETAILS_FIELDS } from "../utils/fragments"

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
              ${MEDIA_DETAILS_FIELDS}
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

