"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import AnimeCard from "@/components/anime/anime-card";
import { LoadingSpinner } from "../loading-anime";
import { fetchMoreTopRatedAnime } from "./action";
import { AnimeMedia } from "@/anilist/modal/media";

interface TopRatedAnimeListProps {
  initialAnime: AnimeMedia[];
  initialHasNextPage: boolean;
}

export function TopRatedContent({
  initialAnime,
  initialHasNextPage,
}: TopRatedAnimeListProps) {
  const [anime, setAnime] = useState<AnimeMedia[]>(initialAnime);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [isLoading, setIsLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const totalLoadedRef = useRef<number>(initialAnime.length);

  // Load more anime when the user scrolls to the bottom
  const loadMoreAnime = useCallback(async () => {
    if (isLoading || !hasNextPage || totalLoadedRef.current >= 100) return;

    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const result = await fetchMoreTopRatedAnime(nextPage);

      if (result.anime.length > 0) {
        setAnime((prev) => [...prev, ...result.anime]);
        setPage(nextPage);
        setHasNextPage(result.hasNextPage);
        totalLoadedRef.current += result.anime.length;
      } else {
        setHasNextPage(false);
      }
    } catch (error) {
      console.error("Failed to load more anime:", error);
    } finally {
      setIsLoading(false);
    }
  }, [hasNextPage, isLoading, page]);

  // Set up intersection observer to detect when user scrolls to the bottom
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasNextPage &&
          totalLoadedRef.current < 100
        ) {
          loadMoreAnime();
        }
      },
      { threshold: 0.1 }
    );

    // Store the current value of the ref
    const currentLoadMoreElement = loadMoreRef.current;

    if (currentLoadMoreElement) {
      observer.observe(currentLoadMoreElement);
    }

    return () => {
      // Use the stored value in the cleanup function
      if (currentLoadMoreElement) {
        observer.unobserve(currentLoadMoreElement);
      }
    };
  }, [hasNextPage, loadMoreAnime]);

  return (
    <>
      <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {anime.map((anime, index) => (
          <div key={anime.id} className="relative">
            <div
              className="absolute z-10 -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow"
              style={{
                backgroundColor: anime.coverImage?.color ?? "#3b82f6",
              }}
            >
              {index + 1}
            </div>
            <AnimeCard anime={anime} />
          </div>
        ))}
      </div>

      {/* Loading indicator and intersection observer target */}
      <div ref={loadMoreRef} className="mt-8 flex justify-center">
        {isLoading && (
          <div className="flex items-center justify-center p-4">
            <LoadingSpinner />
            <span className="ml-2 text-sm text-gray-400">
              Loading more anime...
            </span>
          </div>
        )}
        {!hasNextPage && totalLoadedRef.current >= 100 && (
          <p className="text-center text-gray-400 py-4">
            You&apos;ve reached the end of the Top 100 Anime list!
          </p>
        )}
      </div>
    </>
  );
}
