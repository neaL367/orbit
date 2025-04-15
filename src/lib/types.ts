// Define types for the API responses
export interface Title {
    romaji?: string
    english?: string
    native?: string
    userPreferred?: string
}

export interface CoverImage {
    large: string
    medium?: string
    extraLarge?: string
    color?: string
}

export interface FuzzyDate {
    year?: number
    month?: number
    day?: number
}

export interface Studio {
    id: number
    name: string
    isAnimationStudio?: boolean
    siteUrl?: string
}

export interface Staff {
    id: number
    name: {
        full: string
        native?: string
        first?: string
        last?: string
    }
    language?: string
    image: {
        large: string
        medium?: string
    }
    description?: string
    primaryOccupations?: string[]
    gender?: string
    dateOfBirth?: FuzzyDate
    dateOfDeath?: FuzzyDate
    age?: number
    yearsActive?: number[]
    homeTown?: string
    siteUrl?: string
    role?: string
}

export interface Character {
    id: number
    name: {
        full: string
        native?: string
        first?: string
        last?: string
    }
    image: {
        large: string
        medium?: string
    }
    description?: string
    gender?: string
    dateOfBirth?: FuzzyDate
    age?: string
    bloodType?: string
    siteUrl?: string
}

export interface VoiceActor {
    id: number
    name: {
        full: string
        native?: string
    }
    image: {
        large: string
        medium?: string
    }
    language: string
}

export interface CharacterEdge {
    node: Character
    role: string
    voiceActors: VoiceActor[]
}

export interface CharacterConnection {
    edges: CharacterEdge[]
    nodes?: Character[]
}

export interface StaffEdge {
    node: Staff
    role: string
}

export interface StaffConnection {
    edges: StaffEdge[]
    nodes?: Staff[]
}

export interface MediaTag {
    id: number
    name: string
    description?: string
    category?: string
    rank?: number
    isGeneralSpoiler?: boolean
    isMediaSpoiler?: boolean
    isAdult?: boolean
}

export interface MediaTrailer {
    id?: string
    site?: string
    thumbnail?: string
}

export interface MediaRelation {
    id: number
    title: Title
    format: string
    type: string
    status: string
    coverImage: CoverImage
}

export interface MediaRelationEdge {
    node: MediaRelation
    relationType: string
}

export interface MediaRelationConnection {
    edges: MediaRelationEdge[]
}

export interface MediaRecommendation {
    id: number
    rating: number
    mediaRecommendation: AnimeMedia
}

export interface RecommendationNode {
    id: number
    rating: number
    mediaRecommendation: AnimeMedia
}

export interface MediaRecommendationConnection {
    nodes: RecommendationNode[]
}

export interface ExternalLink {
    id: number
    url: string
    site: string
    type?: string
    language?: string
    color?: string
    icon?: string
}

export interface ScoreDistribution {
    score: number
    amount: number
}

export interface StatusDistribution {
    status: string
    amount: number
}

export interface AiringProgression {
    episode: number
    score: number
    watching: number
}

export interface MediaStats {
    scoreDistribution?: ScoreDistribution[]
    statusDistribution?: StatusDistribution[]
    airingProgression?: AiringProgression[]
}

export interface NextAiringEpisode {
    id: number
    airingAt: number
    timeUntilAiring: number
    episode: number
}

export type MediaFormat = 
    "TV" | "TV_SHORT" | "MOVIE" | "SPECIAL" | 
    "OVA" | "ONA" | "MUSIC" | "MANGA" | 
    "NOVEL" | "ONE_SHOT";

export type MediaStatus = 
    "FINISHED" | "RELEASING" | "NOT_YET_RELEASED" | 
    "CANCELLED" | "HIATUS";

export type MediaSeason = "WINTER" | "SPRING" | "SUMMER" | "FALL";

export type MediaSource = 
    "ORIGINAL" | "MANGA" | "LIGHT_NOVEL" | "VISUAL_NOVEL" | 
    "VIDEO_GAME" | "OTHER" | "NOVEL" | "DOUJINSHI" | 
    "ANIME" | "WEB_NOVEL" | "LIVE_ACTION" | "GAME" | 
    "COMIC" | "MULTIMEDIA_PROJECT" | "PICTURE_BOOK";

export interface AnimeMedia {
    id: number
    title: Title
    coverImage: CoverImage
    format: MediaFormat
    episodes?: number
    duration?: number
    status?: MediaStatus
    season?: MediaSeason
    seasonYear?: number
    averageScore?: number
    meanScore?: number
    popularity?: number
    genres?: string[]
    description?: string
    startDate?: FuzzyDate
    endDate?: FuzzyDate
    studios?: {
        nodes: Studio[]
    }
    siteUrl?: string
    nextAiringEpisode?: NextAiringEpisode
    characters?: CharacterConnection
    relations?: MediaRelationConnection
    recommendations?: MediaRecommendationConnection
    tags?: MediaTag[]
    trailer?: MediaTrailer
    isAdult?: boolean
    countryOfOrigin?: string
    externalLinks?: ExternalLink[]
    staff?: StaffConnection
    stats?: MediaStats
    source?: MediaSource
    hashtag?: string
    bannerImage?: string
    synonyms?: string[]
    favourites?: number
    trending?: number
    isFavourite?: boolean
    isLicensed?: boolean
    type?: "ANIME" | "MANGA"
}

export interface AiringSchedule {
    id: number
    airingAt: number
    timeUntilAiring: number
    episode: number
    media: AnimeMedia
}

export interface PageInfo {
    total?: number
    perPage?: number
    currentPage: number
    lastPage?: number
    hasNextPage: boolean
}

export interface Page {
    pageInfo: PageInfo
    media?: AnimeMedia[]
    airingSchedules?: AiringSchedule[]
}
