import { cache } from "react"
import type {
  AnimeMedia,
  AiringSchedule,
  Season,
  PageInfo,
  CharacterEdge,
  RecommendationNode,
  GraphQLError,
  MediaRelationEdge,
  StaffEdge,
} from "@/lib/types"

const ANILIST_API_URL = "https://graphql.anilist.co"

// Helper function to execute GraphQL queries
async function executeGraphQLQuery(query: string, variables = {}) {
  try {
    const response = await fetch(ANILIST_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      next: {
        // Cache for 1 hour
        revalidate: 3600,
      },
    })

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`)
    }

    const data = await response.json()

    if (data.errors) {
      throw new Error(data.errors.map((e: GraphQLError) => e.message).join(", "))
    }

    return data.data
  } catch (error) {
    console.error("Error fetching data from AniList:", error)
    throw error
  }
}

// Enhanced media fragment with all the requested fields
const MEDIA_FRAGMENT = `
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
`

// Cached API functions using React cache()
export const fetchTrendingAnime = cache(async (page = 1, perPage = 20, isAdult = false) => {
  const query = `
    ${MEDIA_FRAGMENT}
    query ($page: Int, $perPage: Int, $isAdult: Boolean) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          hasNextPage
          currentPage
          total
        }
        media(type: ANIME, sort: TRENDING_DESC, isAdult: $isAdult) {
          ...MediaFragment
        }
      }
    }
  `

  const data = await executeGraphQLQuery(query, { page, perPage, isAdult })
  return {
    media: data.Page.media as AnimeMedia[],
    pageInfo: data.Page.pageInfo as PageInfo,
  }
})

export const fetchPopularAnime = cache(async (page = 1, perPage = 20, isAdult = false) => {
  const query = `
    ${MEDIA_FRAGMENT}
    query ($page: Int, $perPage: Int, $isAdult: Boolean) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          hasNextPage
          currentPage
          total
        }
        media(type: ANIME, sort: POPULARITY_DESC, isAdult: $isAdult) {
          ...MediaFragment
        }
      }
    }
  `

  const data = await executeGraphQLQuery(query, { page, perPage, isAdult })
  return {
    media: data.Page.media as AnimeMedia[],
    pageInfo: data.Page.pageInfo as PageInfo,
  }
})

export const fetchAllTimePopularAnime = cache(async (page = 1, perPage = 20, isAdult = false) => {
  const query = `
    ${MEDIA_FRAGMENT}
    query ($page: Int, $perPage: Int, $isAdult: Boolean) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          hasNextPage
          currentPage
          total
        }
        media(type: ANIME, sort: POPULARITY_DESC, isAdult: $isAdult) {
          ...MediaFragment
        }
      }
    }
  `

  const data = await executeGraphQLQuery(query, { page, perPage, isAdult })
  return {
    media: data.Page.media as AnimeMedia[],
    pageInfo: data.Page.pageInfo as PageInfo,
  }
})

export const fetchTopRatedAnime = cache(async (page = 1, perPage = 20, isAdult = false) => {
  const query = `
    ${MEDIA_FRAGMENT}
    query ($page: Int, $perPage: Int, $isAdult: Boolean) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          hasNextPage
          currentPage
          total
        }
        media(type: ANIME, sort: SCORE_DESC, isAdult: $isAdult) {
          ...MediaFragment
        }
      }
    }
  `

  const data = await executeGraphQLQuery(query, { page, perPage, isAdult })
  return {
    media: data.Page.media as AnimeMedia[],
    pageInfo: data.Page.pageInfo as PageInfo,
  }
})

export const fetchRecentlyUpdated = cache(async (page = 1, perPage = 20, isAdult = false) => {
  const query = `
    ${MEDIA_FRAGMENT}
    query ($page: Int, $perPage: Int, $isAdult: Boolean) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          hasNextPage
          currentPage
        }
        media(type: ANIME, status: RELEASING, sort: UPDATED_AT_DESC, isAdult: $isAdult) {
          ...MediaFragment
        }
      }
    }
  `

  const data = await executeGraphQLQuery(query, { page, perPage, isAdult })
  return {
    media: data.Page.media as AnimeMedia[],
    pageInfo: data.Page.pageInfo as PageInfo,
  }
})

export const fetchSeasonalAnime = cache(
  async (
    season: string = getCurrentSeason().season,
    year: number = getCurrentSeason().year,
    page = 1,
    perPage = 20,
    isAdult = false
  ) => {
    const query = `
    ${MEDIA_FRAGMENT}
    query ($season: MediaSeason, $year: Int, $page: Int, $perPage: Int, $isAdult: Boolean) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          hasNextPage
          currentPage
          total
        }
        media(type: ANIME, season: $season, seasonYear: $year, sort: POPULARITY_DESC, isAdult: $isAdult) {
          ...MediaFragment
        }
      }
    }
  `

    const data = await executeGraphQLQuery(query, {
      season: season.toUpperCase(),
      year,
      page,
      perPage,
      isAdult
    })

    return {
      media: data.Page.media as AnimeMedia[],
      pageInfo: data.Page.pageInfo as PageInfo,
      season: {
        season: season.toUpperCase(),
        year,
      },
    }
  },
)

export const fetchAiringSchedule = cache(async (
  page = 1,
  perPage = 20,
  notYetAired = true,
  isAdult = false // still keep this if you plan to filter client-side
) => {
  // Get current timestamp in seconds
  const now = Math.floor(Date.now() / 1000);

  const query = `
    ${MEDIA_FRAGMENT}
    query ($page: Int, $perPage: Int, $airingAtGreater: Int, $airingAtLesser: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          hasNextPage
          currentPage
          total
        }
        airingSchedules(
          airingAt_greater: $airingAtGreater
          airingAt_lesser: $airingAtLesser
          sort: TIME
        ) {
          id
          airingAt
          episode
          timeUntilAiring
          media {
            ...MediaFragment
          }
        }
      }
    }
  `;

  // For upcoming schedule (next 7 days)
  const weekFromNow = now + 7 * 24 * 60 * 60;

  const variables = notYetAired
    ? { page, perPage, airingAtGreater: now, airingAtLesser: weekFromNow }
    : { page, perPage, airingAtGreater: now - 7 * 24 * 60 * 60, airingAtLesser: now };

  const data = await executeGraphQLQuery(query, variables);

  // Optionally filter client-side based on isAdult:
  const schedules = isAdult
    ? data.Page.airingSchedules
    : data.Page.airingSchedules.filter((schedule: AiringSchedule) => !schedule.media.isAdult);

  return {
    schedules,
    pageInfo: data.Page.pageInfo as PageInfo,
  };
});



export const searchAnime = cache(async (searchTerm: string, page = 1, perPage = 20, isAdult = false) => {
  const query = `
    ${MEDIA_FRAGMENT}
    query ($search: String, $page: Int, $perPage: Int, $isAdult: Boolean) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          hasNextPage
          currentPage
          total
        }
        media(search: $search, type: ANIME, isAdult: $isAdult) {
          ...MediaFragment
        }
      }
    }
  `

  const data = await executeGraphQLQuery(query, { search: searchTerm, page, perPage, isAdult })
  return {
    media: data.Page.media as AnimeMedia[],
    pageInfo: data.Page.pageInfo as PageInfo,
  }
})

export const fetchAnimeDetails = cache(async (id: string) => {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
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
  `

  const data = await executeGraphQLQuery(query, { id: Number.parseInt(id) })
  return data.Media as AnimeMedia
})

