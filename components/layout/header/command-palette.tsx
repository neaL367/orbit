"use client"

import { useState, useEffect, memo, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, X, Star, PlayCircle, Cpu, Terminal, History, ArrowRight } from 'lucide-react'
import { useDebounce } from 'use-debounce'
import { cn } from '@/lib/utils'
import { useGraphQL } from '@/lib/graphql/hooks'
import { SearchAnimeQuery } from '@/lib/graphql/queries/search-anime'
import type { Route } from 'next'
import type { Media } from '@/lib/graphql/types/graphql'

interface CommandPaletteProps {
    isOpen: boolean
    onClose: () => void
    menuItems: Array<{ label: string; href: string; sort?: string; code: string }>
}

interface VisitedAnime {
    id: number
    title: string
    image: string
    timestamp: number
}

const VISITED_KEY = 'orbit_latest_visits'
const MAX_VISITS = 4

// Hook for persistent tracking
export function useLatestVisits() {
    const [visits, setVisits] = useState<VisitedAnime[]>([])

    useEffect(() => {
        const saved = localStorage.getItem(VISITED_KEY)
        if (saved) {
            try {
                setVisits(JSON.parse(saved))
            } catch (e) {
                console.error('Failed to parse visits', e)
            }
        }
    }, [])

    const addVisit = (anime: Media) => {
        const newVisit: VisitedAnime = {
            id: anime.id,
            title: anime.title?.userPreferred || anime.title?.romaji || 'Unknown Anime',
            image: anime.coverImage?.large || anime.coverImage?.medium || '',
            timestamp: Date.now()
        }

        setVisits(prev => {
            const filtered = prev.filter(v => v.id !== anime.id)
            const updated = [newVisit, ...filtered].slice(0, MAX_VISITS)
            localStorage.setItem(VISITED_KEY, JSON.stringify(updated))
            return updated
        })
    }

    return { visits, addVisit }
}

