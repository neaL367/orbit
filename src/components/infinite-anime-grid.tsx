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
  // State for managing the retry delay (in seconds)
  const [retryDelay, setRetryDelay] = useState<number | null>(null);
  // Track retry attempts for different error types
  const [retryAttempts, setRetryAttempts] = useState<{ [key: string]: number }>(
    {
      rateLimit: 0,
      serverError: 0,
      other: 0,
    }
  );
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Maximum number of retries for different error types
  const MAX_SERVER_ERROR_RETRIES = 3;

  const loadMoreAnime = useCallback(async () => {
    // Only proceed if we're not loading, there is a next page, and we're not in a retry delay.
    if (isLoading || !hasNextPage || retryDelay) return;

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

        // Reset retry attempts on successful load
        setRetryAttempts({
          rateLimit: 0,
          serverError: 0,
          other: 0,
        });
      } else {
        setHasNextPage(false);
      }
    } catch (error) {
      console.error("Failed to load more anime:", error);

      if (
        error instanceof Error &&
        (error.message.includes("rate limit") ||
          error.message.includes("429") ||
          error.message.includes("too many requests"))
      ) {
        // Rate limit error handling
        const delaySeconds = 30;
        setRetryDelay(delaySeconds);
        setError(`Rate limited. Retrying in ${delaySeconds} seconds...`);
        setRetryAttempts((prev) => ({
          ...prev,
          rateLimit: prev.rateLimit + 1,
        }));
      } else if (error instanceof Error && error.message.includes("500")) {
        // Server error handling with exponential backoff
        const attempts = retryAttempts.serverError + 1;
        setRetryAttempts((prev) => ({
          ...prev,
          serverError: attempts,
        }));

        if (attempts <= MAX_SERVER_ERROR_RETRIES) {
          // Calculate exponential backoff: 2^attempts seconds (2, 4, 8, etc.)
          const backoffSeconds = Math.min(Math.pow(2, attempts), 60); // Cap at 60 seconds
          setRetryDelay(backoffSeconds);
          setError(
            `Server error (500). Automatic retry ${attempts}/${MAX_SERVER_ERROR_RETRIES} in ${backoffSeconds} seconds...`
          );
        } else {
          setError(
            "Server error (500): Maximum retry attempts reached. Please try again later or refresh the page."
          );
        }
      } else {
        // Other errors
        setRetryAttempts((prev) => ({
          ...prev,
          other: prev.other + 1,
        }));
        setError(
          error instanceof Error
            ? `Failed to load more anime: ${error.message}`
            : "Failed to load more anime. Please try again later."
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    hasNextPage,
    isLoading,
    loadMoreFunction,
    page,
    retryDelay,
    retryAttempts,
  ]);

  // Effect to handle retry countdown
  useEffect(() => {
    if (retryDelay === null) return;
    if (retryDelay <= 0) {
      setRetryDelay(null);
      loadMoreAnime();
      return;
    }
    const timer = setTimeout(() => {
      setRetryDelay((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [retryDelay, loadMoreAnime]);

  // Set up intersection observer to detect when user scrolls to the bottom
  useEffect(() => {
    if (!hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && !error) {
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

  // Function to handle manual refresh of the entire component
  const handleRefresh = () => {
    window.location.reload();
  };

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
              {error ||
                `Retrying in ${retryDelay} second${
                  retryDelay > 1 ? "s" : ""
                }...`}
            </p>
          </div>
        )}
        {error && retryDelay === null && (
          <div className="text-center text-red-500 py-4">
            <p>{error}</p>
            <div className="flex gap-2 justify-center mt-2">
              <button
                onClick={() => loadMoreAnime()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
              {error.includes("500") &&
                retryAttempts.serverError >= MAX_SERVER_ERROR_RETRIES && (
                  <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
                  >
                    Refresh Page
                  </button>
                )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
