"use client"

import { cn } from "@/lib/utils"
import { COMMON_GENRES, FORMATS, SEASONS, STATUSES } from "./"
import { useAnimeFilters } from "@/features/anime/hooks/use-anime-filters"
import { AnimexPanel, AnimexChip } from "@/components/shared/animex-primitives"

export function Filters({ className }: { className?: string }) {
  const {
    filters,
    years,
    toggleGenre,
    setFilter,
    clearFilters,
  } = useAnimeFilters()

  const hasActiveFilters = filters.genres.length > 0 || filters.year || filters.season || filters.format || filters.status

  return (
    <AnimexPanel className={cn("mb-20 bg-transparent p-0 border-none", className)}>
      <div className="space-y-12">
        {/* Genre selection as a clean list */}
        <div className="flex flex-wrap gap-x-8 gap-y-4">
          {COMMON_GENRES.slice(0, 15).map((genre) => (
            <AnimexChip
              key={genre}
              label={genre}
              active={filters.genres.includes(genre)}
              onClick={() => toggleGenre(genre)}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 pt-8 border-t border-white/5">
          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-[0.4em] text-white/20">Year</span>
            <div className="flex flex-col items-start gap-2">
              {years.slice(0, 5).map((y) => (
                <AnimexChip
                  key={y}
                  label={y.toString()}
                  active={filters.year === y.toString()}
                  onClick={() => setFilter("year", y.toString())}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-[0.4em] text-white/20">Season</span>
            <div className="flex flex-col items-start gap-2">
              {SEASONS.map((s) => (
                <AnimexChip
                  key={s.value}
                  label={s.label}
                  active={filters.season === s.value}
                  onClick={() => setFilter("season", s.value)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-[0.4em] text-white/20">Format</span>
            <div className="flex flex-col items-start gap-2">
              {FORMATS.slice(0, 4).map((f) => (
                <AnimexChip
                  key={f.value}
                  label={f.label}
                  active={filters.format === f.value}
                  onClick={() => setFilter("format", f.value)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-[0.4em] text-white/20">Status</span>
            <div className="flex flex-col items-start gap-2">
              {STATUSES.map((s) => (
                <AnimexChip
                  key={s.value}
                  label={s.label}
                  active={filters.status === s.value}
                  onClick={() => setFilter("status", s.value)}
                />
              ))}
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-[9px] uppercase tracking-[0.4em] text-primary hover:underline underline-offset-8"
          >
            Reset Filters
          </button>
        )}
      </div>
    </AnimexPanel>
  )
}
