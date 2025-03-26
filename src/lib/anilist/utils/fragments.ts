export const BASE_MEDIA_FIELDS = `
  id
  title {
    romaji
    english
    native
  }
  description
  coverImage {
    large
    medium
  }
  bannerImage
  format
  episodes
  duration
  status
  genres
  averageScore
  popularity
  season
  seasonYear
`

export const SCHEDULE_FIELDS = `
  id
  airingAt
  timeUntilAiring
  episode
  media {
    ${BASE_MEDIA_FIELDS}
    duration
    episodes
    format
    status
    isAdult
  }
`