import { gql } from './index'

export const SearchAnimeQuery = gql`
  query SearchAnime($page: Int, $perPage: Int, $search: String, $genres: [String], $format: MediaFormat, $status: MediaStatus) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        currentPage
        hasNextPage
        perPage
      }
      media(type: ANIME, search: $search, genre_in: $genres, format: $format, status: $status, sort: POPULARITY_DESC, isAdult: false) {
        id
        idMal
        title {
          romaji
          english
          native
          userPreferred
        }
        description
        coverImage {
          large
          medium
          extraLarge
          color
        }
        bannerImage
        averageScore
        meanScore
        popularity
        favourites
        status
        genres
        format
        duration
        episodes
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
        tags {
          id
          name
          description
          category
          rank
        }
        studios(isMain: true) {
          nodes {
            id
            name
          }
        }
      }
    }
  }
`
