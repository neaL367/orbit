export const BASE_MEDIA_FIELDS = `
  id
  title {
    romaji
    english
    native
    userPreferred
  }
  description(asHtml: false)
  coverImage {
    large
    medium
    extraLarge
    color
  }
  bannerImage
  format
  episodes
  duration
  status
  genres
  averageScore
  meanScore
  popularity
  favourites
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
  source
  hashtag
  studios(isMain: true) {
    nodes {
      id
      name
      isAnimationStudio
    }
  }
  trailer {
    id
    site
    thumbnail
  }
  nextAiringEpisode {
    id
    airingAt
    timeUntilAiring
    episode
  }
  isAdult
  countryOfOrigin
  tags {
    id
    name
    rank
    isMediaSpoiler
  }
  externalLinks {
  id
  url
  site
}
`

export const SCHEDULE_FIELDS = `
  id
  airingAt
  timeUntilAiring
  episode
  media {
    ${BASE_MEDIA_FIELDS}
  }
`

// Additional specialized fragments for specific use cases
export const MEDIA_DETAILS_FIELDS = `
  ${BASE_MEDIA_FIELDS}
  relations {
    edges {
      id
      relationType
      node {
        id
        title {
          romaji
          english
          native
        }
        format
        type
        status
        coverImage {
          large
        }
      }
    }
  }
  characters(sort: ROLE, role: MAIN, page: 1, perPage: 6) {
    edges {
      id
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
      voiceActors(language: JAPANESE) {
        id
        name {
          full
          native
        }
        image {
          large
        }
        languageV2
      }
    }
  }
  staff(sort: RELEVANCE, page: 1, perPage: 4) {
    edges {
      id
      role
      node {
        id
        name {
          full
          native
        }
        image {
          large
        }
      }
    }
  }
  recommendations(sort: RATING_DESC, page: 1, perPage: 6) {
    nodes {
      id
      rating
      mediaRecommendation {
        id
        title {
          romaji
          english
        }
        coverImage {
          large
        }
        format
        episodes
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
`