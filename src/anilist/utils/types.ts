import { GraphQLVariables } from "./api-request";

/* ====================================================
   Core Types
   ==================================================== */

export interface PageInfo {
  total: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
  perPage: number;
}

export interface DateInfo {
  year: number | null;
  month: number | null;
  day: number | null;
}

/* ====================================================
   Media & Title Types
   ==================================================== */

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

/* ====================================================
   Entity Types
   ==================================================== */

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

/* ====================================================
   Relationship Types
   ==================================================== */

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

/* ====================================================
   Connection Wrappers
   ==================================================== */

export interface StudioConnection {
  nodes: Studio[];
}

export interface CharacterConnection {
  nodes: Character[];
}

export interface RelationConnection {
  edges: Relation[];
}

export interface RecommendationConnection {
  nodes: Recommendation[];
}

/* ====================================================
   Main Media Type
   ==================================================== */

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

/* ====================================================
   Schedule Types
   ==================================================== */

export interface AiringSchedule {
  id: number;
  airingAt: number;
  timeUntilAiring: number;
  episode: number;
  media: AnimeMedia;
}

/* ====================================================
   Response Types
   ==================================================== */

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

/* ====================================================
   Utility Types
   ==================================================== */

export interface AnilistResponse<T> {
  data: T;
}

export interface PaginationParams extends Partial<GraphQLVariables> {
  page?: number;
  perPage?: number;
}

/**
 * Extended type for media with airing schedule information.
 */
export interface ScheduleItem extends AnimeMedia {
  airingAt: number;
  episode: number;
  airingTime: string;
}

/**
 * Type for premiere information.
 * Adjust episodes/duration to a unified type if possible.
 */
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
