"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

import { AnimeCard } from "./anime-card";
import type { AnimeMedia } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface InfiniteScrollListProps {
  initialData: AnimeMedia[];
  fetchNextPage: (page: number) => Promise<AnimeMedia[]>;
  emptyMessage?: string;
  showRanking?: boolean;
}

export function InfiniteScrollList({
  initialData,
  fetchNextPage,
  emptyMessage = "No results found",
  showRanking = false,
}: InfiniteScrollListProps) {
  const [items, setItems] = useState<AnimeMedia[]>(initialData);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset state when initialData changes (e.g., when filters change)
    setItems(initialData);
    setPage(1);
    setHasMore(true);
  }, [initialData]);

  useEffect(() => {
    const loadMoreItems = async () => {
      if (isLoading || !hasMore) return;

      setIsLoading(true);
      try {
        const nextPage = page + 1;
        const newItems = await fetchNextPage(nextPage);

        if (newItems.length === 0) {
          setHasMore(false);
        } else {
          setItems((prevItems) => [...prevItems, ...newItems]);
          setPage(nextPage);
        }
      } catch (error) {
        console.error("Error loading more items:", error);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    };

    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && !isLoading) {
        loadMoreItems();
      }
    };

    const currentRef = loadMoreRef.current;

    if (currentRef) {
      observerRef.current = new IntersectionObserver(handleObserver, {
        rootMargin: "150px",
      });
      observerRef.current.observe(currentRef);
    }

    return () => {
      if (observerRef.current && currentRef) {
        observerRef.current.unobserve(currentRef);
      }
    };
  }, [isLoading, hasMore, page, fetchNextPage]);

  if (items.length === 0 && !isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center bg-muted/30 rounded-xl">
        <div className="text-center max-w-md px-4">
          <p className="text-lg font-medium mb-2">{emptyMessage}</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filters to find what you&apos;re
            looking for
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Results</h2>
        <Badge variant="outline" className="rounded-full">
          {items.length} anime found
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-y-10 gap-x-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {items.map((item, index) => (
          <AnimeCard
            key={`${item.id}-${index}`}
            anime={item}
            index={showRanking ? index : undefined}
          />
        ))}
      </div>

      <div ref={loadMoreRef} className="flex justify-center py-8">
        {isLoading && (
          <div className="flex items-center gap-2 text-primary">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading more...</span>
          </div>
        )}
        {!hasMore && items.length > 0 && (
          <p className="text-muted-foreground px-4 py-2 bg-muted/30 rounded-full text-sm">
            You&apos;ve reached the end
          </p>
        )}
      </div>
    </div>
  );
}
