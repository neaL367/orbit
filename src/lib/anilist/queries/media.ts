import { AnilistResponse, PageResponse, PaginationParams } from "@/lib/anilist/utils/types";
import { BASE_MEDIA_FIELDS } from "../utils/fragments";
import { apiRequest } from "../utils/api-request";


export const MediaQueries = {
  // Trending anime with more robust typing
  async getTrending({ page = 1, perPage = 20 }: PaginationParams = {}): Promise<AnilistResponse<PageResponse>> {
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
  async getPopular({ page = 1, perPage = 20 }: PaginationParams = {}): Promise<AnilistResponse<PageResponse>> {
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
    perPage = 20,
  }: {
    season: string
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
      seasonYear: year,
    })
  },
};
