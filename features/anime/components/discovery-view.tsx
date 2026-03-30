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
    const [mounted, setMounted] = React.useState(false)
    const [showStickyFilter, setShowStickyFilter] = React.useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()

    const glowRef = React.useRef<HTMLDivElement>(null)

    // Initial Paramount Sync
    React.useEffect(() => {
        if (!searchParams.get('sort')) {
            const params = new URLSearchParams(searchParams.toString())
            params.set('sort', 'trending')
            router.replace(`/anime?${params.toString()}`, { scroll: false })
        }
    }, [searchParams, router])

    // Silk-Smooth Mouse Trajectory (Zero React Churn)
    React.useEffect(() => {
        const glow = glowRef.current
        if (!glow) return

        const handleMouseMove = (e: MouseEvent) => {
            requestAnimationFrame(() => {
                glow.style.transform = `translate(${e.clientX - 300}px, ${e.clientY - 300}px)`
            })
        }

        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    // Scroll & Appearance Engine
    React.useEffect(() => {
        setMounted(true)

        const handleScroll = () => {
            const currentScrollY = window.scrollY
            const shouldShow = currentScrollY > 400

            setShowStickyFilter(prev => {
                if (prev !== shouldShow) return shouldShow
                return prev
            })
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
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

    const { targetRef } = useIntersectionObserver(() => {
        if (!isFetchingNextPage && hasNextPage) {
            fetchNextPage()
        }
    })

    return (
        <div className="flex flex-col gap-8 lg:gap-12 relative min-h-dvh overflow-hidden">
            {/* Interactive Background Glow - Optimized: Ref based position updates */}
            <div
                ref={glowRef}
                className="fixed pointer-events-none z-0 w-[600px] h-[600px] rounded-full opacity-[0.03] blur-[120px] will-change-transform"
                style={{
                    background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
                    top: 0,
                    left: 0,
                }}
            />

            {/* Subtle Grid Scan Overlay */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.02]">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#888_1px,transparent_1px),linear-gradient(to_bottom,#888_1px,transparent_1px)] bg-size-[60px_60px]" />
                <div className="absolute inset-0 bg-linear-to-b from-background via-transparent to-background" />
            </div>

            <DiscoveryFilters
                isOpen={isFiltersOpen}
                onClose={() => setIsFiltersOpen(false)}
            />

            <div className="flex-1 flex flex-col gap-0 w-full min-w-0 pb-20">
                {/* Mobile Control Console (Internal Registry Telemetry) */}
                <div
                    className="lg:hidden sticky z-100 bg-background/95 backdrop-blur-xl border-y border-white/10 px-4 py-3 flex items-center justify-between mb-8 group overflow-hidden shadow-2xl transition-all duration-300"
                    style={{ top: 'calc(var(--nav-visible, 1) * 80px - 1px)' }}
                >
                    <div className="absolute inset-0 bg-white/2 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
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
                                className="font-mono text-[9px] uppercase text-muted-foreground hover:text-red-500 transition-colors flex items-center gap-1 group/reset cursor-pointer"
                            >
                                <span className="w-2 h-px bg-red-500/50 group-hover/reset:w-3 transition-all" />
                                Flush
                            </button>
                        )}
                        <button
                            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                            className="font-mono text-[10px] uppercase bg-foreground text-background px-5 py-2 index-cut-tr font-black hover:bg-primary hover:text-primary-foreground transition-all flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer"
                        >
                            {isFiltersOpen ? "SHUTDOWN" : "CONFIG"}
                        </button>
                    </div>
                </div>

                {/* Main Results Grid */}
                <main className="py-8 flex-1 reveal">
                    <div className="flex flex-col gap-10 mb-16 border-b border-white/5 pb-12">
                        {/* Status Line */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-primary/20 rounded-full" />
                                    <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-primary/40 font-black">Archive_Index</span>
                                </div>
                                <div className="h-px w-12 bg-white/5 hidden sm:block" />
                                <div className="hidden sm:flex items-center gap-2">
                                    <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/30 font-bold">Registry_Node:</span>
                                    <span className="font-mono text-[9px] uppercase text-foreground/40 font-black">US_WEST_01</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 font-mono text-[9px] uppercase tracking-widest">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                                    <span className="hidden xs:inline">Registry_Stable</span>
                                </div>
                                <div className="text-muted-foreground/40">
                                    <span className="text-foreground/20">Archived_Units:</span> {animeList.length.toLocaleString()}+
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                            <div className="space-y-8 max-w-4xl">
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="inline-flex items-center gap-3 px-3 py-1 bg-primary/10 border border-primary/20 rounded-sm">
                                        <div className="w-1.5 h-1.5 bg-primary animate-pulse" />
                                        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-primary font-black">
                                            {filters.sort === 'seasonal' ? "Temporal_Registry_Sync" : "Persistent_Archive_Stream"}
                                        </span>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-2 px-3 py-1 border border-white/5 font-mono text-[9px] text-muted-foreground/40 font-black">
                                        <span className="text-foreground/20 italic">Bitrate:</span> 12.4 GB/s
                                    </div>
                                    <div className="hidden md:flex items-center gap-2 px-3 py-1 border border-white/5 font-mono text-[9px] text-muted-foreground/40 font-black">
                                        <span className="text-foreground/20 italic">Health:</span> 99.8% READY
                                    </div>
                                </div>
                                {mounted && (
                                    <div className="relative">
                                        <h1 className="font-mono text-6xl sm:text-8xl lg:text-[10rem] font-black uppercase tracking-[-0.04em] text-foreground leading-[0.85] reveal-text">
                                            {filters.sort === 'seasonal'
                                                ? `${filters.season || dateValues?.currentSeason} ${filters.year || dateValues?.currentYear}`
                                                : filters.sort.replace('-', '\n')}
                                        </h1>
                                        <div className="absolute -left-12 top-0 bottom-0 w-px bg-linear-to-b from-primary/50 via-transparent to-transparent hidden xl:block" />
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-4 lg:self-end">
                                {/* Parameters Badge (Telemetry) */}
                                {mounted && activeFilterCount > 0 && (
                                    <div className="flex flex-col items-end px-4 py-2 border-r border-white/5 mr-2">
                                        <span className="font-mono text-[8px] uppercase tracking-widest text-primary/40 font-black leading-none mb-1">Active_States</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-mono text-[14px] font-black text-primary">{activeFilterCount}</span>
                                            <span className="font-mono text-[10px] text-muted-foreground/40 font-bold underline decoration-primary/20 underline-offset-4">VAR</span>
                                        </div>
                                    </div>
                                )}

                                {/* Desktop Config Trigger (THE BUTTON) */}
                                <button
                                    onClick={() => setIsFiltersOpen(true)}
                                    className="flex-1 lg:flex-none flex items-center gap-6 bg-foreground text-background px-8 py-4 index-cut-tr hover:bg-primary hover:text-primary-foreground transition-all duration-500 group shadow-[12px_12px_0px_rgba(255,255,255,0.05)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:scale-[0.98] cursor-pointer"
                                >
                                    <div className="flex flex-col items-start gap-0.5">
                                        <span className="font-mono text-[8px] uppercase tracking-widest opacity-40 font-black leading-none mb-0.5">Interface_Command</span>
                                        <span className="font-mono text-[14px] uppercase font-black tracking-widest leading-none">CONFIG_PARAMETERS</span>
                                    </div>
                                    <div className="w-8 h-8 flex items-center justify-center bg-background/10 border border-background/20 group-hover:border-primary-foreground/30 transition-all group-hover:rotate-90">
                                        <div className="w-2 h-2 bg-current" />
                                    </div>
                                </button>
                            </div>
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
                                                "px-3 py-1 font-mono text-[9px] uppercase tracking-tighter transition-all cursor-pointer",
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
                                        className="px-2 py-1 font-mono text-[10px] text-muted-foreground hover:bg-white/5 transition-all cursor-pointer"
                                    >
                                        -
                                    </button>
                                    <div className="px-4 py-1 font-mono text-[10px] font-bold text-primary border-x border-border/30 min-w-[50px] text-center">
                                        {filters.year || dateValues?.currentYear}
                                    </div>
                                    <button
                                        onClick={() => setFilter("year", (parseInt(filters.year || dateValues?.currentYear.toString() || "2024") + 1).toString())}
                                        className="px-2 py-1 font-mono text-[10px] text-muted-foreground hover:bg-white/5 transition-all cursor-pointer"
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
                        <div key="loading-skeleton" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className="aspect-[2/3] bg-white/5 border border-white/5 animate-pulse index-cut-tr overflow-hidden relative">
                                    <div className="absolute inset-0 bg-linear-to-tr from-primary/5 via-transparent to-transparent" />
                                    <div className="h-full w-full flex flex-col justify-end p-4">
                                        <div className="h-1 w-1/2 bg-white/10 mb-2" />
                                        <div className="h-1 w-1/4 bg-white/10" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div key="content-grid" className="space-y-12 animate-in fade-in duration-700">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10">
                                {animeList.map((anime, index) => (
                                    <PosterCard
                                        key={anime.id}
                                        anime={anime}
                                        rank={filters.sort === 'top-rated' ? index + 1 : undefined}
                                    />
                                ))}

                                {/* Integrated Skeletons: Continue the flow inside the same grid */}
                                {isFetchingNextPage && Array.from({ length: 12 }).map((_, i) => (
                                    <div key={`skeleton-${i}`} className="aspect-[2/3] bg-white/5 border border-white/5 animate-pulse index-cut-tr overflow-hidden relative">
                                        <div className="absolute inset-0 bg-linear-to-tr from-primary/5 via-transparent to-transparent" />
                                        <div className="h-full w-full flex flex-col justify-end p-4">
                                            <div className="h-1 w-1/2 bg-white/10 mb-2" />
                                            <div className="h-1 w-1/4 bg-white/10" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Infinite Scroll Trigger & Diagnostics */}
                            <div className="space-y-12">
                                {isFetchingNextPage && (
                                    <div className="flex flex-col items-center gap-3 py-10 opacity-60">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1 h-1 bg-primary animate-ping" />
                                            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-primary font-black animate-pulse">Syncing_Archive_Nexus</span>
                                        </div>
                                        <span className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground/40">Request_Latent // Establishing_Uplink...</span>
                                    </div>
                                )}

                                {hasNextPage && !isFetchingNextPage && (
                                    <div ref={targetRef} className="h-96 w-full flex items-center justify-center">
                                        <div className="flex flex-col items-center gap-6 group">
                                            <div className="w-16 h-px bg-white/10 group-hover:w-32 group-hover:bg-primary/40 transition-all duration-700" />
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="font-mono text-[9px] uppercase tracking-[0.6em] text-muted-foreground/30 font-black">Waiting_For_Bottom_Trigger</span>
                                                <span className="font-mono text-[7px] uppercase tracking-[0.2em] text-primary/20">Archive_Ready_For_Sync</span>
                                            </div>
                                            <div className="w-16 h-px bg-white/10 group-hover:w-32 group-hover:bg-primary/40 transition-all duration-700" />

                                            <button
                                                onClick={() => fetchNextPage()}
                                                className="mt-4 px-6 py-2 border border-white/5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground hover:border-primary/50 hover:text-primary transition-all cursor-pointer bg-white/2"
                                            >
                                                Force_Manual_Sync
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Exhaustion State */}
                                {!hasNextPage && animeList.length > 0 && (
                                    <div className="py-20 flex flex-col items-center gap-6 opacity-40">
                                        <div className="h-px w-32 bg-linear-to-r from-transparent via-white/20 to-transparent" />
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="font-mono text-[10px] uppercase tracking-[0.4em] font-black">Archive_Full_Scan_Complete</span>
                                            <span className="font-mono text-[8px] uppercase tracking-widest italic">All_Registry_Nodes_Indexed</span>
                                        </div>
                                        <div className="h-px w-32 bg-linear-to-r from-transparent via-white/20 to-transparent" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Floating Sticky Config Toggle */}
            <div
                className={cn(
                    "fixed bottom-12 right-12 z-150 transition-all duration-500 transform",
                    showStickyFilter && !isFiltersOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-20 opacity-0 scale-50 pointer-events-none"
                )}
            >
                <button
                    onClick={() => setIsFiltersOpen(true)}
                    className="flex items-center gap-4 bg-foreground text-background p-4 sm:px-6 sm:py-4 index-cut-tr shadow-[8px_8px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group cursor-pointer"
                >
                    <div className="flex flex-col items-start gap-0.5 leading-none">
                        <span className="font-mono text-[7px] uppercase tracking-widest opacity-40 font-black">Interface</span>
                        <span className="font-mono text-[11px] uppercase font-black tracking-widest">Config</span>
                    </div>
                    <div className="w-8 h-8 flex items-center justify-center bg-background/10 border border-background/20 group-hover:rotate-90 transition-transform">
                        <div className="w-1.5 h-1.5 bg-current" />
                    </div>

                    {/* Active Count Badge */}
                    {activeFilterCount > 0 && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-primary-foreground flex items-center justify-center font-mono text-[10px] font-black index-cut-tr">
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
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                savedCallback.current()
            }
        }, {
            root: null,
            rootMargin: '1200px',
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
