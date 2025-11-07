import { graphql } from '@/graphql/gql'

export const ScheduleAnimeQuery = graphql(`
  query ScheduleAnime($page: Int, $perPage: Int, $notYetAired: Boolean, $airingAt_greater: Int, $airingAt_lesser: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
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
          coverImage {
            large
            medium
            extraLarge
            color
          }
          format
          status
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

