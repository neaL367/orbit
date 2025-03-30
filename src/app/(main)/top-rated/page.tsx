import { Suspense } from "react";
import { InfiniteAnimeGrid } from "@/components/infinite-anime-grid";
import { LoadingAnimeGrid } from "@/components/loading-anime";
import { MediaQueries } from "@/anilist/queries/media";
import { fetchMoreTopRatedAnime } from "@/anilist/actions/anime-actions";

interface TopRatedPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function TopRatedPage(props: TopRatedPageProps) {
  const searchParams = await props.searchParams;
  const page = Number.parseInt(searchParams.page || "1", 10);
  const perPage = 18;

  const data = await MediaQueries.getTopRated({ page, perPage });
  const animeList = data?.data?.Page?.media || [];
  const hasNextPage = data?.data?.Page?.pageInfo?.hasNextPage || false;

  return (
    <div className="">
      <h1 className="mb-8 text-3xl font-bold">Top Rated Anime</h1>

      <Suspense fallback={<LoadingAnimeGrid count={perPage} />}>
        <InfiniteAnimeGrid 
          initialAnime={animeList} 
          initialHasNextPage={hasNextPage}
          loadMoreFunction={fetchMoreTopRatedAnime}
          showRank={true}
        />
      </Suspense>
    </div>
  );
}
