import { gql } from "@apollo/client"
import { MEDIA_FRAGMENT } from "./fragment";

export const ANIME_DETAILS_QUERY = gql`
${MEDIA_FRAGMENT}
query ($id: Int) {
  Media(id: $id, type: ANIME) {
    ...MediaFragment
    characters {
      edges {
        node {
          id
          name {
            full
            native
            first
            last
          }
          image {
            large
            medium
          }
          description
          gender
          age
          siteUrl
        }
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
          language
        }
      }
    }
    staff {
      edges {
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
          description
          primaryOccupations
          siteUrl
        }
        role
      }
    }
    relations {
      edges {
        node {
          id
          title {
            romaji
            english
            native
            userPreferred
          }
          format
          type
          status
          coverImage {
            large
            medium
          }
        }
        relationType
      }
    }
    recommendations {
      nodes {
        id
        rating
        mediaRecommendation {
          id
          title {
            romaji
            english
            native
            userPreferred
          }
          format
          type
          status
          coverImage {
            large
            medium
          }
          episodes
          chapters
          averageScore
        }
      }
    }
    stats {
      scoreDistribution {
        score
        amount
      }
      statusDistribution {
        status
        amount
      }
    }
  }
}
`;