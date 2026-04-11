"use client"

import React, { useState, useEffect } from 'react'
import { cn } from "@/lib/utils"
import { SEASONS } from "@/features/anime/components/anime-filters/constants"
import type { MediaSeason } from "@/lib/graphql/types/graphql"

interface DiscoveryControlsProps {
  isFiltersOpen: boolean
  setIsFiltersOpen: (open: boolean) => void
  activeFilterCount: number
  hasActiveFilters: string | boolean | number
  clearFilters: () => void
  sort: string
  season?: MediaSeason | null
  year?: number | null
  setFilter: (key: any, value: any) => void
  currentSeason: MediaSeason
  currentYear: number
}

export function DiscoveryControls({
  isFiltersOpen,
  setIsFiltersOpen,
  activeFilterCount,
  hasActiveFilters,
  clearFilters,
  sort,
  season,
  year,
  setFilter,
  currentSeason,
  currentYear
}: DiscoveryControlsProps) {
  const [showStickyFilter, setShowStickyFilter] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyFilter(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* Mobile Control Console */}
      <div 
        className="lg:hidden sticky z-40 bg-background/95 backdrop-blur-xl border-y border-white/10 px-4 py-3 flex items-center justify-between group overflow-hidden shadow-2xl transition-all duration-300 mb-8"
        style={{ top: 'calc(var(--nav-visible, 1) * 80px - 1px)' }}
      >
        <div className="absolute inset-0 bg-white/2 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        <div className="flex flex-col gap-0.5 relative z-10">
          <span className="font-mono text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
            Control
          </span>
          {activeFilterCount > 0 && (
            <span className="font-mono text-[8px] uppercase text-primary font-bold tracking-tight">
              Parameters: {activeFilterCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 relative z-10">
          {hasActiveFilters && (
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
            className="font-mono text-[10px] uppercase bg-foreground text-background px-5 py-2 index-cut-tr font-black hover:bg-primary transition-all flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] cursor-pointer"
          >
            {isFiltersOpen ? "SHUTDOWN" : "CONFIG"}
          </button>
        </div>
      </div>

      {/* Seasonal Temporal Controls */}
      {sort === 'seasonal' && (
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
                    (season || currentSeason) === s.value
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
                onClick={() => setFilter("year", (parseInt((year || currentYear).toString()) - 1).toString())}
                className="px-2 py-1 font-mono text-[10px] text-muted-foreground hover:bg-white/5 transition-all cursor-pointer"
              >
                -
              </button>
              <div className="px-4 py-1 font-mono text-[10px] font-bold text-primary border-x border-border/30 min-w-[50px] text-center">
                {year || currentYear}
              </div>
              <button
                onClick={() => setFilter("year", (parseInt((year || currentYear).toString()) + 1).toString())}
                className="px-2 py-1 font-mono text-[10px] text-muted-foreground hover:bg-white/5 transition-all cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Sticky Toggle */}
      <div 
        className={cn(
          "fixed bottom-12 right-12 z-50 transition-all duration-500 transform",
          showStickyFilter && !isFiltersOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-20 opacity-0 scale-50 pointer-events-none"
        )}
      >
        <button
          onClick={() => setIsFiltersOpen(true)}
          className="relative flex items-center gap-4 bg-foreground text-background p-4 sm:px-6 sm:py-4 index-cut-tr shadow-[8px_8px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group cursor-pointer"
        >
          <div className="flex flex-col items-start gap-0.5 leading-none">
            <span className="font-mono text-[7px] uppercase tracking-widest opacity-40 font-black">Interface</span>
            <span className="font-mono text-[11px] uppercase font-black tracking-widest">Config</span>
          </div>
          <div className="w-8 h-8 flex items-center justify-center bg-background/10 border border-background/20 group-hover:rotate-90 transition-transform">
            <div className="w-1.5 h-1.5 bg-current" />
          </div>
          {activeFilterCount > 0 && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-primary-foreground flex items-center justify-center font-mono text-[10px] font-black index-cut-tr">
              {activeFilterCount}
            </div>
          )}
        </button>
      </div>
    </>
  )
}
