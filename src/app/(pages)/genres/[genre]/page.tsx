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
          <h1 className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-primary via-purple-400 to-purple-400 bg-clip-text text-transparent">{genre} </span>
            | Anime
          </h1>
        </div>
      </div>

      <InfiniteScrollList
        initialData={initialData}
        fetchNextPage={async (page) => {
          "use server";
          const { media } = await fetchAnimeByGenre(genre, page);
          return media;
        }}
        emptyMessage={`No anime found for ${genre} genre`}
      />
    </div>
  );
}
