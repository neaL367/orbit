"use client"

import { useRouter, useSearchParams } from "next/navigation"
import React, { useState } from 'react'
import { Filter, X } from "lucide-react"

import { COMMON_GENRES, SEASONS, FORMATS } from "@/features/anime/components/anime-filters/constants"
import { useAnimeFilters } from "@/features/anime/hooks/use-anime-filters"
import { useAnimeList } from "@/features/anime/hooks/use-anime-list"
import { PosterCard } from "@/features/anime/components/poster-card/poster-card"
import { ErrorState } from "@/components/shared/error-state"
import { cn } from "@/lib/utils"

export default function DiscoveryView() {
    const [openSections, setOpenSections] = useState({
        sort: true,
        temporal: false,
        genres: false,
        attributes: false
    })

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
    }

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
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 reveal relative min-h-screen">
            {/* Mobile Control Console */}
            <div className="lg:hidden sticky top-20 z-40 bg-background/80 backdrop-blur-xl border-y border-white/10 px-4 py-3 flex items-center justify-between mb-8 group overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-white/[0.02] transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
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
                        {isFiltersOpen ? <X className="w-3 h-3" /> : <Filter className="w-3 h-3" />}
                        {isFiltersOpen ? "SHUTDOWN" : "CONFIG"}
                    </button>
                </div>
            </div>

            {/* Fixed Sidebar */}
            <aside className={cn(
                "fixed inset-0 z-50 bg-background/95 backdrop-blur-md p-6 transition-all duration-300 lg:bg-transparent lg:p-0 lg:backdrop-blur-none", // Base & Mobile
                "lg:sticky lg:top-32 lg:z-30 lg:w-64 lg:block lg:self-start", // Desktop Sticky
                isFiltersOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none lg:opacity-100 lg:translate-y-0 lg:pointer-events-auto" // State
            )}>
                <div className="flex flex-col gap-8 h-full lg:h-auto overflow-y-auto lg:overflow-visible pb-20 lg:pb-0">
                    {/* Parameters Header (Desktop Only) */}
                    <div className="hidden lg:flex justify-between items-end pb-4 border-b border-white/10">
                        <div className="flex flex-col gap-1">
                            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/30 leading-none font-bold">System_Config</span>
                            <span className="font-mono text-[14px] font-black uppercase tracking-widest text-foreground">Parameters</span>
                        </div>
                        {mounted && hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="font-mono text-[9px] uppercase text-primary hover:text-red-500 transition-colors flex items-center gap-2 group pb-0.5"
                            >
                                <span className="w-1.5 h-1.5 border border-primary/50 group-hover:border-red-500 transition-colors" />
                                Flush_X
                            </button>
                        )}
                    </div>

                    {/* Search Module */}
                    <div className="relative group/search">
                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-white/10 group-focus-within/search:bg-primary transition-colors" />
                        <div className="pl-4 space-y-2">
                            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold block">Query_Seeker</label>
                            <input
                                type="text"
                                placeholder="INPUT_CMD..."
                                className="w-full bg-transparent border-b border-white/10 py-2 font-mono text-[12px] uppercase text-foreground outline-none focus:border-primary/50 placeholder:text-muted-foreground/50 transition-all font-bold tracking-wider"
                                defaultValue={filters.search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Sort Section */}
                        <div className="space-y-4">
                            <button
                                onClick={() => toggleSection('sort')}
                                className="w-full flex items-center justify-between group/header cursor-pointer select-none"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-1.5 h-1.5 border border-white/40 transition-colors group-hover/header:border-primary", openSections.sort ? "bg-primary border-primary" : "bg-transparent")} />
                                    <h4 className={cn("font-mono text-[11px] uppercase tracking-[0.2em] font-black transition-colors", openSections.sort ? "text-foreground" : "text-muted-foreground")}>Sort_Kernel</h4>
                                </div>
                                <div className={cn("w-[2px] h-2 bg-white/20 transition-all group-hover/header:h-4 group-hover/header:bg-primary", openSections.sort ? "rotate-90" : "")} />
                            </button>

                            <div className={cn(
                                "flex flex-col gap-1 pl-4 border-l border-white/5 transition-all duration-300 overflow-hidden",
                                openSections.sort ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
                            )}>
                                {[
                                    { label: 'Trending', value: 'trending', code: 'TRD' },
                                    { label: 'Seasonal', value: 'seasonal', code: 'SEA' },
                                    { label: 'Popular', value: 'popular', code: 'POP' },
                                    { label: 'Top_Rated', value: 'top-rated', code: 'RTD' }
                                ].map((item) => (
                                    <button
                                        key={item.value}
                                        onClick={() => setFilter("sort", item.value)}
                                        className={cn(
                                            "flex items-center justify-between px-3 py-2 font-mono text-[10px] uppercase tracking-widest border border-transparent transition-all hover:bg-white/[0.02] cursor-pointer",
                                            filters.sort === item.value
                                                ? "text-primary border-l-primary/50 bg-primary/5 translate-x-2"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            {filters.sort === item.value && <div className="w-1 h-1 bg-primary animate-pulse" />}
                                            {item.label}
                                        </div>
                                        <span className="text-[8px] opacity-20 font-bold">{item.code}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Temporal Section */}
                        <div className="space-y-4">
                            <button
                                onClick={() => toggleSection('temporal')}
                                className="w-full flex items-center justify-between group/header cursor-pointer select-none"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-1.5 h-1.5 border border-white/40 transition-colors group-hover/header:border-primary", openSections.temporal ? "bg-primary border-primary" : "bg-transparent")} />
                                    <h4 className={cn("font-mono text-[11px] uppercase tracking-[0.2em] font-black transition-colors", openSections.temporal ? "text-foreground" : "text-muted-foreground")}>Time_Frame</h4>
                                </div>
                                <div className={cn("w-[2px] h-2 bg-white/20 transition-all group-hover/header:h-4 group-hover/header:bg-primary", openSections.temporal ? "rotate-90" : "")} />
                            </button>

                            <div className={cn(
                                "grid grid-cols-2 gap-3 pl-4 border-l border-white/5 transition-all duration-300 overflow-hidden",
                                openSections.temporal ? "max-h-32 opacity-100 mb-2" : "max-h-0 opacity-0"
                            )}>
                                <div className="space-y-1.5">
                                    <span className="font-mono text-[10px] text-muted-foreground uppercase font-bold pl-1">Year_Var</span>
                                    <select
                                        title="Year"
                                        className="w-full bg-secondary/50 border border-white/10 px-3 py-2.5 font-mono text-[12px] uppercase text-foreground outline-none hover:bg-secondary/80 hover:border-white/20 transition-all cursor-pointer font-bold focus:border-primary/50 rounded-sm"
                                        value={filters.year}
                                        onChange={(e) => setFilter("year", e.target.value)}
                                    >
                                        <option value="" className="bg-background text-foreground">ALL</option>
                                        {years.map(y => <option key={y} value={y} className="bg-background text-foreground">{y}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <span className="font-mono text-[10px] text-muted-foreground uppercase font-bold pl-1">Epoch_Var</span>
                                    <select
                                        title="Season"
                                        className="w-full bg-secondary/50 border border-white/10 px-3 py-2.5 font-mono text-[12px] uppercase text-foreground outline-none hover:bg-secondary/80 hover:border-white/20 transition-all cursor-pointer font-bold focus:border-primary/50 rounded-sm"
                                        value={filters.season}
                                        onChange={(e) => setFilter("season", e.target.value)}
                                    >
                                        <option value="" className="bg-background text-foreground">ALL</option>
                                        {SEASONS.map(s => <option key={s.value} value={s.value} className="bg-background text-foreground">{s.code || s.label.substring(0, 3)}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Genres Section */}
                        <div className="space-y-4">
                            <button
                                onClick={() => toggleSection('genres')}
                                className="w-full flex items-center justify-between group/header cursor-pointer select-none"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-1.5 h-1.5 border border-white/40 transition-colors group-hover/header:border-primary", openSections.genres ? "bg-primary border-primary" : "bg-transparent")} />
                                    <h4 className={cn("font-mono text-[11px] uppercase tracking-[0.2em] font-black transition-colors", openSections.genres ? "text-foreground" : "text-muted-foreground")}>Genre_Pool</h4>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-[9px] text-primary">{filters.genres.length}</span>
                                    <div className={cn("w-[2px] h-2 bg-white/20 transition-all group-hover/header:h-4 group-hover/header:bg-primary", openSections.genres ? "rotate-90" : "")} />
                                </div>
                            </button>

                            <div className={cn(
                                "transition-all duration-300 relative overflow-hidden",
                                openSections.genres ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
                            )}>
                                <div className="flex flex-wrap gap-1.5 max-h-64 overflow-y-auto pr-1 custom-scrollbar pl-4 border-l border-white/5">
                                    {COMMON_GENRES.map((genre) => (
                                        <button
                                            key={genre}
                                            onClick={() => toggleGenre(genre)}
                                            className={cn(
                                                "px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] border transition-all cursor-pointer",
                                                filters.genres.includes(genre)
                                                    ? "bg-primary/90 text-primary-foreground border-primary font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                                    : "bg-white/[0.02] text-muted-foreground border-white/5 hover:border-white/20 hover:text-foreground"
                                            )}
                                        >
                                            {genre}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Attributes Section */}
                        <div className="space-y-4">
                            <button
                                onClick={() => toggleSection('attributes')}
                                className="w-full flex items-center justify-between group/header cursor-pointer select-none"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-1.5 h-1.5 border border-white/40 transition-colors group-hover/header:border-primary", openSections.attributes ? "bg-primary border-primary" : "bg-transparent")} />
                                    <h4 className={cn("font-mono text-[11px] uppercase tracking-[0.2em] font-black transition-colors", openSections.attributes ? "text-foreground" : "text-muted-foreground")}>Attributes</h4>
                                </div>
                                <div className={cn("w-[2px] h-2 bg-white/20 transition-all group-hover/header:h-4 group-hover/header:bg-primary", openSections.attributes ? "rotate-90" : "")} />
                            </button>

                            <div className={cn(
                                "flex flex-col gap-1 pl-4 border-l border-white/5 transition-all duration-300 overflow-hidden",
                                openSections.attributes ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
                            )}>
                                {FORMATS.map(f => (
                                    <button
                                        key={f.value}
                                        onClick={() => setFilter("format", f.value)}
                                        className={cn(
                                            "group flex items-center justify-between px-3 py-2 transition-all font-mono text-[10px] uppercase tracking-widest border border-transparent hover:bg-white/[0.02] cursor-pointer",
                                            filters.format === f.value ? "text-primary border-l-primary/50 bg-primary/5 translate-x-2" : "text-muted-foreground"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn("w-1 h-1 transition-all", filters.format === f.value ? "bg-primary animate-pulse" : "bg-white/10 group-hover:bg-white/30")} />
                                            <span className={cn("transition-colors", filters.format === f.value ? "font-bold text-foreground" : "")}>{f.label}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Close Button */}
                    <div className="lg:hidden mt-8 pt-6 border-t border-white/10">
                        <button
                            onClick={() => setIsFiltersOpen(false)}
                            className="w-full bg-foreground text-background font-mono text-[11px] font-black uppercase tracking-widest py-3 hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center gap-2"
                        >
                            Sync_Config
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Results Grid */}
            <main className="py-8 flex-1">
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

                    <div className="flex flex-col items-end gap-1 font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest text-right">
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
                                                : "text-muted-foreground/60 hover:text-foreground"
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
                            <div key={i} className="aspect-[2/3] border border-border shimmer" />
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
