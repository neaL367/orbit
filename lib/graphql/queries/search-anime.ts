import { graphql } from '@/lib/graphql/types/gql'

export const SearchAnimeQuery = graphql(`
  query SearchAnime($page: Int, $perPage: Int, $search: String, $genres: [String], $format: MediaFormat, $status: MediaStatus) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        currentPage
        hasNextPage
        perPage
      }
      media(type: ANIME, search: $search, genre_in: $genres, format: $format, status: $status, sort: POPULARITY_DESC, isAdult: false) {
        id
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
        tags {
          id
          name
          description
          category
          rank
        }
        format
        duration
        episodes
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
        season
        seasonYear
        countryOfOrigin
        source
        hashtag
        synonyms
        siteUrl
        nextAiringEpisode {
          airingAt
          timeUntilAiring
          episode
        }
        trending
        studios(isMain: true) {
          nodes {
            id
            name
            siteUrl
            isAnimationStudio
          }
        }
      }
    }
  }
`)

