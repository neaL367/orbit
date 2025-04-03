import { Suspense } from "react";

import { fetchAllTimePopularAnime } from "@/lib/api";
import { InfiniteScrollList } from "@/components/infinite-scroll-list";

export const metadata = {
  title: "All-Time Popular Anime | Orbit",
  description: "Discover the most popular anime of all time on Orbit",
};

export default async function PopularPage() {
  const { media: initialData } = await fetchAllTimePopularAnime();

  return (
    <div className="">
      <section className="py-8">
        <h1 className="text-4xl font-bold mb-4">All Time Popular</h1>
        <p className="text-muted-foreground text-lg mb-6">
          Discover the most popular anime of all time
        </p>
      </section>

      <Suspense fallback={<PopularSkeleton />}>
        <InfiniteScrollList
          initialData={initialData}
          fetchNextPage={async (page) => {
            "use server";
            const { media } = await fetchAllTimePopularAnime(page);
            return media;
          }}
          emptyMessage="No popular anime found"
        />
      </Suspense>
    </div>
  );
}

function PopularSkeleton() {
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
