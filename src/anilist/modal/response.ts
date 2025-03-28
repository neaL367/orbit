import { GraphQLVariables, PageInfo } from "./common";
import { AiringSchedule, AnimeMedia } from "./media";

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