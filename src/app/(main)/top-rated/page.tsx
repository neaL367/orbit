import { Suspense } from "react";

import { fetchTopRatedAnime } from "@/lib/api";
import { InfiniteScrollList } from "@/components/infinite-scroll-list";

export const metadata = {
  title: "Top Rated Anime | Orbit",
  description: "Discover the highest rated anime on Orbit",
};

export default async function TopRatedPage() {
  const { media: initialData } = await fetchTopRatedAnime();

  return (
    <div className="">
      <h1 className="mb-8 text-3xl font-bold">Top Rated Anime</h1>

      <Suspense fallback={<TopRatedSkeleton />}>
        <InfiniteScrollList
          initialData={initialData}
          fetchNextPage={async (page) => {
            "use server";
            const { media } = await fetchTopRatedAnime(page);
            return media;
          }}
          emptyMessage="No top rated anime found"
        />
      </Suspense>
    </div>
  );
}

function TopRatedSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className="aspect-[2/3] w-full animate-pulse rounded-md bg-muted"></div>
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted"></div>
          <div className="h-3 w-1/2 animate-pulse rounded bg-muted"></div>
        </div>
      ))}
    </div>
  );
}
