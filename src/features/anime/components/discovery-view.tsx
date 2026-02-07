"use client"

import { useRouter, useSearchParams } from "next/navigation"
import React, { useState } from 'react'
import { Filter, X } from "lucide-react"

import { COMMON_GENRES, SEASONS, FORMATS } from "@/features/anime/components/anime-filters/constants"
import { IndexSectionHeader } from "@/components/shared/index-section-header"
import { useAnimeFilters } from "@/features/anime/hooks/use-anime-filters"
import { useAnimeList } from "@/features/anime/hooks/use-anime-list"
import { IndexChip } from "@/components/shared/index-chip"
import { PosterCard } from "@/features/anime/components/poster-card/poster-card"
import { ErrorState } from "@/components/shared/error-state"
import { cn } from "@/lib/utils"

export default function DiscoveryView() {
    const { filters, years, toggleGenre, setFilter, setSearch, clearFilters } = useAnimeFilters()
    const { animeList, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useAnimeList()
    const [isFiltersOpen, setIsFiltersOpen] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()

    React.useEffect(() => {
        if (!searchParams.get('sort')) {
            const params = new URLSearchParams(searchParams.toString())
            params.set('sort', 'trending')
            router.replace(`/anime?${params.toString()}`, { scroll: false })
        }
    }, [searchParams, router])

    const activeFilterCount = (filters.genres.length > 0 ? 1 : 0) +
        (filters.year ? 1 : 0) +
        (filters.season ? 1 : 0) +
        (filters.format ? 1 : 0) +
        (filters.status ? 1 : 0) +
        (filters.sort !== 'trending' ? 1 : 0) +
        (filters.search ? 1 : 0)

    const hasActiveFilters =
        filters.search || filters.genres.length > 0 || filters.year || filters.season || filters.format || filters.status || filters.sort !== 'trending'

    return (
        <div className="flex flex-col lg:flex-row gap-12 reveal">
            {/* Mobile Control Console */}
            <div className="lg:hidden sticky top-16 z-40 bg-background/95 backdrop-blur-md border border-border px-4 py-4 flex items-center justify-between mb-4 group overflow-hidden">
                <div className="absolute inset-0 bg-white/[0.02] transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <div className="flex flex-col gap-0.5 relative z-10">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <span className="w-1 h-1 bg-primary animate-pulse" />
                        Control_Console
                    </span>
                    {activeFilterCount > 0 && (
                        <span className="font-mono text-[8px] uppercase text-primary font-bold">
                            Active_Parameters: {activeFilterCount}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3 relative z-10">
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="font-mono text-[10px] uppercase text-muted-foreground hover:text-primary transition-colors pr-2 border-r border-border"
                        >
                            Reset
                        </button>
                    )}
                    <button
                        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                        className="font-mono text-[10px] uppercase bg-foreground text-background px-4 py-2 index-cut-tr font-bold shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-2"
                    >
                        {isFiltersOpen ? <X className="w-3 h-3" /> : <Filter className="w-3 h-3" />}
                        {isFiltersOpen ? "CLOSE" : "FILTER"}
                    </button>
                </div>
            </div>

            {/* Search Sidebar/Rail */}
            <aside className={cn(
                "w-full lg:w-72 shrink-0 transition-all duration-300",
                "fixed inset-0 bg-background/98 p-6 lg:relative lg:inset-auto lg:bg-transparent lg:p-0",
                isFiltersOpen
                    ? "z-50 translate-y-0 opacity-100"
                    : "z-30 translate-y-4 opacity-0 pointer-events-none lg:z-30 lg:translate-y-0 lg:opacity-100 lg:pointer-events-auto"
            )}>
                <div className="sticky top-24 max-h-[calc(100vh-12rem)] lg:max-h-[calc(100vh-6rem)] overflow-y-auto space-y-8 pr-2 pb-10 scrollbar-hide hover:scrollbar-default transition-all">
                    {/* Parameters Header (Desktop Only) */}
                    <div className="hidden lg:flex justify-between items-center py-3 border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-50">
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
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-1 h-1 bg-primary" />
                            <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">Discovery_Query</h4>
                        </div>
                        <input
                            type="text"
                            placeholder="SEARCH_DATABASE..."
                            className="w-full bg-background border border-border px-4 py-2 font-mono text-[11px] uppercase text-foreground outline-none focus:border-foreground placeholder:text-muted-foreground/50 transition-colors"
                            defaultValue={filters.search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* System Parameters (Sort) */}
                    <div className="space-y-4">
                        <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 border-l border-border pl-3">System_Indices</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: 'Trending', value: 'trending' },
                                { label: 'Seasonal', value: 'seasonal' },
                                { label: 'Popular', value: 'popular' },
                                { label: 'Top_Rated', value: 'top-rated' }
                            ].map((item) => (
                                <IndexChip
                                    key={item.value}
                                    label={item.label}
                                    active={filters.sort === item.value}
                                    onClick={() => setFilter("sort", item.value)}
                                    className="w-full text-[9px]"
                                />
                            ))}
                        </div>
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

                    {/* Mobile Close Button (Bottom) */}
                    <div className="lg:hidden pt-8 border-t border-border mt-8">
                        <button
                            onClick={() => setIsFiltersOpen(false)}
                            className="w-full font-mono text-[11px] font-bold uppercase tracking-widest py-4 border border-border hover:bg-white/5 transition-all text-muted-foreground flex items-center justify-center gap-2"
                        >
                            Confirm_Parameters
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Results Grid */}
            <main className="flex-1">
                <IndexSectionHeader
                    title="Results"
                    subtitle={hasActiveFilters ? "Filtered_Archive" : "Global_Index"}
                    as="h1"
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