// Memoized Registry Data Node
const RegistryNode = memo(({ anime, onClose, onVisit }: { anime: Media; onClose: () => void; onVisit: (a: Media) => void }) => {
    'use memo'
    return (
        <Link
            href={`/anime/${anime.id}`}
            onClick={() => {
                onVisit(anime)
                onClose()
            }}
            className="group/res flex items-center gap-6 p-4 sm:p-5 bg-white/1 border border-white/5 hover:border-primary/40 hover:bg-primary/5 transition-all index-cut-tr relative overflow-hidden"
        >
            <div
                className="absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 opacity-30 group-hover/res:opacity-100 transition-opacity"
                style={{ backgroundColor: anime.coverImage?.color || 'var(--primary)' }}
            />

            <div className="w-20 h-28 sm:w-24 sm:h-32 bg-secondary shrink-0 relative overflow-hidden border border-white/10 group-hover/res:border-primary/40 transition-colors shadow-2xl">
                <Image
                    src={anime.coverImage?.large || anime.coverImage?.medium || ''}
                    alt={anime.title?.romaji || ''}
                    fill
                    sizes="120px"
                    className="object-cover grayscale group-hover/res:grayscale-0 group-hover/res:scale-105 transition-all duration-1000 ease-out"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/90 to-transparent" />
            </div>

            <div className="flex-1 min-w-0 py-1">
                <div className="flex items-center gap-3 mb-3">
                    <span
                        className="font-mono text-[9px] font-black uppercase tracking-widest px-2.5 py-1 border border-white/10 bg-white/5 text-foreground/80"
                        style={{
                            boxShadow: anime.coverImage?.color ? `inset 0 0 10px ${anime.coverImage.color}20` : undefined,
                            borderColor: anime.coverImage?.color ? `${anime.coverImage.color}30` : undefined
                        }}
                    >
                        {anime.format || '??'}
                    </span>
                    <div className="h-px w-6 bg-white/5" />
                    <span className="font-mono text-[9px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">ARC-0x{anime.id}</span>
                </div>

                <h4 className="font-mono text-lg sm:text-xl font-black uppercase tracking-tight text-foreground group-hover/res:text-primary transition-colors truncate mb-4">
                    {anime.title?.userPreferred || anime.title?.romaji}
                </h4>

                <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                    <div className="flex items-center gap-2.5 group/stat">
                        <Star className="w-3.5 h-3.5 text-yellow-500/50 group-hover/stat:text-yellow-500 transition-colors" />
                        <span className="font-mono text-xs font-black text-foreground/60 tracking-wider">
                            {anime.averageScore ? `${anime.averageScore}%` : '---'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2.5 group/stat">
                        <PlayCircle className="w-3.5 h-3.5 text-primary/40 group-hover/stat:text-primary transition-colors" />
                        <span className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                            {anime.status?.replace(/_/g, ' ')}
                        </span>
                    </div>
                </div>
            </div>

            <div className="opacity-0 group-hover/res:opacity-100 transition-all duration-700 pr-4 translate-x-8 group-hover/res:translate-x-0 hidden sm:block">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-2 h-2 bg-primary rotate-45 shadow-[0_0_20px_var(--primary)] animate-pulse" />
                    <span className="font-mono text-[7px] font-black text-primary uppercase tracking-widest">GOTO_FILE</span>
                </div>
            </div>
        </Link>
    )
})
RegistryNode.displayName = 'RegistryNode'

// Isolated Command Input
const CommandInput = memo(({
    isOpen,
    onClose,
    onQueryChange
}: {
    isOpen: boolean;
    onClose: () => void;
    onQueryChange: (debounced: string) => void
}) => {
    'use memo'
    const [query, setQuery] = useState('')
    const [debounced] = useDebounce(query, 300)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                inputRef.current?.focus()
            }, 100)
            return () => clearTimeout(timer)
        } else {
            setQuery('')
        }
    }, [isOpen])

    useEffect(() => {
        onQueryChange(debounced)
    }, [debounced, onQueryChange])

    return (
        <div className="relative group/input">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-3 pointer-events-none text-muted-foreground/20 group-focus-within/input:text-primary transition-colors">
                <Terminal className="w-5 h-5" />
                <span className="font-mono text-[10px] font-bold opacity-40">&gt;_</span>
            </div>
            <input
                ref={inputRef}
                type="text"
                placeholder="ENTER_DATA_IDENTIFIER..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && query) {
                        onClose()
                        window.location.href = `/anime?search=${encodeURIComponent(query)}` as Route
                    }
                    if (e.key === 'Escape') onClose()
                }}
                className="w-full bg-white/2 border border-white/5 pl-20 pr-8 py-6 font-mono text-xl sm:text-2xl uppercase tracking-[0.1em] text-foreground outline-none focus:border-primary/40 focus:bg-white/3 transition-all placeholder:text-white/5"
            />
            <div className="absolute -bottom-px left-0 right-0 h-px bg-primary scale-x-0 group-focus-within/input:scale-x-100 transition-transform duration-700 origin-left shadow-[0_0_25px_var(--primary)]" />
        </div>
    )
})
CommandInput.displayName = 'CommandInput'

