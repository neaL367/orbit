import { AnilistResponse, PageResponse, PaginationParams } from "@/lib/anilist/utils/types"
import { apiRequest } from "../utils/api-request"
import { BASE_MEDIA_FIELDS } from "../utils/fragments"

export const SearchQueries = {

    // Search with improved type safety
    async search({
        query: searchTerm,
        page = 1,
        perPage = 20,
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
}