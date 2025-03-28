import { Suspense } from "react";
import { MediaQueries } from "@/anilist/queries/media";
import { LoadingAnimeGrid } from "@/components/loading-anime";
import { TopRatedContent } from "@/components/top-rated/top-rated-content";


export default async function TopRatedPage() {
  // Initial fetch of first 20 anime
  const topRatedData = await MediaQueries.getTopRated({
    page: 1,
    perPage: 20,
  });
  const initialAnime = topRatedData?.data?.Page?.media || [];
  const hasNextPage = topRatedData?.data?.Page?.pageInfo?.hasNextPage || false;

  return (
    <div className="">
      <h1 className="text-3xl font-bold mb-8">Top 100 Anime</h1>

      <Suspense fallback={<LoadingAnimeGrid count={20} />}>
        <TopRatedContent
          initialAnime={initialAnime}
          initialHasNextPage={hasNextPage}
        />
      </Suspense>
    </div>
  );
}