export const fetchAnimeCharacters = cache(async (id: string) => {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        characters(sort: ROLE, role: MAIN, page: 1, perPage: 20) {
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
      }
    }
  `

  const data = await executeGraphQLQuery(query, { id: Number.parseInt(id) })
  return data.Media.characters.edges.map((edge: CharacterEdge) => ({
    ...edge.node,
    role: edge.role,
    voiceActors: edge.voiceActors,
  }))
})

export const fetchAnimeRecommendations = cache(async (id: string) => {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        recommendations(page: 1, perPage: 8, sort: RATING_DESC) {
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
              coverImage {
                large
                medium
              }
              format
              episodes
              season
              seasonYear
              averageScore
            }
          }
        }
      }
    }
  `

  const data = await executeGraphQLQuery(query, { id: Number.parseInt(id) })
  return data.Media.recommendations.nodes.map((node: RecommendationNode) => node.mediaRecommendation)
})

export const fetchAnimeRelations = cache(async (id: string) => {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
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
      }
    }
  `

  const data = await executeGraphQLQuery(query, { id: Number.parseInt(id) })
  return data.Media.relations.edges as MediaRelationEdge[]
})

export const fetchAnimeStaff = cache(async (id: string) => {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
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
      }
    }
  `

  const data = await executeGraphQLQuery(query, { id: Number.parseInt(id) })
  return data.Media.staff.edges as StaffEdge[]
})

