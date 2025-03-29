"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import AnimeCard from "@/components/anime/anime-card";
import { LoadingSpinner } from "@/components/loading-anime";
import type { AnimeMedia } from "@/anilist/modal/media";

interface InfiniteAnimeGridProps {
  initialAnime: AnimeMedia[];
  initialHasNextPage: boolean;
  loadMoreFunction: (page: number) => Promise<{
    anime: AnimeMedia[];
    hasNextPage: boolean;
  }>;
  showRank?: boolean;
  maxItems?: number;
  initialPage?: number;
}

export function InfiniteAnimeGrid({
  initialAnime,
  initialHasNextPage,
  loadMoreFunction,
  showRank = false,
  initialPage = 1,
}: InfiniteAnimeGridProps) {
  const [anime, setAnime] = useState<AnimeMedia[]>(initialAnime);
  const [page, setPage] = useState(initialPage);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // New state for managing the retry delay (in seconds)
  const [retryDelay, setRetryDelay] = useState<number | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const totalLoadedRef = useRef<number>(initialAnime.length);

  const loadMoreAnime = useCallback(async () => {
    // If we're already waiting for a retry, don't attempt another load.
    if (isLoading || !hasNextPage || totalLoadedRef.current || retryDelay)
      return;

    setIsLoading(true);
    setError(null);

    try {
      const nextPage = page + 1;
      const result = await loadMoreFunction(nextPage);

      // Validate the result to ensure it has the expected structure
      if (!result || typeof result !== "object") {
        throw new Error("Invalid response format");
      }

      const resultAnime = result.anime || [];

      if (resultAnime.length > 0) {
        setAnime((prev) => [...prev, ...resultAnime]);
        setPage(nextPage);
        setHasNextPage(!!result.hasNextPage);
        totalLoadedRef.current += resultAnime.length;
      } else {
        setHasNextPage(false);
      }
    } catch (error) {
      console.error("Failed to load more anime:", error);
      // Check if the error message indicates a rate limit issue
      if (
        error instanceof Error &&
        (error.message.includes("rate limit") ||
          error.message.includes("429") ||
          error.message.includes("too many requests"))
      ) {
        // Ideally, your API helper would provide the delay in the error object.
        // Here we default to 30 seconds if no specific delay is provided.
        const delaySeconds = 30;
        setRetryDelay(delaySeconds);
        setError(`Rate limited. Retrying in ${delaySeconds} seconds...`);
      } else {
        setError(
          error instanceof Error
            ? `Failed to load more anime: ${error.message}`
            : "Failed to load more anime. Please try again later."
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [hasNextPage, isLoading, loadMoreFunction, page, retryDelay]);

  // Effect to handle retry countdown
  useEffect(() => {
    if (retryDelay === null) return;
    if (retryDelay <= 0) {
      setRetryDelay(null);
      loadMoreAnime();
      return;
    }
    const timer = setTimeout(
      () => setRetryDelay((prev) => (prev !== null ? prev - 1 : null)),
      1000
    );
    return () => clearTimeout(timer);
  }, [retryDelay, loadMoreAnime]);

  // Set up intersection observer to detect when user scrolls to the bottom
  useEffect(() => {
    if (!hasNextPage || totalLoadedRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasNextPage &&
          !isLoading &&
          totalLoadedRef.current &&
          !error // Don't try to load more if there's an error
        ) {
          loadMoreAnime();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    const currentLoadMoreElement = loadMoreRef.current;

    if (currentLoadMoreElement) {
      observer.observe(currentLoadMoreElement);
    }

    return () => {
      if (currentLoadMoreElement) {
        observer.unobserve(currentLoadMoreElement);
      }
      observer.disconnect();
    };
  }, [hasNextPage, isLoading, loadMoreAnime, error]);

  return (
    <>
      <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {anime.map((animeItem, index) => (
          <div key={`${animeItem.id}-${index}`} className="relative">
            {showRank && (
              <div
                className="absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center font-bold z-10 text-white shadow"
                style={{
                  backgroundColor: animeItem.coverImage?.color ?? "#3b82f6",
                }}
              >
                {index + 1}
              </div>
            )}
            <AnimeCard anime={animeItem} />
          </div>
        ))}
      </div>

      {/* Loading indicator, retry message and intersection observer target */}
      <div
        ref={loadMoreRef}
        className="mt-8 flex flex-col items-center justify-center"
      >
        {isLoading && !error && (
          <div className="flex items-center justify-center p-4">
            <LoadingSpinner />
            <span className="ml-2 text-sm text-muted-foreground">
              Loading more anime...
            </span>
          </div>
        )}
        {retryDelay !== null && (
          <div className="text-center text-orange-500 py-4">
            <p>
              Rate limited. Retrying in {retryDelay} second
              {retryDelay > 1 ? "s" : ""}...
            </p>
          </div>
        )}
        {error && retryDelay === null && (
          <div className="text-center text-red-500 py-4">
            <p>{error}</p>
            <button
              onClick={() => loadMoreAnime()}
              className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </>
  );
}
