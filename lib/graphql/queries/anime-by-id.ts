import { gql } from './index'

export const AnimeByIdQuery = gql`
  query AnimeById($id: Int) {
    Media(id: $id, type: ANIME, isAdult: false) {
      id
      idMal
      title {
        romaji
        english
        native
        userPreferred
      }
      coverImage {
        extraLarge
        large
        medium
        color
      }
      bannerImage
      description
      season
      seasonYear
      format
      status
      episodes
      duration
      genres
      tags {
        id
        name
        description
        category
        rank
        isGeneralSpoiler
        isMediaSpoiler
      }
      averageScore
      meanScore
      popularity
      favourites
      source
      hashtag
      synonyms
      siteUrl
      countryOfOrigin
      isLicensed
      isAdult
      nextAiringEpisode {
        airingAt
        timeUntilAiring
        episode
      }
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
      streamingEpisodes {
        title
        thumbnail
        url
        site
      }
      studios(isMain: true) {
        nodes {
          id
          name
          isAnimationStudio
          siteUrl
        }
      }
      relations {
        edges {
          id
          relationType
          node {
            id
            idMal
            title {
              romaji
              english
              native
              userPreferred
            }
            type
            format
            status
            bannerImage
            coverImage {
              large
              medium
            }
            isAdult
          }
        }
      }
      characters {
        edges {
          id
          role
          node {
            id
            name {
              full
              native
              userPreferred
            }
            image {
              large
              medium
            }
          }
          voiceActors {
            id
            name {
              full
              native
              userPreferred
            }
            image {
              large
              medium
            }
            languageV2
          }
        }
      }
      staff {
        edges {
          id
          role
          node {
            id
            name {
              full
              native
              userPreferred
            }
            image {
              large
              medium
            }
          }
        }
      }
      recommendations {
        nodes {
          id
          rating
          userRating
          mediaRecommendation {
            id
            idMal
            title {
              romaji
              english
              native
              userPreferred
            }
            type
            format
            status
            bannerImage
            coverImage {
              large
              medium
            }
            isAdult
          }
        }
      }
    }
  }
`
