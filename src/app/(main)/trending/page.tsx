import { Suspense } from "react";

import { fetchTrendingAnime } from "@/lib/api";
import { InfiniteScrollList } from "@/components/infinite-scroll-list";

export const metadata = {
  title: "Trending Anime | Orbit",
  description: "Discover trending anime on Orbit",
};

export default async function TrendingPage() {
  const { media: initialData } = await fetchTrendingAnime();

  return (
    <div className="">
      <section className="py-8">
        <h1 className="text-4xl font-bold mb-4">Trending Anime</h1>
        <p className="text-muted-foreground text-lg mb-6">
          Discover trending anime
        </p>
      </section>

      <Suspense fallback={<TrendingSkeleton />}>
        <InfiniteScrollList
          initialData={initialData}
          fetchNextPage={async (page) => {
            "use server";
            const { media } = await fetchTrendingAnime(page);
            return media;
          }}
          emptyMessage="No trending anime found"
        />
      </Suspense>
    </div>
  );
}

function TrendingSkeleton() {
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
