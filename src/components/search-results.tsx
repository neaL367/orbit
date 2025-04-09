"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@apollo/client";

import { SEARCH_ANIME_QUERY } from "@/app/graphql/queries/search";
import { AnimeCard } from "@/components/anime-card";
import { AnimeMedia } from "@/lib/types";
import SearchPageLoading from "@/app/(pages)/search/loading";

export function SearchResults({ query }: { query: string }) {
  const { data, loading, error, fetchMore } = useQuery(SEARCH_ANIME_QUERY, {
    variables: { search: query, page: 1, perPage: 20, isAdult: false },
    notifyOnNetworkStatusChange: true,
  });

  // Define refs with explicit types
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Local copy for the current node to ensure stability in cleanup
    const currentLoadMore = loadMoreRef.current;
    if (!currentLoadMore) return;

    // Define the callback with an explicit type for entries
    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && data?.Page?.pageInfo?.hasNextPage) {
        fetchMore({
          variables: { page: data.Page.pageInfo.currentPage + 1 },
          updateQuery: (previousResult, { fetchMoreResult }) => {
            if (!fetchMoreResult) return previousResult;
            return {
              Page: {
                __typename: previousResult.Page.__typename,
                pageInfo: fetchMoreResult.Page.pageInfo,
                media: [
                  ...previousResult.Page.media,
                  ...fetchMoreResult.Page.media,
                ],
              },
            };
          },
        });
      }
    };

    // Create observer and assign to observerRef.current
    observerRef.current = new IntersectionObserver(handleObserver, {
      rootMargin: "150px",
    });

    // Safe check before observing the node
    observerRef.current.observe(currentLoadMore);

    // Cleanup: unobserve the node if available
    return () => {
      if (observerRef.current && currentLoadMore) {
        observerRef.current.unobserve(currentLoadMore);
      }
    };
  }, [data, fetchMore]);

  if (loading && !data) return <SearchPageLoading />;
  if (error) return <p>Error: {error.message}</p>;

  const media = data.Page.media as AnimeMedia[];

  if (media.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-lg text-muted-foreground">
          No results found for &quot;{query}&quot;
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {media.map((item) => (
        <AnimeCard key={item.id} anime={item} />
      ))}
    </div>
  );
}
