interface PageInfo {
    total: number
    currentPage: number
    lastPage: number
    hasNextPage: boolean
    perPage: number
}

interface AnimeTitle {
    romaji: string
    english: string | null
    native: string
}

interface CoverImage {
    large: string | null
    medium: string | null
    extraLarge?: string | null
}

interface DateInfo {
    year: number | null
    month: number | null
    day: number | null
}

interface Character {
    id: number
    name: {
        full: string
    }
    image: {
        medium: string | null
        large: string | null
    }
    gender: string | null
    age: string | null
}

interface Studio {
    id: number
    name: string
}

interface RelatedAnime {
    id: number
    title: {
        romaji: string
        english: string | null
    }
    format: string
    coverImage: {
        medium: string | null
    }
}

interface Relation {
    relationType: string
    node: RelatedAnime
}

interface Recommendation {
    mediaRecommendation: {
        id: number
        title: {
            romaji: string
            english: string | null
        }
        coverImage: {
            medium: string | null
        }
    }
}

interface Tag {
    id: number
    name: string
    category: string
}

interface Trailer {
    id: string
    site: string
    thumbnail: string | null
}

interface ExternalLink {
    id: number
    url: string
    site: string
}

interface AnimeMedia {
    id: number
    title: AnimeTitle
    description: string | null
    coverImage: CoverImage
    bannerImage: string | null
    format: string
    episodes: number | null
    duration: number | null
    status: string
    genres: string[]
    averageScore: number | null
    popularity: number
    season: string | null
    seasonYear: number | null
    startDate?: DateInfo
    endDate?: DateInfo
    studios?: {
        nodes: Studio[]
    } | null
    characters?: {
        nodes: Character[]
    } | null
    relations?: {
        edges: Relation[]
    } | null
    recommendations?: {
        nodes: Recommendation[]
    } | null
    tags?: Tag[] | null
    trailer?: Trailer | null
    externalLinks?: ExternalLink[] | null
}

export interface PageResponse {
    Page: {
        pageInfo: PageInfo
        media: AnimeMedia[]
    }
}

export interface MediaResponse {
    Media: AnimeMedia
}

export interface GenreResponse {
    GenreCollection: string[]
}

export interface AnilistResponse<T> {
    data: T
}