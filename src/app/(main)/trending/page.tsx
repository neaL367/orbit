import { Suspense } from "react";
import AnimeCard from "@/components/anime/anime-card";
import Pagination from "@/components/pagination";
import { LoadingAnimeGrid } from "@/components/loading-anime";
import { MediaQueries } from "@/anilist/queries/media";

export const experimental_ppr = true;
interface TrendingPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function TrendingPage(props: TrendingPageProps) {
  const searchParams = await props.searchParams;
  const page = Number.parseInt(searchParams.page || "1", 10);
  const perPage = 18;

  const data = await MediaQueries.getTrending({ page, perPage });
  const animeList = data?.data?.Page?.media || [];
  const pageInfo = data?.data?.Page?.pageInfo || {
    currentPage: 1,
    lastPage: 1,
    hasNextPage: false,
  };

  return (
    <main className="mt-24 mb-24">
      <h1 className="mb-8 text-3xl font-bold">Trending Anime</h1>

      <Suspense fallback={<LoadingAnimeGrid count={perPage} />}>
        <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {animeList.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      </Suspense>

      <Pagination
        currentPage={pageInfo.currentPage}
        totalPages={pageInfo.lastPage}
        hasNextPage={pageInfo.hasNextPage}
      />
    </main>
  );
}
