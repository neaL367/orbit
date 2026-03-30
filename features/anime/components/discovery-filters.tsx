"use client"

import React, { useState, useEffect } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { COMMON_GENRES, SEASONS, FORMATS } from "@/features/anime/components/anime-filters/constants"
import { useAnimeFilters } from "@/features/anime/hooks/use-anime-filters"

interface DiscoveryFiltersProps {
    isOpen: boolean
    onClose: () => void
}

export function DiscoveryFilters({ isOpen, onClose }: DiscoveryFiltersProps) {
    const [mounted, setMounted] = useState(false)
    const [openSections, setOpenSections] = useState({
        sort: true,
        temporal: false,
        genres: false,
        attributes: false
    })

    const { filters, setFilter, setSearch, clearFilters, toggleGenre } = useAnimeFilters()

    const years = React.useMemo(() =>
        Array.from({ length: 50 }, (_, i) => (new Date().getFullYear() + 1 - i).toString())
        , [])

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (isOpen && typeof window !== 'undefined' && window.innerWidth < 1024) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
    }

    const hasActiveFilters =
        filters.search || filters.genres.length > 0 || filters.year || filters.season || filters.format || filters.status || filters.sort !== 'trending'

    if (!mounted) return null

    return (
        <div
            className={cn(
                "fixed inset-0 z-150 transition-all duration-500",
                isOpen ? "pointer-events-auto" : "pointer-events-none"
            )}
        >
            {/* Backdrop Overlay */}
            <div
                className={cn(
                    "absolute inset-0 bg-background/40 backdrop-blur-sm transition-opacity duration-500",
                    isOpen ? "opacity-100" : "opacity-0"
                )}
                onClick={onClose}
                onKeyDown={(e) => {
                    if (e.key === 'Escape') onClose()
                }}
                role="button"
                tabIndex={-1}
                aria-label="Close filters"
            />

            {/* Sidebar Content */}
            <aside
                className={cn(
                    "absolute top-0 right-0 w-full md:w-[400px] h-full bg-background/95 backdrop-blur-3xl border-l border-white/5 p-6 lg:p-10 transition-all duration-500 flex flex-col shadow-2xl overflow-hidden",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Decorative Background Elements */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#888_1px,transparent_1px),linear-gradient(to_bottom,#888_1px,transparent_1px)] bg-size-[40px_40px]" />
                </div>

                {/* Header */}
                <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/10 relative z-10">
                    <div className="flex flex-col gap-1">
                        <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-white/20 leading-none font-black">System_Config</span>
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-[16px] font-black uppercase tracking-widest text-foreground">Parameters</span>
                            <div className="w-1.5 h-1.5 bg-primary animate-pulse" />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="font-mono text-[9px] uppercase text-primary hover:text-red-500 transition-colors flex items-center gap-2 group mr-2 cursor-pointer"
                            >
                                <span className="w-1.5 h-1.5 border border-primary/50 group-hover:border-red-500 transition-colors" />
                                Flush_X
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 index-cut-tr hover:bg-white/10 transition-colors group cursor-pointer"
                        >
                            <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-10 flex-1 overflow-y-auto overflow-x-hidden pb-10 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden relative z-10">
                    {/* Search Module */}
                    <div className="relative group/search">
                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-white/10 group-focus-within/search:bg-primary transition-colors" />
                        <div className="pl-6 space-y-3">
                            <label htmlFor="query-seeker" className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold block opacity-60">Query_Seeker</label>
                            <input
                                id="query-seeker"
                                type="text"
                                placeholder="INPUT_CMD..."
                                className="w-full bg-white/2 border border-white/5 p-4 font-mono text-[11px] uppercase text-foreground outline-none focus:border-primary/50 focus:bg-white/5 placeholder:text-muted-foreground/30 transition-all font-bold tracking-wider index-cut-tr"
                                defaultValue={filters.search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-10">
                        {/* Sort Section */}
                        <div className="space-y-5">
                            <button
                                onClick={() => toggleSection('sort')}
                                className="w-full flex items-center justify-between group/header cursor-pointer select-none"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-2 h-2 border border-white/40 transition-colors group-hover/header:border-primary", openSections.sort ? "bg-primary border-primary" : "bg-transparent")} />
                                    <h4 className={cn("font-mono text-[11px] uppercase tracking-[0.2em] font-black transition-colors", openSections.sort ? "text-foreground" : "text-muted-foreground")}>Sort_Kernel</h4>
                                </div>
                                <div className={cn("w-[2px] h-2 bg-white/20 transition-all group-hover/header:h-4 group-hover/header:bg-primary", openSections.sort ? "rotate-90" : "")} />
                            </button>

                            <div className={cn(
                                "flex flex-col gap-1 pl-5 border-l border-white/5 transition-all duration-500 overflow-hidden",
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
                                            "flex items-center justify-between px-4 py-3 font-mono text-[10px] uppercase tracking-widest border border-transparent transition-all hover:bg-white/2 cursor-pointer",
                                            filters.sort === item.value
                                                ? "text-primary border-l-primary/50 bg-primary/5 translate-x-3"
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
                        <div className="space-y-5">
                            <button
                                onClick={() => toggleSection('temporal')}
                                className="w-full flex items-center justify-between group/header cursor-pointer select-none"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-2 h-2 border border-white/40 transition-colors group-hover/header:border-primary", openSections.temporal ? "bg-primary border-primary" : "bg-transparent")} />
                                    <h4 className={cn("font-mono text-[11px] uppercase tracking-[0.4em] font-black transition-colors", openSections.temporal ? "text-foreground" : "text-muted-foreground")}>Time_Frame</h4>
                                </div>
                                <div className={cn("w-[2px] h-2 bg-white/20 transition-all group-hover/header:h-4 group-hover/header:bg-primary", openSections.temporal ? "rotate-90" : "")} />
                            </button>

                            <div className={cn(
                                "grid grid-cols-2 gap-4 pl-5 border-l border-white/5 transition-all duration-500 overflow-hidden",
                                openSections.temporal ? "max-h-32 opacity-100 mb-2" : "max-h-0 opacity-0"
                            )}>
                                <div className="space-y-2">
                                    <span className="font-mono text-[9px] text-muted-foreground uppercase font-bold pl-1 opacity-40">Year_Var</span>
                                    <select
                                        title="Year"
                                        className="w-full bg-white/2 border border-white/5 px-4 py-3 font-mono text-[12px] uppercase text-foreground outline-none hover:bg-white/5 transition-all cursor-pointer font-bold focus:border-primary/50 index-cut-tr"
                                        value={filters.year || ""}
                                        onChange={(e) => setFilter("year", e.target.value)}
                                    >
                                        <option value="" className="bg-background text-foreground">ALL</option>
                                        {years.map(y => <option key={y} value={y} className="bg-background text-foreground">{y}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <span className="font-mono text-[9px] text-muted-foreground uppercase font-bold pl-1 opacity-40">Epoch_Var</span>
                                    <select
                                        title="Season"
                                        className="w-full bg-white/2 border border-white/5 px-4 py-3 font-mono text-[12px] uppercase text-foreground outline-none hover:bg-white/5 transition-all cursor-pointer font-bold focus:border-primary/50 index-cut-tr"
                                        value={filters.season || ""}
                                        onChange={(e) => setFilter("season", e.target.value)}
                                    >
                                        <option value="" className="bg-background text-foreground">ALL</option>
                                        {SEASONS.map(s => <option key={s.value} value={s.value} className="bg-background text-foreground">{s.code}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Genres Section */}
                        <div className="space-y-5">
                            <button
                                onClick={() => toggleSection('genres')}
                                className="w-full flex items-center justify-between group/header cursor-pointer select-none"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-2 h-2 border border-white/40 transition-colors group-hover/header:border-primary", openSections.genres ? "bg-primary border-primary" : "bg-transparent")} />
                                    <h4 className={cn("font-mono text-[11px] uppercase tracking-widest font-black transition-colors", openSections.genres ? "text-foreground" : "text-muted-foreground")}>Genre_Pool</h4>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-[9px] text-primary">{filters.genres.length}</span>
                                    <div className={cn("w-[2px] h-2 bg-white/20 transition-all group-hover/header:h-4 group-hover/header:bg-primary", openSections.genres ? "rotate-90" : "")} />
                                </div>
                            </button>

                            <div className={cn(
                                "transition-all duration-500 relative overflow-hidden",
                                openSections.genres ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                            )}>
                                <div className="flex flex-wrap gap-2 max-h-[400px] overflow-y-auto overflow-x-hidden pr-2 pl-5 border-l border-white/5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-4">
                                    {COMMON_GENRES.map((genre) => (
                                        <GenreButton
                                            key={genre}
                                            genre={genre}
                                            isSelected={filters.genres.includes(genre)}
                                            onClick={() => toggleGenre(genre)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Attributes Section */}
                        <div className="space-y-5">
                            <button
                                onClick={() => toggleSection('attributes')}
                                className="w-full flex items-center justify-between group/header cursor-pointer select-none"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-2 h-2 border border-white/40 transition-colors group-hover/header:border-primary", openSections.attributes ? "bg-primary border-primary" : "bg-transparent")} />
                                    <h4 className={cn("font-mono text-[11px] uppercase tracking-[0.2em] font-black transition-colors", openSections.attributes ? "text-foreground" : "text-muted-foreground")}>Attributes</h4>
                                </div>
                                <div className={cn("w-[2px] h-2 bg-white/20 transition-all group-hover/header:h-4 group-hover/header:bg-primary", openSections.attributes ? "rotate-90" : "")} />
                            </button>

                            <div className={cn(
                                "flex flex-col gap-1 pl-5 border-l border-white/5 transition-all duration-500 overflow-hidden",
                                openSections.attributes ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
                            )}>
                                {FORMATS.map(f => (
                                    <button
                                        key={f.value}
                                        onClick={() => setFilter("format", f.value)}
                                        className={cn(
                                            "group flex items-center justify-between px-4 py-3 transition-all font-mono text-[10px] uppercase tracking-widest border border-transparent hover:bg-white/2 cursor-pointer",
                                            filters.format === f.value ? "text-primary border-l-primary/50 bg-primary/5 translate-x-3" : "text-muted-foreground"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn("w-1.5 h-1.5 transition-all", filters.format === f.value ? "bg-primary animate-pulse" : "bg-white/10 group-hover:bg-white/30")} />
                                            <span className={cn("transition-colors", filters.format === f.value ? "font-bold text-foreground" : "")}>{f.label}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="mt-auto p-2 bg-white/2 border-t border-white/5 pt-8 relative z-10">
                    <button
                        onClick={onClose}
                        className="w-full font-mono text-[12px] uppercase bg-foreground text-background py-5 index-cut-tr font-black hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center gap-4 shadow-2xl active:translate-y-1 active:shadow-none cursor-pointer"
                    >
                        <span>SYNC_CONFIG_PARAMETERS</span>
                        <div className="w-2 h-2 bg-current rotate-45" />
                    </button>
                </div>
            </aside>
        </div>
    )
}

const GenreButton = React.memo(({ genre, isSelected, onClick }: { genre: string, isSelected: boolean, onClick: () => void }) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "px-4 py-2 font-mono text-[10px] uppercase tracking-widest border transition-all duration-300 cursor-pointer",
                isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]"
                    : "bg-white/2 border-white/5 text-muted-foreground hover:border-white/20 hover:text-foreground hover:bg-white/5"
            )}
        >
            {genre.replace(/_/g, " ")}
        </button>
    )
})

GenreButton.displayName = "GenreButton"
