import { GraphQLVariables } from "./api-request";

// Core types
export interface PageInfo {
    total: number;
    currentPage: number;
    lastPage: number;
    hasNextPage: boolean;
    perPage: number;
}

export interface AnimeTitle {
    romaji: string;
    english: string | null;
    native: string;
}

export interface CoverImage {
    large: string | null;
    medium: string | null;
    extraLarge?: string | null;
}

export interface DateInfo {
    year: number | null;
    month: number | null;
    day: number | null;
}

// Entity types
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

export interface Tag {
    id: number;
    name: string;
    category: string;
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

// Relationship types
export interface RelatedAnime {
    id: number;
    title: {
        romaji: string;
        english: string | null;
    };
    format: string;
    coverImage: {
        medium: string | null;
    };
}

export interface Relation {
    relationType: string;
    node: RelatedAnime;
}

export interface Recommendation {
    mediaRecommendation: {
        id: number;
        title: {
            romaji: string;
            english: string | null;
        };
        coverImage: {
            medium: string | null;
        };
    };
}

// Connection wrappers
interface StudioConnection {
    nodes: Studio[];
}

interface CharacterConnection {
    nodes: Character[];
}

interface RelationConnection {
    edges: Relation[];
}

interface RecommendationConnection {
    nodes: Recommendation[];
}

// Main media type
export interface AnimeMedia {
    id: number;
    title: AnimeTitle;
    description: string | null;
    coverImage: CoverImage;
    bannerImage: string | null;
    format: string;
    episodes: number | null;
    duration: number | null;
    status: string;
    genres: string[];
    averageScore: number | null;
    popularity: number;
    season: string | null;
    seasonYear: number | null;
    startDate?: DateInfo;
    endDate?: DateInfo;
    studios?: StudioConnection | null;
    characters?: CharacterConnection | null;
    relations?: RelationConnection | null;
    recommendations?: RecommendationConnection | null;
    tags?: Tag[] | null;
    trailer?: Trailer | null;
    externalLinks?: ExternalLink[] | null;
    isAdult?: boolean;
}

// Schedule types
export interface AiringSchedule {
    id: number;
    airingAt: number;
    timeUntilAiring: number;
    episode: number;
    media: AnimeMedia;
}

// Response types
export interface PageResponse {
    Page: {
        pageInfo: PageInfo;
        media: AnimeMedia[];
    };
}

export interface MediaResponse {
    Media: AnimeMedia;
}

export interface GenreResponse {
    GenreCollection: string[];
}

export interface SchedulePageResponse {
    Page: {
        pageInfo: PageInfo;
        airingSchedules: AiringSchedule[];
    };
}

// Utility types
export interface AnilistResponse<T> {
    data: T;
}
export interface PaginationParams extends Partial<GraphQLVariables> {
    page?: number
    perPage?: number
}