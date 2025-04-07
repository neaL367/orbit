import { gql } from "@apollo/client";

export const MEDIA_FRAGMENT = gql`
  fragment MediaFragment on Media {
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
    bannerImage
    format
    episodes
    duration
    status
    season
    seasonYear
    averageScore
    meanScore
    popularity
    favourites
    trending
    genres
    synonyms
    description(asHtml: true)
    source
    hashtag
    isAdult
    isFavourite
    isLicensed
    countryOfOrigin
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
    studios {
      nodes {
        id
        name
        isAnimationStudio
        siteUrl
      }
    }
    siteUrl
    nextAiringEpisode {
      airingAt
      episode
      timeUntilAiring
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
      type
      language
      color
      icon
    }
    tags {
      id
      name
      description
      category
      rank
      isGeneralSpoiler
      isMediaSpoiler
      isAdult
    }
  }
`;

export const SCHEDULE_MEDIA_FRAGMENT = gql`
  fragment ScheduleMediaFragment on Media {
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
      color
    }
    format
    episodes
    duration
    status
    season
    seasonYear
    isAdult
    externalLinks {
      id
      url
      site
      type
    }
  }
`;
