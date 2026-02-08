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
        temporal: true,
        genres: true,
        attributes: true
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
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-12 reveal relative">
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

            {/* Fixed Sidebar */}
            <aside className={cn(
                "relative lg:w-64",
                "fixed inset-0 bg-background/98 p-6 lg:relative lg:inset-auto lg:bg-transparent lg:p-0",
                isFiltersOpen ? "z-50 translate-y-0 opacity-100" : "z-30 translate-y-4 opacity-0 pointer-events-none lg:translate-y-0 lg:opacity-100 lg:pointer-events-auto"
            )}>
                <div className="sticky top-24 max-h-[calc(100vh-8rem)] lg:max-h-[calc(100vh-4rem)] flex flex-col gap-8 pr-2 pb-10 custom-scrollbar overflow-y-auto">
                    {/* Parameters Header (Desktop Only) */}
                    <div className="hidden lg:flex justify-between items-end pb-4 border-b border-border/50">
                        <div className="flex flex-col">
                            <span className="font-mono text-[12px] uppercase tracking-[0.4em] text-primary/40 leading-none mb-2">System_Config</span>
                            <span className="font-mono text-[18px] font-black uppercase tracking-widest text-foreground">Parameters</span>
                        </div>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="font-mono text-[10px] uppercase text-primary hover:text-primary/70 transition-colors flex items-center gap-1 group pb-0.5"
                            >
                                <span className="w-2 h-[1px] bg-primary group-hover:w-3 transition-all" />
                                Flush_X
                            </button>
                        )}
                    </div>

                    {/* Search Module */}
                    <div className="relative group overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/20 group-focus-within:bg-primary transition-colors" />
                        <div className="pl-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-[12px] uppercase tracking-[0.2em] text-muted-foreground/50 font-bold">Query_Seeker</span>
                            </div>
                            <input
                                type="text"
                                placeholder="TYPE_CMD..."
                                className="w-full bg-transparent border-b border-border/30 px-0 py-3 font-mono text-[14px] uppercase text-foreground outline-none focus:border-primary/50 placeholder:text-muted-foreground/20 transition-all font-bold"
                                defaultValue={filters.search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Sort Section */}
                        <div className="space-y-4">
                            <button
                                onClick={() => toggleSection('sort')}
                                className="w-full flex items-center justify-between group/header"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-4 h-[1px] transition-all", openSections.sort ? "bg-primary w-5" : "bg-muted-foreground/30")} />
                                    <h4 className={cn("font-mono text-[12px] uppercase tracking-[0.2em] font-bold transition-colors", openSections.sort ? "text-foreground" : "text-muted-foreground/40")}>Sort_Kernel</h4>
                                </div>
                                <div className={cn("w-1.5 h-1.5 rotate-45 border-r border-b border-muted-foreground/30 transition-transform duration-300", openSections.sort ? "rotate-[45deg]" : "rotate-[-135deg]")} />
                            </button>

                            <div className={cn(
                                "flex flex-col gap-1 overflow-hidden transition-all duration-300",
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
                                            "flex items-center justify-between px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest border transition-all",
                                            filters.sort === item.value
                                                ? "bg-primary/5 border-primary/50 text-foreground translate-x-1"
                                                : "bg-transparent border-transparent text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.02]"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={cn("w-1 h-1 rounded-full", filters.sort === item.value ? "bg-primary animate-pulse" : "bg-border")} />
                                            {item.label}
                                        </div>
                                        <span className="text-[9px] opacity-30">{item.code}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Temporal Section */}
                        <div className="space-y-4">
                            <button
                                onClick={() => toggleSection('temporal')}
                                className="w-full flex items-center justify-between group/header"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-4 h-[1px] transition-all", openSections.temporal ? "bg-primary w-5" : "bg-muted-foreground/30")} />
                                    <h4 className={cn("font-mono text-[12px] uppercase tracking-[0.2em] font-bold transition-colors", openSections.temporal ? "text-foreground" : "text-muted-foreground/40")}>Time_Frame</h4>
                                </div>
                                <div className={cn("w-1.5 h-1.5 rotate-45 border-r border-b border-muted-foreground/30 transition-transform duration-300", openSections.temporal ? "rotate-[45deg]" : "rotate-[-135deg]")} />
                            </button>

                            <div className={cn(
                                "grid grid-cols-2 gap-3 overflow-hidden transition-all duration-300",
                                openSections.temporal ? "max-h-32 opacity-100 mb-2" : "max-h-0 opacity-0"
                            )}>
                                <div className="space-y-1.5">
                                    <span className="font-mono text-[9px] text-muted-foreground/40 uppercase block ml-1">Year_P</span>
                                    <select
                                        title="Year"
                                        className="w-full bg-secondary/50 border border-border/50 px-2 py-2.5 font-mono text-[11px] uppercase text-foreground outline-none hover:bg-secondary transition-all cursor-pointer font-bold"
                                        value={filters.year}
                                        onChange={(e) => setFilter("year", e.target.value)}
                                    >
                                        <option value="">NULL</option>
                                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <span className="font-mono text-[9px] text-muted-foreground/40 uppercase block ml-1">Cycle_P</span>
                                    <select
                                        title="Season"
                                        className="w-full bg-secondary/50 border border-border/50 px-2 py-2.5 font-mono text-[11px] uppercase text-foreground outline-none hover:bg-secondary transition-all cursor-pointer font-bold"
                                        value={filters.season}
                                        onChange={(e) => setFilter("season", e.target.value)}
                                    >
                                        <option value="">NULL</option>
                                        {SEASONS.map(s => <option key={s.value} value={s.value}>{s.code || s.label.substring(0, 3)}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Genres Section */}
                        <div className="space-y-4">
                            <button
                                onClick={() => toggleSection('genres')}
                                className="w-full flex items-center justify-between group/header"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-4 h-[1px] transition-all", openSections.genres ? "bg-primary w-5" : "bg-muted-foreground/30")} />
                                    <h4 className={cn("font-mono text-[12px] uppercase tracking-[0.2em] font-bold transition-colors", openSections.genres ? "text-foreground" : "text-muted-foreground/40")}>Genre_Pool</h4>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-[9px] opacity-20">{filters.genres.length}</span>
                                    <div className={cn("w-1.5 h-1.5 rotate-45 border-r border-b border-muted-foreground/30 transition-transform duration-300", openSections.genres ? "rotate-[45deg]" : "rotate-[-135deg]")} />
                                </div>
                            </button>

                            <div className={cn(
                                "flex flex-wrap gap-2 overflow-hidden transition-all duration-300",
                                openSections.genres ? "max-h-[350px] opacity-100" : "max-h-0 opacity-0"
                            )}>
                                <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                    {COMMON_GENRES.map((genre) => (
                                        <button
                                            key={genre}
                                            onClick={() => toggleGenre(genre)}
                                            className={cn(
                                                "px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] border transition-all",
                                                filters.genres.includes(genre)
                                                    ? "bg-foreground text-background border-foreground font-black shadow-[2px_2px_0px_0px_rgba(var(--primary),0.2)]"
                                                    : "bg-transparent text-muted-foreground/60 border-border/30 hover:border-border/80"
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
                                className="w-full flex items-center justify-between group/header"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-4 h-[1px] transition-all", openSections.attributes ? "bg-primary w-5" : "bg-muted-foreground/30")} />
                                    <h4 className={cn("font-mono text-[12px] uppercase tracking-[0.2em] font-bold transition-colors", openSections.attributes ? "text-foreground" : "text-muted-foreground/40")}>Attributes</h4>
                                </div>
                                <div className={cn("w-1.5 h-1.5 rotate-45 border-r border-b border-muted-foreground/30 transition-transform duration-300", openSections.attributes ? "rotate-[45deg]" : "rotate-[-135deg]")} />
                            </button>

                            <div className={cn(
                                "flex flex-col gap-1 overflow-hidden transition-all duration-300",
                                openSections.attributes ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
                            )}>
                                {FORMATS.map(f => (
                                    <button
                                        key={f.value}
                                        onClick={() => setFilter("format", f.value)}
                                        className={cn(
                                            "group flex items-center gap-3 px-2 py-1.5 transition-all text-left",
                                            filters.format === f.value ? "translate-x-1" : "hover:bg-white/[0.02]"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-1 h-3 transition-colors",
                                            filters.format === f.value ? "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" : "bg-border/30 group-hover:bg-border"
                                        )} />
                                        <span className={cn(
                                            "font-mono text-[11px] uppercase tracking-widest transition-colors",
                                            filters.format === f.value ? "text-foreground font-bold" : "text-muted-foreground/60"
                                        )}>
                                            {f.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Close Button */}
                    <div className="lg:hidden pt-8 border-t border-border mt-8">
                        <button
                            onClick={() => setIsFiltersOpen(false)}
                            className="w-full font-mono text-[11px] font-bold uppercase tracking-widest py-4 bg-foreground text-background index-cut-tr transition-all flex items-center justify-center gap-2"
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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 p-2 bg-secondary/10 border border-border/50 rounded-sm">
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
    }, [])

    return { targetRef }
}
