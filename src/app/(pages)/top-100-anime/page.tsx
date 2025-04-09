"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@apollo/client";
import { Loader2, Star } from "lucide-react";

import { TOP_RATED_ANIME_QUERY } from "@/app/graphql/queries/top-rated";

import { Badge } from "@/components/ui/badge";
import { AnimeMedia, PageInfo } from "@/lib/types";
import { AnimeCard } from "@/components/anime-card";

import TopRatedPageLoading from "./loading";

export default function TopRatedPage() {
  const { data, loading, error, fetchMore } = useQuery(TOP_RATED_ANIME_QUERY, {
    variables: { page: 1, perPage: 20, isAdult: false },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data?.Page?.pageInfo?.hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (
          entry.isIntersecting &&
          !loading &&
          data?.Page?.pageInfo?.hasNextPage
        ) {
          fetchMore({
            variables: { page: data.Page.pageInfo.currentPage + 1 },
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
      { rootMargin: "200px" }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [data, loading, fetchMore]);

  if (loading && !data) return <TopRatedPageLoading />;
  if (error) return <p>Error: {error.message}</p>;

  const media = data.Page.media as AnimeMedia[];
  const pageInfo = data.Page.pageInfo as PageInfo;

  return (
    <div className="">
      <section className="py-8">
        <div className="flex items-center gap-2 mb-2">
          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          <h1 className="text-2xl font-bold text-white">Top 100 Anime</h1>
        </div>
        <p className="text-muted-foreground text-lg mb-8 max-w-2xl">
          Explore the highest rated anime of all time, ranked by average user
          scores
        </p>
      </section>

      <div className="flex justify-between items-center mb-4">
        <Badge variant="outline" className="rounded-full">
          {pageInfo.total} anime found
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-y-10 gap-x-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {media.map((anime, index) => (
          <AnimeCard key={`${anime.id}`} anime={anime} index={index} />
        ))}
      </div>

      {/* This div is observed to trigger fetchMore */}
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
