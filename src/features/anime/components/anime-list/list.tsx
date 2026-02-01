"use client";

import { Suspense, useMemo, useCallback, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAnimeList } from "@/features/anime/hooks/use-anime-list";
import { ListView } from "./view";
import { Error, Loading } from "./";
import type { Route } from "next";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";

type SortType = "trending" | "popular" | "top-rated" | "seasonal" | "search";

function getPageTitle(
  sort: SortType,
  search?: string,
  season?: string,
  year?: string
): string {
  if (sort === "search" && search) {
    return `Search: ${search}`;
  }
  switch (sort) {
    case "trending":
      return "Trending Now";
    case "popular":
      return "All Time Popular";
    case "top-rated":
      return "Top 100";
    case "seasonal":
      if (season && year) {
        const capitalizedSeason =
          season.charAt(0).toUpperCase() + season.slice(1).toLowerCase();
        return `${capitalizedSeason} ${year} Anime`;
      }
      return "Seasonal Anime";
    default:
      return "Anime";
  }
}

function AnimeListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sort = (searchParams.get("sort") || "trending") as SortType;
  const searchQuery = searchParams.get("search") || "";
  const season = searchParams.get("season") || undefined;
  const year = searchParams.get("year") || undefined;

  const [searchInput, setSearchInput] = useState(searchQuery);
  const { show, scrollToTop } = useScrollToTop(400);

  const {
    animeList,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    showRank,
    perPage,
  } = useAnimeList();

  const title = useMemo(
    () => getPageTitle(sort, searchQuery, season, year),
    [sort, searchQuery, season, year]
  );

  const handleSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("search", value.trim());
      params.set("sort", "search");
    } else {
      params.delete("search");
      params.delete("sort");
    }
    params.delete("page");
    router.push(`/anime?${params.toString()}` as Route);
  }, 300);

  const handleLoadMore = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (error) {
    return <Error onRetry={() => refetch()} />;
  }

  return (
    <>
      <ListView
        data={animeList}
        title={title}
        searchInput={searchInput}
        onSearchChange={(value) => {
          setSearchInput(value);
          handleSearch(value);
        }}
        showRank={showRank}
        onLoadMore={handleLoadMore}
        isLoadingMore={isFetchingNextPage}
        hasMore={hasNextPage}
        isEmpty={!isLoading && animeList.length === 0}
        isLoading={isLoading && animeList.length === 0}
        loadingCount={perPage}
      />

      {/* Scroll to Top Button */}
      <Button
        onClick={scrollToTop}
        className={cn(
          "fixed bottom-8 right-8 z-50 h-12 w-12 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 shadow-lg transition-all duration-300",
          show
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-5 w-5 text-white" />
      </Button>
    </>
  );
}

export function AnimeList() {
  return (
    <Suspense fallback={<Loading count={24} />}>
      <AnimeListContent />
    </Suspense>
  );
}
