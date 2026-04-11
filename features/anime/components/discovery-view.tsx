"use client"

import { useRouter, useSearchParams } from "next/navigation"
import React, { useState, useMemo, useCallback } from "react"

import { useAnimeFilters } from "@/features/anime/hooks/use-anime-filters"
import { useAnimeList } from "@/features/anime/hooks/use-anime-list"
import { PosterCard } from "@/features/anime/components/poster-card/poster-card"
import { DiscoveryFilters } from "@/features/anime/components/discovery-filters"
import { SEASONS } from "@/features/anime/components/anime-filters/constants"
import { ErrorState } from "@/components/shared/error-state"
import { formatRelativeUpdated } from "@/lib/utils/format-updated"
import { cn } from "@/lib/utils"

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
    dataUpdatedAt,
    perPage,
  } = useAnimeList()
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showStickyFilter, setShowStickyFilter] = useState(false)
  const [syncLabel, setSyncLabel] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  const glowRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!searchParams.get("sort")) {
      const params = new URLSearchParams(searchParams.toString())
      params.set("sort", "trending")
      router.replace(`/anime?${params.toString()}`, { scroll: false })
    }
  }, [searchParams, router])

  React.useEffect(() => {
    const glow = glowRef.current
    if (!glow) return

    const handleMouseMove = (e: MouseEvent) => {
      requestAnimationFrame(() => {
        glow.style.transform = `translate(${e.clientX - 300}px, ${e.clientY - 300}px)`
      })
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  React.useEffect(() => {
    setMounted(true)

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const shouldShow = currentScrollY > 400

      setShowStickyFilter((prev) => {
        if (prev !== shouldShow) return shouldShow
        return prev
      })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  React.useEffect(() => {
    if (dataUpdatedAt) {
      setSyncLabel(formatRelativeUpdated(dataUpdatedAt))
    }
  }, [dataUpdatedAt, isFetchingNextPage, isLoading])

  const activeFilterCount = useMemo(
    () =>
      (filters.genres.length > 0 ? 1 : 0) +
      (filters.year ? 1 : 0) +
      (filters.season ? 1 : 0) +
      (filters.format ? 1 : 0) +
      (filters.status ? 1 : 0) +
      (filters.sort !== "trending" ? 1 : 0) +
      (filters.search ? 1 : 0),
    [
      filters.format,
      filters.genres.length,
      filters.search,
      filters.season,
      filters.sort,
      filters.status,
      filters.year,
    ]
  )

  const hasActiveFilters = useMemo(
    () =>
      Boolean(
        filters.search ||
          filters.genres.length > 0 ||
          filters.year ||
          filters.season ||
          filters.format ||
          filters.status ||
          filters.sort !== "trending"
      ),
    [
      filters.format,
      filters.genres.length,
      filters.search,
      filters.season,
      filters.sort,
      filters.status,
      filters.year,
    ]
  )

  const onIntersectLoadMore = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const { targetRef } = useIntersectionObserver(onIntersectLoadMore)

  const headlinePrimary = useMemo(() => {
    if (filters.sort === "seasonal") {
      return `${filters.season || dateValues?.currentSeason} ${filters.year || dateValues?.currentYear}`
    }
    if (filters.sort === "search") return "Search"
    if (filters.sort === "top-rated") return "Top rated"
    if (filters.sort === "popular") return "Popular"
    return "Trending"
  }, [filters.sort, filters.season, filters.year, dateValues?.currentSeason, dateValues?.currentYear])

  const isEmpty =
    !isLoading &&
    !isError &&
    animeList.length === 0 &&
    (filters.sort !== "search" || Boolean(filters.search))

  return (
    <div className="relative flex min-h-dvh flex-col gap-8 overflow-hidden lg:gap-12">
      <div
        ref={glowRef}
        className="pointer-events-none fixed z-0 h-[600px] w-[600px] rounded-full opacity-[0.03] blur-[120px] will-change-transform"
        style={{
          background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
          top: 0,
          left: 0,
        }}
        aria-hidden
      />

      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.02]" aria-hidden>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#888_1px,transparent_1px),linear-gradient(to_bottom,#888_1px,transparent_1px)] bg-size-[60px_60px]" />
        <div className="absolute inset-0 bg-linear-to-b from-background via-transparent to-background" />
      </div>

      <DiscoveryFilters isOpen={isFiltersOpen} onClose={() => setIsFiltersOpen(false)} />

      <div className="flex w-full min-w-0 flex-1 flex-col gap-0 pb-20">
        <div
          className="sticky z-100 mb-8 flex items-center justify-between border-y border-white/10 bg-background/95 px-4 py-3 shadow-2xl backdrop-blur-xl transition-[box-shadow] duration-300 lg:hidden"
          style={{ top: "calc(var(--nav-visible, 1) * 80px - 1px)" }}
        >
          <div className="relative z-10 flex flex-col gap-0.5">
            <span className="flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
              Browse
            </span>
            {mounted && activeFilterCount > 0 && (
              <span className="font-mono text-[8px] font-bold uppercase tracking-tight text-primary">
                {activeFilterCount} active filters
              </span>
            )}
          </div>
          <div className="relative z-10 flex items-center gap-4">
            {mounted && hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex cursor-pointer items-center gap-1 font-mono text-[9px] uppercase text-muted-foreground transition-colors hover:text-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              aria-expanded={isFiltersOpen}
              className="flex cursor-pointer items-center gap-2 bg-foreground px-5 py-2 font-mono text-[10px] font-black uppercase tracking-wide text-background index-cut-tr shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] transition-[transform,box-shadow,background-color,color] hover:bg-primary hover:text-primary-foreground active:translate-x-[2px] active:translate-y-[2px] active:shadow-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {isFiltersOpen ? "Close" : "Filters"}
            </button>
          </div>
        </div>

        <main className="flex-1 py-8 reveal">
          <div className="mb-16 flex flex-col gap-10 border-b border-white/5 pb-12">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <span className="font-mono text-[9px] font-black uppercase tracking-[0.35em] text-primary/50">
                  Discovery
                </span>
                <div className="hidden h-px w-12 bg-white/10 sm:block" aria-hidden />
                <span className="hidden font-mono text-[9px] uppercase tracking-wide text-muted-foreground sm:inline">
                  Data · AniList
                </span>
                {mounted && syncLabel ? (
                  <span className="font-mono text-[9px] uppercase tracking-wide text-muted-foreground/70 tabular-nums">
                    Updated {syncLabel}
                  </span>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-4 font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
                <span className="tabular-nums text-foreground/80">
                  Loaded <span className="text-foreground">{animeList.length}</span>
                  {hasNextPage ? "+" : ""}
                </span>
                <span className="text-muted-foreground/60">{perPage} per request</span>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
              <div className="max-w-4xl space-y-8">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-sm border border-primary/25 bg-primary/10 px-3 py-1 font-mono text-[9px] font-black uppercase tracking-[0.25em] text-primary">
                    {filters.sort === "seasonal" ? "Seasonal slice" : "Catalog mode"}
                  </span>
                </div>

                <div className="relative">
                  <h1 className="font-mono text-5xl font-black uppercase leading-[0.9] tracking-[-0.04em] text-foreground sm:text-7xl lg:text-[8rem]">
                    {headlinePrimary}
                  </h1>
                  {filters.sort === "search" && filters.search ? (
                    <p className="mt-4 max-w-2xl font-mono text-xs uppercase tracking-widest text-muted-foreground">
                      {`Results for "${filters.search}"`}
                    </p>
                  ) : null}
                  <div
                    className="absolute -left-12 top-0 hidden h-full w-px bg-linear-to-b from-primary/50 via-transparent to-transparent xl:block"
                    aria-hidden
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 lg:self-end">
                {mounted && activeFilterCount > 0 && (
                  <div className="mr-2 flex flex-col items-end border-r border-white/10 px-4 py-2">
                    <span className="mb-1 font-mono text-[8px] font-black uppercase leading-none tracking-widest text-primary/50">
                      Active
                    </span>
                    <span className="font-mono text-sm font-black text-primary tabular-nums">{activeFilterCount}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIsFiltersOpen(true)}
                  aria-haspopup="dialog"
                  className="group flex flex-1 cursor-pointer items-center gap-6 bg-foreground px-8 py-4 text-background index-cut-tr shadow-[12px_12px_0px_rgba(255,255,255,0.05)] transition-[transform,box-shadow,background-color,color] hover:translate-x-1 hover:translate-y-1 hover:bg-primary hover:text-primary-foreground hover:shadow-none active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:flex-none"
                >
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="font-mono text-[8px] font-black uppercase leading-none tracking-widest opacity-50">
                      Refine
                    </span>
                    <span className="font-mono text-sm font-black uppercase tracking-widest leading-none">
                      Open filters
                    </span>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center border border-background/20 bg-background/10 transition-[transform,border-color] group-hover:rotate-90 group-hover:border-primary-foreground/30">
                    <div className="h-2 w-2 bg-current" aria-hidden />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {filters.sort === "seasonal" && (
            <div className="mb-10 flex flex-col justify-between gap-4 rounded-sm border border-border/50 bg-secondary/10 p-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <span className="ml-2 font-mono text-[8px] uppercase tracking-[0.2em] text-muted-foreground">
                  Season
                </span>
                <div className="flex border border-border/30 bg-background/50 p-1">
                  {SEASONS.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setFilter("season", s.value)}
                      className={cn(
                        "cursor-pointer px-3 py-1 font-mono text-[9px] uppercase tracking-tighter transition-[background-color,color]",
                        (filters.season || dateValues?.currentSeason) === s.value
                          ? "bg-primary font-black text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {s.code}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pr-2">
                <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-muted-foreground">Year</span>
                <div className="flex items-center border border-border/30 bg-background/50">
                  <button
                    type="button"
                    onClick={() =>
                      setFilter(
                        "year",
                        (
                          parseInt(filters.year || dateValues?.currentYear.toString() || "2024", 10) - 1
                        ).toString()
                      )
                    }
                    className="cursor-pointer px-2 py-1 font-mono text-[10px] text-muted-foreground transition-colors hover:bg-white/5"
                  >
                    −
                  </button>
                  <div className="min-w-[50px] border-x border-border/30 px-4 py-1 text-center font-mono text-[10px] font-bold text-primary tabular-nums">
                    {filters.year || dateValues?.currentYear}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFilter(
                        "year",
                        (
                          parseInt(filters.year || dateValues?.currentYear.toString() || "2024", 10) + 1
                        ).toString()
                      )
                    }
                    className="cursor-pointer px-2 py-1 font-mono text-[10px] text-muted-foreground transition-colors hover:bg-white/5"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}

          {isError ? (
            <ErrorState key="error-state" message="Could not reach AniList. Try again in a moment." />
          ) : isLoading && animeList.length === 0 ? (
            <div
              key="loading-skeleton"
              className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="index-cut-tr relative aspect-[2/3] animate-pulse overflow-hidden border border-white/5 bg-white/5"
                >
                  <div className="absolute inset-0 bg-linear-to-tr from-primary/5 via-transparent to-transparent" />
                  <div className="flex h-full w-full flex-col justify-end p-4">
                    <div className="mb-2 h-1 w-1/2 bg-white/10" />
                    <div className="h-1 w-1/4 bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          ) : isEmpty ? (
            <div className="flex flex-col items-center gap-6 border border-white/10 bg-secondary/20 px-8 py-20 text-center">
              <p className="max-w-md font-mono text-sm uppercase tracking-wide text-muted-foreground">
                {filters.sort === "search" && !filters.search
                  ? "Enter a search term in filters, or pick a catalog mode."
                  : "No entries match these parameters. Relax filters or clear search."}
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="border border-white/15 bg-foreground px-6 py-3 font-mono text-[10px] font-black uppercase tracking-widest text-background transition-[background-color,color] hover:bg-primary hover:text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div key="content-grid" className="space-y-12 duration-700 animate-in fade-in">
              <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {animeList.map((anime, index) => (
                  <div key={anime.id} className="[content-visibility:auto] [contain-intrinsic-size:320px_480px]">
                    <PosterCard
                      anime={anime}
                      rank={filters.sort === "top-rated" ? index + 1 : undefined}
                    />
                  </div>
                ))}

                {isFetchingNextPage &&
                  Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={`skeleton-${i}`}
                      className="index-cut-tr relative aspect-[2/3] animate-pulse overflow-hidden border border-white/5 bg-white/5"
                    >
                      <div className="absolute inset-0 bg-linear-to-tr from-primary/5 via-transparent to-transparent" />
                      <div className="flex h-full w-full flex-col justify-end p-4">
                        <div className="mb-2 h-1 w-1/2 bg-white/10" />
                        <div className="h-1 w-1/4 bg-white/10" />
                      </div>
                    </div>
                  ))}
              </div>

              <div className="space-y-12">
                {isFetchingNextPage && (
                  <div className="flex flex-col items-center gap-2 py-10 opacity-70" role="status" aria-live="polite">
                    <span className="font-mono text-[10px] font-black uppercase tracking-[0.35em] text-primary">
                      Loading more…
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
                      Fetching next page from AniList
                    </span>
                  </div>
                )}

                {hasNextPage && !isFetchingNextPage && (
                  <div ref={targetRef} className="flex h-96 w-full items-center justify-center">
                    <div className="flex flex-col items-center gap-6">
                      <div className="h-px w-16 bg-white/15" aria-hidden />
                      <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
                        Scroll for more
                      </p>
                      <button
                        type="button"
                        onClick={() => fetchNextPage()}
                        className="mt-2 cursor-pointer border border-white/10 bg-white/5 px-6 py-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground transition-[border-color,color,background-color] hover:border-primary/50 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      >
                        Load next page
                      </button>
                      <div className="h-px w-16 bg-white/15" aria-hidden />
                    </div>
                  </div>
                )}

                {!hasNextPage && animeList.length > 0 && (
                  <div className="flex flex-col items-center gap-4 py-16 opacity-50">
                    <div className="h-px w-32 bg-linear-to-r from-transparent via-white/20 to-transparent" />
                    <p className="font-mono text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground">
                      End of results
                    </p>
                    <div className="h-px w-32 bg-linear-to-r from-transparent via-white/20 to-transparent" />
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      <div
        className={cn(
          "fixed bottom-12 right-12 z-150 transition-[transform,opacity] duration-500",
          showStickyFilter && !isFiltersOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-20 scale-50 opacity-0"
        )}
      >
        <button
          type="button"
          onClick={() => setIsFiltersOpen(true)}
          aria-label="Open discovery filters"
          className="group relative flex cursor-pointer items-center gap-4 bg-foreground p-4 text-background index-cut-tr shadow-[8px_8px_0px_rgba(255,255,255,0.1)] transition-[transform,box-shadow,background-color,color] hover:translate-x-1 hover:translate-y-1 hover:shadow-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:px-6 sm:py-4"
        >
          <div className="flex flex-col items-start gap-0.5 leading-none">
            <span className="font-mono text-[7px] font-black uppercase tracking-widest opacity-50">Filters</span>
            <span className="font-mono text-[11px] font-black uppercase tracking-widest">Open</span>
          </div>
          <div className="flex h-8 w-8 items-center justify-center border border-background/20 bg-background/10 transition-transform group-hover:rotate-90">
            <div className="h-1.5 w-1.5 bg-current" aria-hidden />
          </div>

          {activeFilterCount > 0 && (
            <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center bg-primary font-mono text-[10px] font-black text-primary-foreground index-cut-tr tabular-nums">
              {activeFilterCount}
            </div>
          )}
        </button>
      </div>
    </div>
  )
}

function useIntersectionObserver(callback: () => void) {
  const targetRef = React.useRef<HTMLDivElement>(null)
  const savedCallback = React.useRef(callback)

  React.useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          savedCallback.current()
        }
      },
      {
        root: null,
        rootMargin: "1200px",
        threshold: 0,
      }
    )

    const currentTarget = targetRef.current
    if (currentTarget) observer.observe(currentTarget)

    return () => {
      if (currentTarget) observer.unobserve(currentTarget)
      observer.disconnect()
    }
  }, [])

  return { targetRef }
}
