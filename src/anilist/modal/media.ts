import { CharacterEdge, StaffConnection } from "./charactor"
import { Recommendation, RelationEdge } from "./relation"
import { AnimeStatsData } from "./stats"
import { DateInfo } from "./common"

export interface AnimeMedia {
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
    meanScore: number | null
    popularity: number
    favourites: number
    season: string | null
    seasonYear: number | null
    startDate?: DateInfo
    endDate?: DateInfo
    source: string
    hashtag: string
    studios?: {
        nodes: Studio[]
    } | null
    characters?: {
        edges: CharacterEdge[]
    } | null
    relations?: {
        edges: RelationEdge[]
    } | null
    recommendations?: {
        nodes: Recommendation[]
    } | null
    tags?: Tag[] | null
    trailer?: Trailer | null
    nextAiringEpisode?: NextAiringEpisode | null
    isAdult?: boolean
    countryOfOrigin: string
    externalLinks?: ExternalLink[] | null
    staff?: StaffConnection
    stats?: AnimeStatsData
}


export interface AnimeTitle {
    romaji: string;
    english: string | null;
    native: string;
    userPreferred?: string;
}

export interface CoverImage {
    large: string | null;
    medium: string | null;
    extraLarge?: string | null;
    color?: string | null;
}

export interface Tag {
    id: number;
    name: string;
    rank: number;
    isMediaSpoiler: boolean;
}

export interface Character {
    id: number;
    name: {
        full: string;
    };
    image: {
        medium: string | null;
        large: string | null;
    };
    gender: string | null;
    age: string | null;
}

export interface Studio {
    id: number;
    name: string;
}

export interface Trailer {
    id: string;
    site: string;
    thumbnail: string | null;
}

export interface ExternalLink {
    id: number;
    url: string;
    site: string;
}

export interface AiringSchedule {
    id: number;
    airingAt: number;
    timeUntilAiring: number;
    episode: number;
    media: AnimeMedia;
}


export interface NextAiringEpisode {
    id: number;
    airingAt: number;
    timeUntilAiring: number;
    episode: number;
}

export interface PremiereItem {
    id: number;
    title: {
        romaji: string;
        english: string | null;
        native: string;
    };
    coverImage: {
        large: string | null;
        medium: string | null;
    };
    bannerImage: string | null;
    premiereDate: Date;
    episodes: number | string | null;
    duration: number | string | null;
}
