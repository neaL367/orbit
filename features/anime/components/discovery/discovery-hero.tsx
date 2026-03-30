"use client"

import React from 'react'
import { AmbientGlow } from "@/components/shared/ambient-glow"
import type { MediaSeason } from "@/lib/graphql/types/graphql"

interface DiscoveryHeroProps {
  sort: string
  season?: MediaSeason | null
  year?: number | null
  activeFilterCount: number
  onOpenFilters: () => void
  currentSeason: MediaSeason
  currentYear: number
}

export function DiscoveryHero({
  sort,
  season,
  year,
  activeFilterCount,
  onOpenFilters,
  currentSeason,
  currentYear
}: DiscoveryHeroProps) {
  return (
    <header className="relative pt-12">
      <AmbientGlow variant="primary" />
      
      <div className="flex flex-col gap-10 mb-16 border-b border-white/5 pb-12 relative z-10">
        {/* Status Line */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary/20 rounded-full" />
              <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-primary/40 font-black">Archive_Index</span>
            </div>
            <div className="h-px w-12 bg-white/5 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2">
              <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/30 font-bold">Node:</span>
              <span className="font-mono text-[9px] uppercase text-foreground/40 font-black">US_WEST_01</span>
            </div>
          </div>

          <div className="flex items-center gap-6 font-mono text-[9px] uppercase tracking-widest">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
              <span className="hidden xs:inline">Registry_Stable</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="space-y-8 max-w-4xl">
            <div className="flex flex-wrap items-center gap-4">
              <div className="inline-flex items-center gap-3 px-3 py-1 bg-primary/10 border border-primary/20 rounded-sm">
                <div className="w-1.5 h-1.5 bg-primary animate-pulse" />
                <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-primary font-black">
                  {sort === 'seasonal' ? "Temporal_Registry_Sync" : "Persistent_Archive_Stream"}
                </span>
              </div>
            </div>
            
            <div className="relative">
              <h1 className="font-mono text-6xl sm:text-8xl lg:text-[10rem] font-black uppercase tracking-[-0.04em] text-foreground leading-[0.85] reveal-text">
                {sort === 'seasonal'
                  ? `${season || currentSeason} ${year || currentYear}`
                  : sort.replace('-', '\n')}
              </h1>
              <div className="absolute -left-12 top-0 bottom-0 w-px bg-linear-to-b from-primary/50 via-transparent to-transparent hidden xl:block" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 lg:self-end">
            {activeFilterCount > 0 && (
              <div className="flex flex-col items-end px-4 py-2 border-r border-white/5 mr-2">
                <span className="font-mono text-[8px] uppercase tracking-widest text-primary/40 font-black leading-none mb-1">States</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[14px] font-black text-primary">{activeFilterCount}</span>
                  <span className="font-mono text-[10px] text-muted-foreground/40 font-bold underline decoration-primary/20 underline-offset-4">VAR</span>
                </div>
              </div>
            )}

            <button
              onClick={onOpenFilters}
              className="flex-1 lg:flex-none flex items-center gap-6 bg-foreground text-background px-8 py-4 index-cut-tr hover:bg-primary hover:text-primary-foreground transition-all duration-500 group shadow-[12px_12px_0px_rgba(255,255,255,0.05)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:scale-[0.98] cursor-pointer"
            >
              <div className="flex flex-col items-start gap-0.5">
                <span className="font-mono text-[8px] uppercase tracking-widest opacity-40 font-black leading-none mb-0.5">Command</span>
                <span className="font-mono text-[14px] uppercase font-black tracking-widest leading-none">CONFIG_PARAMS</span>
              </div>
              <div className="w-8 h-8 flex items-center justify-center bg-background/10 border border-background/20 group-hover:border-primary-foreground/30 group-hover:rotate-90 transition-all">
                <div className="w-2 h-2 bg-current" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