// Helper function to get current season
export function getCurrentSeason(): Season {
  const now = new Date()
  const month = now.getMonth() + 1 // JavaScript months are 0-indexed
  const year = now.getFullYear()

  let season: "WINTER" | "SPRING" | "SUMMER" | "FALL"

  if (month >= 1 && month <= 3) {
    season = "WINTER"
  } else if (month >= 4 && month <= 6) {
    season = "SPRING"
  } else if (month >= 7 && month <= 9) {
    season = "SUMMER"
  } else {
    season = "FALL"
  }

  return { year, season }
}

// Helper function to format timestamp to human-readable date/time
export function formatAiringTime(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  return date.toLocaleString()
}

// Helper function to get time until airing
export function getTimeUntilAiring(timestamp: number): string {
  const now = Date.now() / 1000
  const timeUntil = timestamp - now

  if (timeUntil <= 0) {
    return "Aired"
  }

  const days = Math.floor(timeUntil / (24 * 60 * 60))
  const hours = Math.floor((timeUntil % (24 * 60 * 60)) / (60 * 60))
  const minutes = Math.floor((timeUntil % (60 * 60)) / 60)

  if (days > 0) {
    return `${days}d ${hours}h`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}

export const fetchGenres = cache(async (includeAdult = false) => {
  const query = `
    query {
      GenreCollection
    }
  `;

  const data = await executeGraphQLQuery(query);
  const nsfwGenres = ["Ecchi", "Hentai"];

  return data.GenreCollection.filter(
    (genre: string) => includeAdult || !nsfwGenres.includes(genre)
  ) as string[];
});


export const fetchAnimeByGenre = cache(async (
  genre: string,
  page = 1,
  perPage = 20,
  isAdult = false
) => {
  const query = `
    ${MEDIA_FRAGMENT}
    query ($genre: String, $page: Int, $perPage: Int, $isAdult: Boolean) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          hasNextPage
          currentPage
          total
        }
        media(genre: $genre, type: ANIME, sort: POPULARITY_DESC, isAdult: $isAdult) {
          ...MediaFragment
        }
      }
    }
  `;

  const data = await executeGraphQLQuery(query, { genre, page, perPage, isAdult });
  return {
    media: data.Page.media as AnimeMedia[],
    pageInfo: data.Page.pageInfo as PageInfo,
  };
});


export const fetchWeeklySchedule = cache(async (isAdult = false) => {
  // Get current timestamp in seconds
  const now = Math.floor(Date.now() / 1000);

  // Get timestamp for 7 days from now
  const weekFromNow = now + 7 * 24 * 60 * 60;

  const query = `
    ${MEDIA_FRAGMENT}
    query ($airingAtGreater: Int, $airingAtLesser: Int, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        airingSchedules(
          airingAt_greater: $airingAtGreater
          airingAt_lesser: $airingAtLesser
          sort: TIME
        ) {
          id
          airingAt
          episode
          timeUntilAiring
          media {
            ...MediaFragment
          }
        }
      }
    }
  `;

  const data = await executeGraphQLQuery(query, {
    airingAtGreater: now,
    airingAtLesser: weekFromNow,
    page: 1,
    perPage: 100,
  });

  // Group schedules by day of week and filter based on isAdult if needed
  const schedulesByDay: Record<string, AiringSchedule[]> = {
    Sunday: [],
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
  };

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  data.Page.airingSchedules.forEach((schedule: AiringSchedule) => {
    // Filter out NSFW if isAdult is false
    if (!isAdult && schedule.media.isAdult) return;
    const date = new Date(schedule.airingAt * 1000);
    const dayOfWeek = days[date.getDay()];
    schedulesByDay[dayOfWeek].push(schedule);
  });

  return schedulesByDay;
});


