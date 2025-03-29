import { Suspense } from "react";
import { InfiniteAnimeGrid } from "@/components/infinite-anime-grid";
import { LoadingAnimeGrid } from "@/components/loading-anime";
import { MediaQueries } from "@/anilist/queries/media";
import { getCurrentSeason } from "@/anilist/utils/formatters";
import { SeasonalFilters } from "@/components/seasonal/seasonal-filters";
import { fetchMoreSeasonalAnime } from "@/anilist/actions/anime-actions";

interface SeasonalPageProps {
  searchParams: Promise<{
    season?: string;
    year?: string;
    page?: string;
  }>;
}

export default async function SeasonalPage(props: SeasonalPageProps) {
  const searchParams = await props.searchParams;
  const currentSeason = getCurrentSeason();
  const season = (searchParams.season || currentSeason.season).toUpperCase();
  const year = Number.parseInt(
    searchParams.year || currentSeason.year.toString(),
    10
  );
  const page = Number.parseInt(searchParams.page || "1", 10);
  const perPage = 18;

  const data = await MediaQueries.getSeasonal({
    season,
    year,
    page,
    perPage,
  });
  const animeList = data?.data?.Page?.media || [];
  const pageInfo = data?.data?.Page?.pageInfo || {
    currentPage: 1,
    lastPage: 1,
    hasNextPage: false,
    total: 0,
  };

  // Generate years for dropdown (5 years back, 2 years forward)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 8 }, (_, i) => currentYear - 5 + i);

  // Format season for display
  const formattedSeason = season.charAt(0) + season.slice(1).toLowerCase();

  // Create a server action wrapper that captures the season and year
  async function loadMoreAnimeForSeason(page: number) {
    "use server";
    return fetchMoreSeasonalAnime(season, year, page);
  }

  return (
    <div className="">
      <h1 className="mb-2 text-3xl font-bold">
        {formattedSeason} {year} Anime
      </h1>
      <p className="mb-8 text-muted-foreground">
        Found {pageInfo.total || 0} anime this season
      </p>

      <SeasonalFilters
        currentSeason={season.toLowerCase()}
        currentYear={year}
        years={years}
      />

      <Suspense fallback={<LoadingAnimeGrid count={perPage} />}>
        <InfiniteAnimeGrid
          initialAnime={animeList}
          initialHasNextPage={pageInfo.hasNextPage}
          loadMoreFunction={loadMoreAnimeForSeason}
          initialPage={page}
        />
      </Suspense>
    </div>
  );
}
