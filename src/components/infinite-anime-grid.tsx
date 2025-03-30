"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import AnimeCard from "@/components/anime/anime-card";
import { LoadingSpinner } from "@/components/loading-anime";
import type { AnimeMedia } from "@/anilist/modal/media";

interface RetryState {
  count: number;
  delay: number | null;
  message: string | null;
  type: "rateLimit" | "serverError" | "other" | null;
}

interface InfiniteAnimeGridProps {
  initialAnime: AnimeMedia[];
  initialHasNextPage: boolean;
  loadMoreFunction: (page: number) => Promise<{
    anime: AnimeMedia[];
    hasNextPage: boolean;
  }>;
  showRank?: boolean;
  initialPage?: number;
  loadingThreshold?: number;
  loadingMargin?: string;
}

export function InfiniteAnimeGrid({
  initialAnime,
  initialHasNextPage,
  loadMoreFunction,
  showRank = false,
  initialPage = 1,
  loadingThreshold = 0.1,
  loadingMargin = "100px",
}: InfiniteAnimeGridProps) {
  const [anime, setAnime] = useState(initialAnime);
  const [page, setPage] = useState(initialPage);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retry, setRetry] = useState<RetryState>({
    count: 0,
    delay: null,
    message: null,
    type: null,
  });

  // Configuration constants
  const MAX_RETRIES = 3;
  const BASE_RETRY_DELAY = 1; // seconds
  const MAX_RETRY_DELAY = 60; // seconds

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  // Memoized animated anime calculation for better performance
  const memoizedAnime = useMemo(() => anime, [anime]);

  // Function to calculate backoff delay based on retry count and type
  const calculateBackoffDelay = useCallback(
    (retryCount: number, type: RetryState["type"]) => {
      if (type === "rateLimit") {
        return 30; // Fixed delay for rate limits
      }
      // Exponential backoff with jitter for other errors
      const baseDelay = Math.min(
        Math.pow(2, retryCount) * BASE_RETRY_DELAY,
        MAX_RETRY_DELAY
      );
      // Add some randomness to prevent thundering herd problem
      return baseDelay + Math.random() * baseDelay * 0.2;
    },
    []
  );

  // Load more anime with improved error handling
  const loadMoreAnime = useCallback(async () => {
    // Don't load if already loading, no more pages, or during retry countdown
    if (isLoading || !hasNextPage || retry.delay !== null) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const nextPage = page + 1;
      const result = await loadMoreFunction(nextPage);

      // Validate response
      if (!result || typeof result !== "object") {
        throw new Error("Invalid response format");
      }

      // Update state with new anime
      const resultAnime = result.anime || [];
      if (resultAnime.length > 0) {
        setAnime((prev) => [...prev, ...resultAnime]);
        setPage(nextPage);
        setHasNextPage(!!result.hasNextPage);
        // Reset retry state on success
        setRetry({
          count: 0,
          delay: null,
          message: null,
          type: null,
        });
      } else {
        setHasNextPage(false);
      }
    } catch (error) {
      console.error("Failed to load more anime:", error);

      // Determine error type and handle accordingly
      let errorType: RetryState["type"] = "other";
      let errorMsg = "Failed to load. Try again later.";

      if (error instanceof Error) {
        const errorText = error.message.toLowerCase();

        if (
          errorText.includes("rate limit") ||
          errorText.includes("429") ||
          errorText.includes("too many requests")
        ) {
          errorType = "rateLimit";
          errorMsg = "Rate limit reached.";
        } else if (errorText.includes("500")) {
          errorType = "serverError";
          errorMsg = "Server error occurred.";
        } else {
          errorMsg = `Error: ${error.message}`;
        }
      }

      // Update retry state
      const newRetryCount = retry.count + 1;
      const maxRetriesReached = newRetryCount > MAX_RETRIES;

      // Only set up retry delay if we haven't reached max retries
      if (!maxRetriesReached) {
        const delaySeconds = calculateBackoffDelay(newRetryCount, errorType);
        setRetry({
          count: newRetryCount,
          delay: delaySeconds,
          message: `${errorMsg} Retrying in ${Math.round(delaySeconds)}s...`,
          type: errorType,
        });
      } else {
        setRetry({
          count: newRetryCount,
          delay: null,
          message: `${errorMsg} Max retries reached.`,
          type: errorType,
        });
      }

      setErrorMessage(
        maxRetriesReached
          ? `${errorMsg} Please refresh or try again later.`
          : errorMsg
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    hasNextPage,
    isLoading,
    loadMoreFunction,
    page,
    retry.count,
    retry.delay,
    calculateBackoffDelay,
  ]);

  // Countdown timer for retry delay
  useEffect(() => {
    if (retry.delay === null || retry.delay <= 0) {
      if (retry.delay === 0) {
        setRetry((prev) => ({ ...prev, delay: null }));
        loadMoreAnime();
      }
      return;
    }

    const timer = setTimeout(() => {
      setRetry((prev) => ({
        ...prev,
        delay: prev.delay !== null ? Math.max(0, prev.delay - 1) : null,
        message:
          prev.delay !== null && prev.delay > 1
            ? `${
                prev.message?.split("Retrying")[0] || ""
              } Retrying in ${Math.round(prev.delay - 1)}s...`
            : "Retrying now...",
      }));
    }, 1000);

    return () => clearTimeout(timer);
  }, [retry.delay, loadMoreAnime]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (!hasNextPage) return;

    // Clean up old observer if it exists
    if (observer.current) {
      observer.current.disconnect();
    }

    // Create new observer
    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && !errorMessage) {
          loadMoreAnime();
        }
      },
      { threshold: loadingThreshold, rootMargin: loadingMargin }
    );

    // Observe loading element
    const el = loadMoreRef.current;
    if (el) observer.current.observe(el);

    // Cleanup function
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [
    hasNextPage,
    isLoading,
    loadMoreAnime,
    errorMessage,
    loadingThreshold,
    loadingMargin,
  ]);

  // Triggers a full page refresh
  const handleRefresh = useCallback(() => window.location.reload(), []);

  // Render UI
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 animate-fadeIn">
        {memoizedAnime.map((animeItem, index) => (
          <div
            key={`${animeItem.id}-${index}`}
            className="relative transition-transform hover:scale-105 duration-200"
          >
            {showRank && (
              <div
                className="z-10 absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow"
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

      <div ref={loadMoreRef} className="mt-4 flex flex-col items-center">
        {/* Loading state */}
        {isLoading && !errorMessage && (
          <div className="flex items-center p-4 animate-pulse">
            <LoadingSpinner />
            <span className="ml-2 text-sm text-muted-foreground">
              Loading more anime...
            </span>
          </div>
        )}

        {/* Retry countdown */}
        {retry.delay !== null && (
          <div className="text-center text-amber-500 py-4 px-6 bg-amber-50 dark:bg-amber-950/30 rounded-lg shadow-sm">
            <p>{retry.message}</p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-1 mt-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full transition-all duration-1000 ease-linear"
                style={{
                  width: `${
                    (1 -
                      retry.delay /
                        calculateBackoffDelay(retry.count, retry.type)) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Error state */}
        {errorMessage && retry.delay === null && (
          <div className="text-center py-4 px-6 bg-red-50 dark:bg-red-950/30 rounded-lg shadow-sm">
            <p className="text-red-500">{errorMessage}</p>
            <div className="flex gap-2 justify-center mt-4">
              <button
                onClick={loadMoreAnime}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
              {retry.count >= MAX_RETRIES && (
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

        {/* End message when no more data */}
        {!hasNextPage && anime.length > 0 && !isLoading && !errorMessage && (
          <div className="text-center text-muted-foreground py-4">
            <p>That&apos;s all for now! ✨</p>
          </div>
        )}
      </div>
    </div>
  );
}
