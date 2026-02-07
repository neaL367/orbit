import { graphql } from '@/lib/graphql/types/gql'

export const ScheduleAnimeQuery = graphql(`
  query ScheduleAnimeHero($page: Int, $perPage: Int, $notYetAired: Boolean, $airingAt_greater: Int, $airingAt_lesser: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        currentPage
        hasNextPage
        perPage
      }
      airingSchedules(
        notYetAired: $notYetAired
        airingAt_greater: $airingAt_greater
        airingAt_lesser: $airingAt_lesser
        sort: TIME
      ) {
        id
        airingAt
        episode
        timeUntilAiring
        mediaId
        media {
          id
          title {
            romaji
            english
            native
            userPreferred
          }
          bannerImage
          coverImage {
            large
            medium
            extraLarge
            color
          }
          format
          status
          season
          seasonYear
          isAdult
          externalLinks {
            id
            site
            url
            type
            language
            color
            icon
          }
          streamingEpisodes {
            title
            thumbnail
            url
            site
          }
        }
      }
    }
  }
`)

