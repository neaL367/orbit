"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";

import { AnimeCard } from "./anime-card";
import type { AnimeMedia } from "@/lib/types";

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
  const [retryMessage, setRetryMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset state when initialData changes (e.g., when filters change)
    setItems(initialData);
    setPage(1);
    setHasMore(true);
    setErrorMessage(null);
  }, [initialData]);

  useEffect(() => {
    const loadMoreItems = async () => {
      if (isLoading || !hasMore) return;

      setIsLoading(true);
      let retryCount = 0;
      const MAX_RETRIES = 3;

      const attemptFetch = async () => {
        try {
          const nextPage = page + 1;
          const newItems = await fetchNextPage(nextPage);

          if (newItems.length === 0) {
            setHasMore(false);
          } else {
            setItems((prevItems) => [...prevItems, ...newItems]);
            setPage(nextPage);
          }
          return true;
        } catch (error) {
          // Check if it's a rate limit error
          if (error instanceof Error && error.message.includes("429")) {
            if (retryCount < MAX_RETRIES) {
              retryCount++;
              // Exponential backoff
              const delay = 1000 * Math.pow(2, retryCount);
              console.log(
                `Rate limited. Retrying in ${
                  delay / 1000
                } seconds... (Attempt ${retryCount}/${MAX_RETRIES})`
              );

              // Show retry message to user
              setRetryMessage(
                `Rate limited. Retrying in ${delay / 1000} seconds...`
              );

              await new Promise((resolve) => setTimeout(resolve, delay));
              return false; // Retry
            }
          }
          console.error("Error loading more items:", error);
          setHasMore(false);
          setErrorMessage("Failed to load more items. Please try again later.");
          return true; // Don't retry for other errors
        }
      };

      let success = false;
      while (!success && retryCount <= MAX_RETRIES) {
        success = await attemptFetch();
      }

      setIsLoading(false);
      setRetryMessage(null);
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
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-lg text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {items.map((item, index) => (
          <AnimeCard
            key={`${item.id}-${index}`}
            anime={item}
            index={showRanking ? index : undefined}
          />
        ))}
      </div>

      {errorMessage && (
        <div className="flex items-center justify-center gap-2 py-4 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p>{errorMessage}</p>
        </div>
      )}

      <div ref={loadMoreRef} className="flex justify-center py-8">
        {isLoading && (
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{retryMessage || "Loading more..."}</span>
          </div>
        )}
        {!hasMore && items.length > 0 && (
          <p className="text-muted-foreground">No more items to load</p>
        )}
      </div>
    </div>
  );
}
