"use client"

import { useRouter, useSearchParams } from "next/navigation"
import React, { useState } from 'react'

import { useAnimeFilters } from "@/features/anime/hooks/use-anime-filters"
import { useAnimeList } from "@/features/anime/hooks/use-anime-list"
import { PosterCard } from "@/features/anime/components/poster-card/poster-card"
import { DiscoveryFilters } from "@/features/anime/components/discovery-filters"
import { SEASONS } from "@/features/anime/components/anime-filters/constants"
import { ErrorState } from "@/components/shared/error-state"
import { cn } from "@/lib/utils"

export default function DiscoveryView() {
    const { filters, setFilter, clearFilters } = useAnimeFilters()
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

    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

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
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 relative min-h-dvh">
            <DiscoveryFilters
                isOpen={isFiltersOpen}
                onClose={() => setIsFiltersOpen(false)}
            />

            <div className="flex-1 flex flex-col gap-0 w-full min-w-0">
                {/* Mobile Control Console */}
                <div
                    className="lg:hidden sticky z-100 bg-background/95 backdrop-blur-xl border-y border-white/10 px-4 py-3 flex items-center justify-between mb-8 group overflow-hidden shadow-2xl transition-all duration-300"
                    style={{ top: 'calc(var(--nav-visible, 1) * 80px - 1px)' }}
                >
                    <div className="absolute inset-0 bg-white/2 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <div className="flex flex-col gap-0.5 relative z-10">
                        <span className="font-mono text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
                            Control_Console
                        </span>
                        {mounted && activeFilterCount > 0 && (
                            <span className="font-mono text-[8px] uppercase text-primary font-bold tracking-tight">
                                Active_Parameters: {activeFilterCount}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                        {mounted && hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="font-mono text-[9px] uppercase text-muted-foreground hover:text-red-500 transition-colors flex items-center gap-1 group/reset"
                            >
                                <span className="w-2 h-[1px] bg-red-500/50 group-hover/reset:w-3 transition-all" />
                                Flush
                            </button>
                        )}
                        <button
                            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                            className="font-mono text-[10px] uppercase bg-foreground text-background px-5 py-2 index-cut-tr font-black hover:bg-primary hover:text-primary-foreground transition-all flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                        >
                            {isFiltersOpen ? "SHUTDOWN" : "CONFIG"}
                        </button>
                    </div>
                </div>

                {/* Main Results Grid */}
                <main className="py-8 flex-1 reveal">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 border-b border-border pb-8">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-primary rotate-45 animate-pulse" />
                                <span className="font-mono text-[12px] uppercase tracking-[0.4em] text-primary/60 font-bold">
                                    {filters.sort === 'seasonal' ? "Seasonal_Registry" : "Global_Archive"}
                                </span>
                            </div>
                            {mounted && (
                                <h1 className="font-mono text-3xl sm:text-5xl font-black uppercase tracking-tighter text-foreground leading-none animate-in fade-in slide-in-from-left-4 duration-500">
                                    {filters.sort === 'seasonal'
                                        ? `${filters.season || dateValues?.currentSeason} ${filters.year || dateValues?.currentYear}`
                                        : filters.sort.replace('-', ' ')}
                                </h1>
                            )}
                        </div>

                        <div className="flex flex-col items-end gap-1 font-mono text-[9px] text-muted-foreground uppercase tracking-widest text-right">
                            <span className="flex items-center gap-2">
                                <span className="w-1 h-1 bg-green-500 rounded-full" />
                                Registry_Status: Active
                            </span>
                            <span>Archived_Entries: {animeList.length}+</span>
                        </div>
                    </div>

                    {filters.sort === 'seasonal' && mounted && (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 p-2 bg-secondary/10 border border-border/50 rounded-sm animate-in fade-in duration-700">
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-muted-foreground ml-2">Temporal_Cycle:</span>
                                <div className="flex bg-background/50 p-1 border border-border/30">
                                    {SEASONS.map((s) => (
                                        <button
                                            key={s.value}
                                            onClick={() => setFilter("season", s.value)}
                                            className={cn(
                                                "px-3 py-1 font-mono text-[9px] uppercase tracking-tighter transition-all",
                                                (filters.season || dateValues?.currentSeason) === s.value
                                                    ? "bg-primary text-primary-foreground font-black"
                                                    : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            {s.code}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pr-2">
                                <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-muted-foreground">Epoch_Shift:</span>
                                <div className="flex items-center bg-background/50 border border-border/30">
                                    <button
                                        onClick={() => setFilter("year", (parseInt(filters.year || dateValues?.currentYear.toString() || "2024") - 1).toString())}
                                        className="px-2 py-1 font-mono text-[10px] text-muted-foreground hover:bg-white/5 transition-all"
                                    >
                                        -
                                    </button>
                                    <div className="px-4 py-1 font-mono text-[10px] font-bold text-primary border-x border-border/30 min-w-[50px] text-center">
                                        {filters.year || dateValues?.currentYear}
                                    </div>
                                    <button
                                        onClick={() => setFilter("year", (parseInt(filters.year || dateValues?.currentYear.toString() || "2024") + 1).toString())}
                                        className="px-2 py-1 font-mono text-[10px] text-muted-foreground hover:bg-white/5 transition-all"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {isError ? (
                        <ErrorState key="error-state" message="Request Failed: Registry Temporarily Unreachable" />
                    ) : (isLoading && animeList.length === 0) ? (
                        <div key="loading-skeleton" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className="aspect-2/3 border border-border shimmer" />
                            ))}
                        </div>
                    ) : (
                        <div key="content-grid" className="space-y-12 animate-in fade-in duration-700">
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
                                <InfiniteScrollTrigger key="infinite-trigger" onIntersect={() => !isFetchingNextPage && fetchNextPage()} />
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
    }, [])

    return { targetRef }
}
