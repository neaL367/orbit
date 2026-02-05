"use client"
import React from 'react'

import { useAnimeFilters } from "@/features/anime/hooks/use-anime-filters"
import { useAnimeList } from "@/features/anime/hooks/use-anime-list"
import { IndexSectionHeader } from "@/components/shared/index-section-header"
import { IndexChip } from "@/components/shared/index-chip"
import { PosterCard } from "@/features/anime/components/poster-card/PosterCard"
import { COMMON_GENRES, SEASONS, FORMATS } from "@/features/anime/components/anime-filters"
import { ErrorState } from "@/components/shared"

export default function DiscoveryPage() {
    const { filters, years, toggleGenre, setFilter, setSearch, clearFilters } = useAnimeFilters()
    const { animeList, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useAnimeList()

    const hasActiveFilters =
        filters.search || filters.genres.length > 0 || filters.year || filters.season || filters.format || filters.status

    return (
        <div className="flex flex-col lg:flex-row gap-12 reveal">
            {/* Search Sidebar/Rail */}
            <aside className="w-full lg:w-72 shrink-0 z-20">
                <div className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto space-y-8 pr-2 pb-10 scrollbar-hide hover:scrollbar-default transition-all">
                    {/* Parameters Header */}
                    <div className="flex justify-between items-center py-3 border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-50">
                        <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Parameters</span>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="font-mono text-[10px] uppercase text-primary hover:underline"
                            >
                                Clear_All
                            </button>
                        )}
                    </div>

                    {/* Search Input */}
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="SEARCH_DATABASE..."
                            className="w-full bg-background border border-border px-4 py-2 font-mono text-[11px] uppercase text-foreground outline-none focus:border-foreground placeholder:text-muted-foreground/50 transition-colors"
                            defaultValue={filters.search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Genre Stack */}
                    <div className="space-y-4">
                        <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 border-l border-border pl-3">Genres</h4>
                        <div className="flex flex-wrap gap-2">
                            {COMMON_GENRES.map((genre) => (
                                <IndexChip
                                    key={genre}
                                    label={genre}
                                    active={filters.genres.includes(genre)}
                                    onClick={() => toggleGenre(genre)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Temporal Frame */}
                    <div className="space-y-4">
                        <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 border-l border-border pl-3">Frame</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <select
                                title="Year"
                                className="bg-background border border-border px-3 py-2 font-mono text-[11px] uppercase text-foreground outline-none focus:border-foreground"
                                value={filters.year}
                                onChange={(e) => setFilter("year", e.target.value)}
                            >
                                <option value="">Year</option>
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                            <select
                                title="Season"
                                className="bg-background border border-border px-3 py-2 font-mono text-[11px] uppercase text-foreground outline-none focus:border-foreground"
                                value={filters.season}
                                onChange={(e) => setFilter("season", e.target.value)}
                            >
                                <option value="">Season</option>
                                {SEASONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Attributes */}
                    <div className="space-y-4">
                        <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 border-l border-border pl-3">Attributes</h4>
                        <div className="flex flex-col gap-1">
                            {FORMATS.map(f => (
                                <IndexChip
                                    key={f.value}
                                    label={f.label}
                                    active={filters.format === f.value}
                                    onClick={() => setFilter("format", f.value)}
                                    className="w-full text-left"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Results Grid */}
            <main className="flex-1">
                <IndexSectionHeader
                    title="Results"
                    subtitle={hasActiveFilters ? "Filtered_Archive" : "Global_Index"}
                />

                {isError ? (
                    <ErrorState message="Request Failed: Registry Temporarily Unreachable" />
                ) : isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="aspect-[2/3] border border-border shimmer" />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-12">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                            {animeList.map((anime, index) => (
                                <PosterCard
                                    key={anime.id}
                                    anime={anime}
                                    rank={filters.sort === 'top-rated' ? index + 1 : undefined}
                                />
                            ))}
                        </div>

                        {/* Infinite Scroll Trigger */}
                        {hasNextPage && (
                            <InfiniteScrollTrigger onIntersect={() => !isFetchingNextPage && fetchNextPage()} />
                        )}

                        {isFetchingNextPage && (
                            <div className="flex justify-center py-8">
                                <span className="font-mono text-[10px] uppercase animate-pulse text-muted-foreground">Syncing_Archive...</span>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}

function InfiniteScrollTrigger({ onIntersect }: { onIntersect: () => void }) {
    const { targetRef } = useIntersectionObserver(onIntersect)

    return (
        <div ref={targetRef} className="h-20 w-full relative -top-40 pointer-events-none" />
    )
}

function useIntersectionObserver(callback: () => void) {
    const targetRef = React.useRef<HTMLDivElement>(null)
    const savedCallback = React.useRef(callback)

    React.useEffect(() => {
        savedCallback.current = callback
    }, [callback])

    React.useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                savedCallback.current()
            }
        }, {
            root: null,
            rootMargin: '1200px', // Extensive lookahead for seamless loading
            threshold: 0
        })

        const currentTarget = targetRef.current
        if (currentTarget) observer.observe(currentTarget)

        return () => {
            if (currentTarget) observer.unobserve(currentTarget)
            observer.disconnect()
        }
    }, []) // Stable effect

    return { targetRef }
}