// Latest Visits Registry Component
const LatestVisits = memo(({ visits, onClose }: { visits: VisitedAnime[]; onClose: () => void }) => {
    'use memo'
    if (visits.length === 0) return null

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="font-mono text-[11px] font-black uppercase tracking-[0.5em] text-primary/40 flex items-center gap-3">
                    <History className="w-4 h-4" />
                    Archive_Access_Protocol // RECENT_UPLINKS
                </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {visits.map((visit) => (
                    <Link
                        key={visit.id}
                        href={`/anime/${visit.id}`}
                        onClick={onClose}
                        className="group flex items-center gap-6 p-5 bg-white/[0.04] border border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all index-cut-tr relative overflow-hidden"
                    >
                        {/* Dramatic Visual Identifier */}
                        <div className="w-20 h-28 sm:w-24 sm:h-32 bg-secondary overflow-hidden relative shrink-0 border border-white/10 group-hover:border-primary/40 shadow-2xl transition-all duration-700 group-hover:scale-[1.02]">
                            <Image
                                src={visit.image}
                                alt={visit.title}
                                fill
                                sizes="120px"
                                className="object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-1000 ease-out"
                            />
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/90 to-transparent opacity-60" />
                        </div>

                        {/* High-Contrast Metadata Bundle */}
                        <div className="flex-1 min-w-0 flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary/70 font-black">
                                    REG_0x{visit.id.toString(16).toUpperCase()}
                                </span>
                                <div className="h-px flex-1 bg-white/5" />
                            </div>

                            <h4 className="font-mono text-base sm:text-lg font-black uppercase tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                                {visit.title}
                            </h4>

                            <div className="flex items-center gap-3 mt-1">
                                <div className="flex gap-0.5">
                                    {[0, 1, 2].map(i => (
                                        <div key={i} className="w-1 h-3 bg-primary/20 group-hover:bg-primary/40 transition-colors" />
                                    ))}
                                </div>
                                <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/30 font-bold group-hover:text-muted-foreground/60 transition-colors italic">
                                    Cached_Telemetry_Ready
                                </span>
                            </div>
                        </div>

                        {/* Interaction Telemetry */}
                        <div className="opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 mr-1 hidden sm:block">
                            <div className="flex flex-col items-center gap-2">
                                <ArrowRight className="w-5 h-5 text-primary" />
                                <span className="font-mono text-[7px] font-black text-primary uppercase tracking-widest">GOTO</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
})
LatestVisits.displayName = 'LatestVisits'

// Isolated Search Results Logic
const SearchResults = memo(({ query, isOpen, onClose, onVisit }: { query: string; isOpen: boolean; onClose: () => void; onVisit: (a: Media) => void }) => {
    'use memo'
    const { data: searchData, isLoading: isSearching } = useGraphQL(SearchAnimeQuery, {
        search: query,
        perPage: 6
    }, {
        enabled: isOpen && query.length >= 2,
        staleTime: 60000
    })

    const results = (searchData as { Page?: { media?: Media[] } })?.Page?.media || []

    if (query.length < 2) return null

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="font-mono text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary animate-pulse" />
                    Registry_Data_Nodes
                    {isSearching && <span className="text-muted-foreground/30 ml-2 animate-pulse font-normal lowercase tracking-normal">Scanning...</span>}
                </h3>
                <span className="font-mono text-[9px] text-white/5 uppercase font-bold tracking-[0.2em]">0x{results.length.toString().padStart(2, '0')}_Match_Return</span>
            </div>

            <div className="grid gap-4">
                {results.length > 0 ? (
                    results.map((anime) => (
                        <RegistryNode
                            key={anime.id}
                            anime={anime}
                            onClose={onClose}
                            onVisit={onVisit}
                        />
                    ))
                ) : !isSearching && (
                    <div className="py-24 text-center border border-dashed border-white/5 bg-white/2 rounded-sm group/empty">
                        <div className="flex flex-col items-center gap-5">
                            <Cpu className="w-10 h-10 text-white/5 group-hover/empty:scale-110 transition-transform duration-700" />
                            <span className="font-mono text-[11px] uppercase tracking-[0.6em] text-muted-foreground/10 font-black">Null_Registry_Matches</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
})
SearchResults.displayName = 'SearchResults'

const RegistryModules = memo(({ menuItems, onClose }: { menuItems: any[]; onClose: () => void }) => {
    'use memo'
    return (
        <div className="space-y-6">
            <h3 className="font-mono text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/20 flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-current rotate-45" />
                Registry_Modules
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {menuItems.map((item) => (
                    <button
                        key={item.label}
                        onClick={() => {
                            onClose()
                            window.location.href = item.href as Route
                        }}
                        className="group flex flex-col p-6 bg-white/2 border border-white/5 hover:border-primary/40 hover:bg-primary/5 transition-all text-left index-cut-tr"
                    >
                        <span className="font-mono text-[9px] font-black text-primary/40 group-hover:text-primary transition-colors mb-2 tracking-[0.3em]">{item.code}</span>
                        <span className="font-mono text-[11px] font-black uppercase tracking-[0.2em] group-hover:translate-x-1.5 transition-transform text-foreground/70 group-hover:text-foreground">{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    )
})
RegistryModules.displayName = 'RegistryModules'

export function CommandPalette({ isOpen, onClose, menuItems }: CommandPaletteProps) {
    'use memo'
    const [activeQuery, setActiveQuery] = useState('')
    const { visits, addVisit } = useLatestVisits()

    return (
        <div
            className={cn(
                "fixed inset-0 z-200 flex items-start justify-center pt-8 sm:pt-24 px-4 transition-all duration-500",
                isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )}
        >
            <div
                role="button"
                tabIndex={0}
                className="absolute inset-0 bg-background/80 backdrop-blur-3xl"
                onClick={onClose}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClose()}
            />

            <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#888_1px,transparent_1px),linear-gradient(to_bottom,#888_1px,transparent_1px)] bg-size-[40px_40px]" />
                <div className="absolute top-0 left-0 w-full h-[60vh] bg-linear-to-b from-primary/30 via-primary/5 to-transparent animate-scan-slow opacity-20" />
            </div>

            <div
                className={cn(
                    "w-full max-w-3xl relative z-10 transition-all duration-500 delay-100 flex flex-col max-h-[85vh]",
                    isOpen ? "translate-y-0 scale-100" : "-translate-y-12 scale-95"
                )}
            >
                <div className="bg-[#050505] border border-white/5 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)] index-cut-tr flex flex-col overflow-hidden">
                    <div className="p-6 sm:p-10 border-b border-white/5 bg-[#080808]/50 shrink-0 relative">
                        <div className="flex items-center gap-5 mb-8">
                            <div className="w-12 h-12 flex items-center justify-center bg-primary/10 border border-primary/20 text-primary rounded-sm shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]">
                                <Search className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h2 className="font-mono text-[11px] font-black uppercase tracking-[0.6em] text-primary/70">Registry_Discovery_Protocol</h2>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                    <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/30 font-bold">Uplink: STABLE // SCAN_MODE: HIGH_RES</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2.5 rounded-full hover:bg-white/5 transition-all text-muted-foreground/30 hover:text-primary active:scale-95">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <CommandInput isOpen={isOpen} onClose={onClose} onQueryChange={setActiveQuery} />
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-10 space-y-12 min-h-0 bg-linear-to-b from-[#050505] to-black">
                        {activeQuery.length < 2 && visits.length > 0 && (
                            <div className="reveal">
                                <LatestVisits visits={visits} onClose={onClose} />
                            </div>
                        )}
                        <SearchResults query={activeQuery} isOpen={isOpen} onClose={onClose} onVisit={addVisit} />
                        <RegistryModules menuItems={menuItems} onClose={onClose} />
                    </div>

                    <div className="p-8 border-t border-white/5 bg-[#080808]/90 backdrop-blur-xl shrink-0 flex items-center justify-between">
                        <div className="flex items-center gap-10 text-muted-foreground/30 font-mono text-[9px] uppercase tracking-widest">
                            <div className="flex items-center gap-3">
                                <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-sm text-foreground/50 font-black">ENTER</span>
                                <span>Execute_Query</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-sm text-foreground/50 font-black">ESC</span>
                                <span>Sever_Uplink</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-primary/40 font-mono text-[9px] font-black tracking-[0.3em]">
                            <History className="w-3.5 h-3.5" />
                            <span>LATEST_SYNC: {new Date().toLocaleTimeString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
