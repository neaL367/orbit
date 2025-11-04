import { graphql } from '@/graphql/gql'

export const TrendingAnimeQuery = graphql(`
  query TrendingAnime($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      media(type: ANIME, sort: TRENDING_DESC) {
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

