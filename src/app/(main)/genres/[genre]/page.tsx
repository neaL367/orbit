import { Suspense } from "react";
import { Tag } from "lucide-react";

import { fetchAnimeByGenre } from "@/lib/api";
import { InfiniteScrollList } from "@/components/infinite-scroll-list";
import { Navigation } from "@/components/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ genre: string }>;
}) {
  const { genre } = await params;
  return {
    title: `${genre} Anime | Orbit`,
    description: `Browse ${genre} anime on Orbit`,
  };
}

export default async function GenrePage({
  params,
}: {
  params: Promise<{ genre: string }>;
}) {
  const { genre } = await params;
  const { media: initialData } = await fetchAnimeByGenre(genre);

  return (
    <div className="">
      <div className="mb-8 flex items-center gap-4">
        <Navigation />
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          <h1 className="text-2xl font-bold">{genre} Anime</h1>
        </div>
      </div>

      <Suspense fallback={<GenreSkeleton />}>
        <InfiniteScrollList
          initialData={initialData}
          fetchNextPage={async (page) => {
            "use server";
            const { media } = await fetchAnimeByGenre(genre, page);
            return media;
          }}
          emptyMessage={`No anime found for ${genre} genre`}
        />
      </Suspense>
    </div>
  );
}

function GenreSkeleton() {
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
