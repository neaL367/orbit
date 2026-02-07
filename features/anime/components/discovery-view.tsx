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
    const { animeList, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, dateValues } = useAnimeList()
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
                "w-full lg:w-80 shrink-0 transition-all duration-300",
                "fixed inset-0 bg-background/98 p-6 lg:relative lg:inset-auto lg:bg-transparent lg:p-0",
                isFiltersOpen
                    ? "z-50 translate-y-0 opacity-100"
                    : "z-30 translate-y-4 opacity-0 pointer-events-none lg:z-30 lg:translate-y-0 lg:opacity-100 lg:pointer-events-auto"
            )}>
                <div className="sticky top-24 max-h-[calc(100vh-12rem)] lg:max-h-[calc(100vh-6rem)] overflow-y-auto space-y-12 pr-4 pb-10 scrollbar-hide hover:scrollbar-default transition-all">
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

                    {/* Search Module */}
                    <div className="p-5 border border-border bg-white/[0.02] relative group transition-all hover:bg-white/[0.04]">
                        <div className="absolute top-0 right-0 w-2 h-2 bg-primary/20" />
                        <div className="absolute -top-px -left-px w-12 h-[1px] bg-primary/50" />
                        <div className="absolute -top-px -left-px w-[1px] h-12 bg-primary/50" />

                        <div className="space-y-4 relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-[9px] uppercase tracking-[0.34em] text-muted-foreground/60 font-bold">Query_Database</span>
                                <div className="flex gap-1">
                                    <div className="w-1 h-1 bg-muted-foreground/30" />
                                    <div className="w-1 h-1 bg-muted-foreground/30 animate-pulse" />
                                </div>
                            </div>
                            <input
                                type="text"
                                placeholder="TYPE_QUERY_HERE..."
                                className="w-full bg-background/50 border border-border/50 px-4 py-3 font-mono text-[11px] uppercase text-foreground outline-none focus:border-primary/50 placeholder:text-muted-foreground/30 transition-all backdrop-blur-sm"
                                defaultValue={filters.search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-10 pl-1">
                        {/* REGISTRY_SORT */}
                        <div className="space-y-5">
                            <div className="flex items-center gap-3">
                                <span className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                                <h4 className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground font-bold">Registry_Sort</h4>
                            </div>
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
                                        className="w-full text-[9px] py-2"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* GENRE_TAGS */}
                        <div className="space-y-5">
                            <div className="flex items-center gap-3">
                                <span className="w-1 h-1 bg-primary rotate-45" />
                                <h4 className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground font-bold">Genre_Tags</h4>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {COMMON_GENRES.map((genre) => (
                                    <IndexChip
                                        key={genre}
                                        label={genre}
                                        active={filters.genres.includes(genre)}
                                        onClick={() => toggleGenre(genre)}
                                        className="text-[9px] py-1.5"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* TEMPORAL_FRAME */}
                        <div className="space-y-5">
                            <div className="flex items-center gap-3">
                                <span className="w-2 h-[1px] bg-primary" />
                                <h4 className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground font-bold">Temporal_Frame</h4>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                <div className="group relative">
                                    <select
                                        title="Year"
                                        className="w-full bg-background border border-border px-4 py-3 font-mono text-[10px] uppercase text-foreground outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
                                        value={filters.year}
                                        onChange={(e) => setFilter("year", e.target.value)}
                                    >
                                        <option value="">[ YEAR_NULL ]</option>
                                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-muted-foreground/50" />
                                </div>
                                <div className="group relative">
                                    <select
                                        title="Season"
                                        className="w-full bg-background border border-border px-4 py-3 font-mono text-[10px] uppercase text-foreground outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
                                        value={filters.season}
                                        onChange={(e) => setFilter("season", e.target.value)}
                                    >
                                        <option value="">[ SEASON_NULL ]</option>
                                        {SEASONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-muted-foreground/50" />
                                </div>
                            </div>
                        </div>

                        {/* SYSTEM_ATTRIBUTES */}
                        <div className="space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 border border-primary" />
                                <h4 className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground font-bold">System_Attributes</h4>
                            </div>
                            <div className="flex flex-col gap-2">
                                {FORMATS.map(f => (
                                    <IndexChip
                                        key={f.value}
                                        label={f.label}
                                        active={filters.format === f.value}
                                        onClick={() => setFilter("format", f.value)}
                                        className="w-full text-left py-2 px-4 flex justify-between group"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Close Button (Bottom) */}
                    <div className="lg:hidden pt-8 border-t border-border mt-8">
                        <button
                            onClick={() => setIsFiltersOpen(false)}
                            className="w-full font-mono text-[11px] font-bold uppercase tracking-widest py-4 bg-foreground text-background index-cut-tr transition-all flex items-center justify-center gap-2"
                        >
                            Confirm_Parameters
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Results Grid */}
            <main className="py-8 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 border-b border-border pb-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-primary rotate-45 animate-pulse" />
                            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-primary/60">
                                {filters.sort === 'seasonal' ? "Seasonal_Registry" : "Global_Archive"}
                            </span>
                        </div>
                        <h1 className="font-mono text-3xl sm:text-5xl font-black uppercase tracking-tighter text-foreground leading-none">
                            {filters.sort === 'seasonal'
                                ? `${filters.season || dateValues?.currentSeason} ${filters.year || dateValues?.currentYear}`
                                : filters.sort.replace('-', ' ')}
                        </h1>
                    </div>

                    <div className="flex flex-col items-end gap-1 font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest text-right">
                        <span className="flex items-center gap-2">
                            <span className="w-1 h-1 bg-green-500 rounded-full" />
                            Registry_Status: Active
                        </span>
                        <span>Archived_Entries: {animeList.length}+</span>
                    </div>
                </div>

                {filters.sort === 'seasonal' && (
                    <div className="flex flex-col gap-6 mb-12 pb-8 border-b border-white/5">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground mr-4">Select_Cycle:</span>
                            {SEASONS.map((s) => (
                                <button
                                    key={s.value}
                                    onClick={() => setFilter("season", s.value)}
                                    className={cn(
                                        "px-4 py-2 font-mono text-[9px] uppercase tracking-widest border transition-all relative overflow-hidden group",
                                        (filters.season || dateValues?.currentSeason) === s.value
                                            ? "bg-foreground text-background border-foreground font-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]"
                                            : "bg-transparent text-muted-foreground border-border hover:border-primary/50"
                                    )}
                                >
                                    <span className="relative z-10">{s.label}</span>
                                    {(filters.season || dateValues?.currentSeason) === s.value && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-scan-vertical pointer-events-none" />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground mr-4">Temporal_Shift:</span>
                            <div className="flex items-center bg-secondary/20 border border-border p-1">
                                <button
                                    onClick={() => setFilter("year", (parseInt(filters.year || dateValues?.currentYear.toString() || "2024") - 1).toString())}
                                    className="px-3 py-1 font-mono text-[10px] text-muted-foreground hover:text-primary hover:bg-white/5 transition-all"
                                >
                                    -1Y
                                </button>
                                <div className="px-5 py-1 font-mono text-[10px] font-bold text-foreground border-x border-border min-w-[60px] text-center">
                                    {filters.year || dateValues?.currentYear}
                                </div>
                                <button
                                    onClick={() => setFilter("year", (parseInt(filters.year || dateValues?.currentYear.toString() || "2024") + 1).toString())}
                                    className="px-3 py-1 font-mono text-[10px] text-muted-foreground hover:text-primary hover:bg-white/5 transition-all"
                                >
                                    +1Y
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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
        </div >
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
