"use server";

import { MediaQueries } from "@/anilist/queries/media";
import { SearchQueries } from "@/anilist/queries/search";
import { GenreQueries } from "@/anilist/queries/genre";
import { AnilistResponse } from "../modal/common";
import { AnimeMedia } from "../modal/media";
import { PageResponse } from "../modal/response";

const perPage = 18;

async function handleAnimePagination<T>(
    fetchFn: () => Promise<AnilistResponse<T>>
): Promise<{ anime: AnimeMedia[]; hasNextPage: boolean }> {
    const data = await fetchFn();
    const anime = (data?.data as PageResponse)?.Page?.media || [];
    const hasNextPage = (data?.data as PageResponse)?.Page?.pageInfo?.hasNextPage || false;
    return { anime, hasNextPage };
}


export async function fetchMoreTrendingAnime(page: number) {
    return handleAnimePagination(() => MediaQueries.getTrending({ page, perPage }));
}

export async function fetchMorePopularAnime(page: number) {
    return handleAnimePagination(() => MediaQueries.getPopular({ page, perPage }));
}

export async function fetchMoreTopRatedAnime(page: number) {
    return handleAnimePagination(() => MediaQueries.getTopRated({ page, perPage }));
}

export async function fetchMoreSearchResults(query: string, page: number) {
    return handleAnimePagination(() =>
        SearchQueries.search({ query, page, perPage })
    );
}

export async function fetchMoreGenreAnime(genre: string, page: number) {
    return handleAnimePagination(() =>
        GenreQueries.getByGenre({ genre, page, perPage })
    );
}

export async function fetchMoreSeasonalAnime(season: string, year: number, page: number) {
    return handleAnimePagination(() =>
        MediaQueries.getSeasonal({ season, year, page, perPage })
    );
}
