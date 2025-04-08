"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import { ArrowLeft, Tag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AnimeMedia, PageInfo } from "@/lib/types";
import { AnimeCard } from "@/components/anime-card";
import { ANIME_BY_GENRE_QUERY } from "@/app/graphql/queries/genres";
import GenrePageLoading from "./loading";

export default function GenrePage() {
  const { genre } = useParams() as { genre: string };
  const decodedGenre = decodeURIComponent(genre);

  const { data, loading, error, fetchMore } = useQuery(ANIME_BY_GENRE_QUERY, {
    variables: {
      genre: decodedGenre,
      page: 1,
      perPage: 20,
      isAdult: false,
    },
    notifyOnNetworkStatusChange: true,
  });

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const current = loadMoreRef.current;
    if (!current || !data?.Page?.pageInfo?.hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchMore({
            variables: {
              page: data.Page.pageInfo.currentPage + 1,
            },
            updateQuery: (prev, { fetchMoreResult }) => {
              if (!fetchMoreResult) return prev;
              return {
                Page: {
                  __typename: prev.Page.__typename,
                  pageInfo: fetchMoreResult.Page.pageInfo,
                  media: [...prev.Page.media, ...fetchMoreResult.Page.media],
                },
              };
            },
          });
        }
      },
      { rootMargin: "150px" }
    );

    observer.observe(current);
    observerRef.current = observer;

    return () => {
      observerRef.current?.disconnect();
    };
  }, [data, fetchMore]);

  if (loading && !data) return <GenrePageLoading />;
  if (error) return <p>Error: {error.message}</p>;

  const media = data.Page.media as AnimeMedia[];
  const pageInfo = data.Page.pageInfo as PageInfo;

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

      <div className="grid grid-cols-2 gap-y-10 gap-x-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {media.map((anime) => (
          <AnimeCard key={anime.id} anime={anime} />
        ))}
      </div>

      <div ref={loadMoreRef} className="flex justify-center py-8">
        {loading && (
          <div className="flex items-center gap-2 text-primary">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-muted-foreground">Loading more...</span>
          </div>
        )}
        {!pageInfo.hasNextPage && media.length > 0 && (
          <p className="text-muted-foreground px-4 py-2 bg-muted/30 rounded-full text-sm">
            You’ve reached the end
          </p>
        )}
      </div>
    </div>
  );
}
