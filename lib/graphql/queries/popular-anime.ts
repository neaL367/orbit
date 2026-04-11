import { gql } from './index'

export const PopularAnimeQuery = gql`
  query PopularAnime($page: Int, $perPage: Int, $genres: [String], $format: MediaFormat, $status: MediaStatus, $season: MediaSeason, $seasonYear: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        currentPage
        hasNextPage
        perPage
      }
      media(type: ANIME, sort: POPULARITY_DESC, genre_in: $genres, format: $format, status: $status, season: $season, seasonYear: $seasonYear, isAdult: false) {
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
