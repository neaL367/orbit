import { graphql } from '@/lib/graphql/types/gql'

export const AnimeByIdQuery = graphql(`
  query AnimeById($id: Int) {
    Media(id: $id, type: ANIME) {
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
      staff {
        edges {
          role
          node {
            id
            name {
              full
              native
            }
            image {
              large
              medium
            }
          }
        }
      }
      characters {
        edges {
          role
          voiceActors {
            id
            name {
              full
              native
            }
            image {
              large
              medium
            }
            languageV2
          }
          node {
            id
            name {
              full
              native
            }
            image {
              large
              medium
            }
          }
        }
      }
      relations {
        edges {
          relationType
          node {
            id
            title {
              romaji
              english
            }
            coverImage {
              large
              medium
            }
            type
          }
        }
      }
      recommendations {
        nodes {
          rating
          userRating
          mediaRecommendation {
            id
            title {
              romaji
              english
            }
            coverImage {
              large
              medium
            }
          }
        }
      }
      streamingEpisodes {
        title
        thumbnail
        url
        site
      }
      trailer {
        id
        site
        thumbnail
      }
      externalLinks {
        id
        url
        site
        siteId
        type
        language
        color
        icon
        notes
        isDisabled
      }
    }
  }
`)

