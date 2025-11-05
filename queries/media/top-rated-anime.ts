import { graphql } from '@/graphql/gql'

export const TopRatedAnimeQuery = graphql(`
  query TopRatedAnime($page: Int, $perPage: Int, $genres: [String], $format: MediaFormat, $status: MediaStatus, $season: MediaSeason, $seasonYear: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      media(type: ANIME, sort: SCORE_DESC, genre_in: $genres, format: $format, status: $status, season: $season, seasonYear: $seasonYear) {
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
        isAdult
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

