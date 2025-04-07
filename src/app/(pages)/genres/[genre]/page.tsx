import { ArrowLeft, Tag } from "lucide-react";

import { InfiniteScrollList } from "@/components/infinite-scroll-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getGenreBySlug } from "@/app/services/genres-anime";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ genre: string }>;
}) {
  const { genre } = await params;
  const decodedGenre = decodeURIComponent(genre);

  return {
    title: `${decodedGenre} Anime | Orbit`,
    description: `Browse ${decodedGenre}} anime on Orbit`,
  };
}

export default async function GenrePage({
  params,
}: {
  params: Promise<{ genre: string }>;
}) {
  const { genre } = await params;
  const decodedGenre = decodeURIComponent(genre); 
  const { media: initialData } = await getGenreBySlug(decodedGenre);

  return (
    <div className="">
      <div className="mb-8 flex items-center space-x-10">
        <Button variant="outline" size="icon" asChild className="rounded-full">
          <Link href="/genres">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to genres</span>
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">
            <span className="">{decodedGenre} </span>
            Anime
          </h1>
        </div>
      </div>

      <InfiniteScrollList
        initialData={initialData}
        fetchNextPage={async (page) => {
          "use server";
          const { media } = await getGenreBySlug(decodedGenre, page);
          return media;
        }}
        emptyMessage={`No anime found for ${genre} genre`}
      />
    </div>
  );
}
