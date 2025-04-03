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

export interface Date {
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
    dateOfBirth?: Date
    dateOfDeath?: Date
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
    dateOfBirth?: Date
    age?: string
    bloodType?: string
    siteUrl?: string
    role?: string
    voiceActors?: {
        id: number
        name: {
            full: string
            native: string
        }
        image: {
            large: string | null
        }
        languageV2: string
    }[]
}


export interface CharacterEdge {
    node: Character
    role: string
    voiceActors: {
        id: number
        name: {
            full: string
            native: string
        }
        image: {
            large: string | null
        }
        languageV2: string
    }[]
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
    airingAt: number
    episode: number
    timeUntilAiring?: number
}

export interface AnimeMedia {
    id: number
    title: Title
    coverImage: CoverImage
    format: string
    episodes?: number
    chapters?: number
    duration?: number
    status?: string
    season?: string
    seasonYear?: number
    averageScore?: number
    popularity?: number
    genres?: string[]
    description?: string
    startDate?: Date
    endDate?: Date
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
    source?: string
    hashtag?: string
    bannerImage?: string
    synonyms?: string[]
    meanScore?: number
    favourites?: number
    trending?: number
    isFavourite?: boolean
    isLicensed?: boolean
    type?: string
}

export interface AiringSchedule {
    id: number
    airingAt: number
    episode: number
    media: AnimeMedia
    timeUntilAiring?: number
}

export interface Season {
    year: number
    season: "WINTER" | "SPRING" | "SUMMER" | "FALL"
}

export interface PageInfo {
    hasNextPage: boolean
    currentPage: number
    total?: number
}

export interface GraphQLError {
    message: string
    locations?: { line: number; column: number }[]
    path?: string[]
    extensions?: Record<string, unknown>
}
