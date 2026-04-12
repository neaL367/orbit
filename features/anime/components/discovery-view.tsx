"use client"

import React, { useState } from "react"

import { useAnimeFilters } from "@/features/anime/hooks/use-anime-filters"
import { useAnimeList } from "@/features/anime/hooks/use-anime-list"
import { DiscoveryFilters } from "@/features/anime/components/discovery-filters"
import { DiscoveryHero } from "./discovery/discovery-hero"
import { DiscoveryControls } from "./discovery/discovery-controls"
import { DiscoveryGrid } from "./discovery/discovery-grid"
import type { MediaSeason } from "@/lib/graphql/types/graphql"

/**
 * Modern Discovery View component.
 * Modularized for performance, maintainability, and visual excellence.
 */
export default function DiscoveryView() {
  const { filters, setFilter, clearFilters } = useAnimeFilters()
  const {
    animeList,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    dateValues,
    showRank,
  } = useAnimeList()

  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const activeFilterCount =
    (filters.genres.length > 0 ? 1 : 0) +
    (filters.year ? 1 : 0) +
    (filters.season ? 1 : 0) +
    (filters.format ? 1 : 0) +
    (filters.status ? 1 : 0) +
    (filters.sort !== "trending" ? 1 : 0) +
    (filters.search ? 1 : 0)

  const hasActiveFilters =
    filters.genres.length > 0 ||
    Boolean(filters.year) ||
    Boolean(filters.season) ||
    Boolean(filters.format) ||
    Boolean(filters.status) ||
    filters.sort !== "trending" ||
    Boolean(filters.search?.trim())

  const typedSeason = filters.season as MediaSeason | null
  const typedYear = filters.year ? parseInt(filters.year, 10) : null

  return (
    <div className="flex flex-col gap-8 lg:gap-12 relative min-h-dvh overflow-hidden">
      <DiscoveryFilters isOpen={isFiltersOpen} onClose={() => setIsFiltersOpen(false)} />

      <div className="flex-1 flex flex-col gap-0 w-full min-w-0 pb-20">
        <DiscoveryHero
          sort={filters.sort}
          season={typedSeason}
          year={typedYear}
          activeFilterCount={activeFilterCount}
          onOpenFilters={() => setIsFiltersOpen(true)}
          currentSeason={dateValues.currentSeason}
          currentYear={dateValues.currentYear}
        />

        <DiscoveryControls
          isFiltersOpen={isFiltersOpen}
          setIsFiltersOpen={setIsFiltersOpen}
          activeFilterCount={activeFilterCount}
          hasActiveFilters={hasActiveFilters}
          clearFilters={clearFilters}
          sort={filters.sort}
          season={typedSeason}
          year={typedYear}
          setFilter={setFilter}
          currentSeason={dateValues.currentSeason}
          currentYear={dateValues.currentYear}
        />

        <main className="py-8 flex-1 reveal">
          <DiscoveryGrid
            animeList={animeList}
            isLoading={isLoading}
            isError={isError}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            showRank={showRank}
          />
        </main>
      </div>
    </div>
  )
}
