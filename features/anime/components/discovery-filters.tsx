"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { COMMON_GENRES, SEASONS, FORMATS } from "@/features/anime/components/anime-filters/constants"
import { useAnimeFilters } from "@/features/anime/hooks/use-anime-filters"
import { Sheet } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const SORT_OPTIONS = [
  { label: "Trending", value: "trending", code: "TRD" },
  { label: "Seasonal", value: "seasonal", code: "SEA" },
  { label: "Popular", value: "popular", code: "POP" },
  { label: "Top rated", value: "top-rated", code: "RTD" },
] as const

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
    attributes: false,
  })

  const { filters, setFilter, setSearch, clearFilters, toggleGenre } = useAnimeFilters()

  const toggleGenreRef = useRef(toggleGenre)
  toggleGenreRef.current = toggleGenre

  const years = React.useMemo(
    () => Array.from({ length: 50 }, (_, i) => (new Date().getFullYear() + 1 - i).toString()),
    []
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleSection = useCallback((section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }, [])

  const hasActiveFilters =
    filters.search ||
    filters.genres.length > 0 ||
    filters.year ||
    filters.season ||
    filters.format ||
    filters.status ||
    filters.sort !== "trending"

  if (!mounted) return null

  return (
    <Sheet open={isOpen} onClose={onClose} title="Discovery filters">
      <div className="relative flex h-full min-h-0 flex-col p-6 lg:p-10">
        <div className="pointer-events-none absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#888_1px,transparent_1px),linear-gradient(to_bottom,#888_1px,transparent_1px)] bg-size-[40px_40px]" />
        </div>

        <div className="relative z-10 mb-10 flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[9px] font-black uppercase leading-none tracking-[0.35em] text-muted-foreground/50">
              Filters
            </span>
            <div className="flex items-center gap-3">
              <h2 className="font-mono text-base font-black uppercase tracking-widest text-foreground">
                Parameters
              </h2>
              <div className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="destructiveGhost"
              size="sm"
              disabled={!hasActiveFilters}
              onClick={clearFilters}
              className="mr-1 normal-case"
            >
              Clear all
            </Button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close filters"
              className="flex h-10 w-10 items-center justify-center border border-white/10 bg-white/5 index-cut-tr transition-[background-color,border-color] hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>

        <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-10 overflow-y-auto overflow-x-hidden pb-10 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="group/search relative">
            <div className="absolute bottom-0 left-0 top-0 w-[2px] bg-white/10 transition-colors group-focus-within/search:bg-primary" />
            <div className="space-y-3 pl-6">
              <label
                htmlFor="query-seeker"
                className="block font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground opacity-80"
              >
                Search titles
              </label>
              <Input
                id="query-seeker"
                name="anime-search"
                type="search"
                autoComplete="off"
                placeholder="Search the archive…"
                defaultValue={filters.search}
                onChange={(e) => setSearch(e.target.value)}
                className="normal-case tracking-normal"
              />
            </div>
          </div>

          <div className="space-y-10">
            <div className="space-y-5">
              <button
                type="button"
                onClick={() => toggleSection("sort")}
                className="group/header flex w-full cursor-pointer select-none items-center justify-between focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-2 w-2 border border-white/40 transition-colors group-hover/header:border-primary",
                      openSections.sort ? "border-primary bg-primary" : "bg-transparent"
                    )}
                    aria-hidden
                  />
                  <span
                    className={cn(
                      "font-mono text-[11px] font-black uppercase tracking-[0.2em] transition-colors",
                      openSections.sort ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    Sort
                  </span>
                </div>
                <div
                  className={cn(
                    "h-2 w-[2px] bg-white/20 transition-all group-hover/header:h-4 group-hover/header:bg-primary",
                    openSections.sort ? "rotate-90" : ""
                  )}
                  aria-hidden
                />
              </button>

              <div
                className={cn(
                  "flex flex-col gap-1 overflow-hidden border-l border-white/5 pl-5 transition-[max-height,opacity] duration-500",
                  openSections.sort ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
                )}
              >
                {SORT_OPTIONS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setFilter("sort", item.value)}
                    className={cn(
                      "flex cursor-pointer items-center justify-between border border-transparent px-4 py-3 font-mono text-[10px] uppercase tracking-widest transition-[background-color,border-color,color,transform] hover:bg-white/5",
                      filters.sort === item.value
                        ? "translate-x-3 border-l-primary/50 bg-primary/5 text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {filters.sort === item.value && (
                        <div className="h-1 w-1 rounded-full bg-primary" aria-hidden />
                      )}
                      {item.label}
                    </div>
                    <span className="text-[8px] font-bold opacity-30">{item.code}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <button
                type="button"
                onClick={() => toggleSection("temporal")}
                className="group/header flex w-full cursor-pointer select-none items-center justify-between focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-2 w-2 border border-white/40 transition-colors group-hover/header:border-primary",
                      openSections.temporal ? "border-primary bg-primary" : "bg-transparent"
                    )}
                    aria-hidden
                  />
                  <span
                    className={cn(
                      "font-mono text-[11px] font-black uppercase tracking-[0.35em] transition-colors",
                      openSections.temporal ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    Season & year
                  </span>
                </div>
                <div
                  className={cn(
                    "h-2 w-[2px] bg-white/20 transition-all group-hover/header:h-4 group-hover/header:bg-primary",
                    openSections.temporal ? "rotate-90" : ""
                  )}
                  aria-hidden
                />
              </button>

              <div
                className={cn(
                  "mb-2 grid grid-cols-2 gap-4 overflow-hidden border-l border-white/5 pl-5 transition-[max-height,opacity] duration-500",
                  openSections.temporal ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                )}
              >
                <div className="space-y-2">
                  <span className="block pl-1 font-mono text-[9px] font-bold uppercase text-muted-foreground/60">
                    Year
                  </span>
                  <select
                    title="Year"
                    name="filter-year"
                    className="w-full cursor-pointer border border-white/10 bg-white/5 px-4 py-3 font-mono text-[12px] font-bold uppercase text-foreground outline-none transition-[border-color,background-color] focus:border-primary/50 index-cut-tr"
                    value={filters.year || ""}
                    onChange={(e) => setFilter("year", e.target.value)}
                  >
                    <option value="" className="bg-background text-foreground">
                      All years
                    </option>
                    {years.map((y) => (
                      <option key={y} value={y} className="bg-background text-foreground">
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <span className="block pl-1 font-mono text-[9px] font-bold uppercase text-muted-foreground/60">
                    Season
                  </span>
                  <select
                    title="Season"
                    name="filter-season"
                    className="w-full cursor-pointer border border-white/10 bg-white/5 px-4 py-3 font-mono text-[12px] font-bold uppercase text-foreground outline-none transition-[border-color,background-color] focus:border-primary/50 index-cut-tr"
                    value={filters.season || ""}
                    onChange={(e) => setFilter("season", e.target.value)}
                  >
                    <option value="" className="bg-background text-foreground">
                      All seasons
                    </option>
                    {SEASONS.map((s) => (
                      <option key={s.value} value={s.value} className="bg-background text-foreground">
                        {s.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <button
                type="button"
                onClick={() => toggleSection("genres")}
                className="group/header flex w-full cursor-pointer select-none items-center justify-between focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-2 w-2 border border-white/40 transition-colors group-hover/header:border-primary",
                      openSections.genres ? "border-primary bg-primary" : "bg-transparent"
                    )}
                    aria-hidden
                  />
                  <span
                    className={cn(
                      "font-mono text-[11px] font-black uppercase tracking-widest transition-colors",
                      openSections.genres ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    Genres
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] text-primary tabular-nums">{filters.genres.length}</span>
                  <div
                    className={cn(
                      "h-2 w-[2px] bg-white/20 transition-all group-hover/header:h-4 group-hover/header:bg-primary",
                      openSections.genres ? "rotate-90" : ""
                    )}
                    aria-hidden
                  />
                </div>
              </button>

              <div
                className={cn(
                  "relative overflow-hidden transition-[max-height,opacity] duration-500",
                  openSections.genres ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                )}
              >
                <div className="flex max-h-[400px] flex-wrap gap-2 overflow-y-auto overflow-x-hidden border-l border-white/5 pb-4 pl-5 pr-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {COMMON_GENRES.map((genre) => (
                    <GenreButton
                      key={genre}
                      genre={genre}
                      isSelected={filters.genres.includes(genre)}
                      toggleRef={toggleGenreRef}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <button
                type="button"
                onClick={() => toggleSection("attributes")}
                className="group/header flex w-full cursor-pointer select-none items-center justify-between focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-2 w-2 border border-white/40 transition-colors group-hover/header:border-primary",
                      openSections.attributes ? "border-primary bg-primary" : "bg-transparent"
                    )}
                    aria-hidden
                  />
                  <span
                    className={cn(
                      "font-mono text-[11px] font-black uppercase tracking-[0.2em] transition-colors",
                      openSections.attributes ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    Format
                  </span>
                </div>
                <div
                  className={cn(
                    "h-2 w-[2px] bg-white/20 transition-all group-hover/header:h-4 group-hover/header:bg-primary",
                    openSections.attributes ? "rotate-90" : ""
                  )}
                  aria-hidden
                />
              </button>

              <div
                className={cn(
                  "flex flex-col gap-1 overflow-hidden border-l border-white/5 pl-5 transition-[max-height,opacity] duration-500",
                  openSections.attributes ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
                )}
              >
                {FORMATS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setFilter("format", f.value)}
                    className={cn(
                      "group flex cursor-pointer items-center justify-between border border-transparent px-4 py-3 font-mono text-[10px] uppercase tracking-widest transition-[background-color,border-color,color,transform] hover:bg-white/5",
                      filters.format === f.value
                        ? "translate-x-3 border-l-primary/50 bg-primary/5 text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "h-1.5 w-1.5 transition-[background-color]",
                          filters.format === f.value
                            ? "animate-pulse bg-primary"
                            : "bg-white/10 group-hover:bg-white/30"
                        )}
                        aria-hidden
                      />
                      <span className={cn(filters.format === f.value ? "font-bold text-foreground" : "")}>
                        {f.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-auto border-t border-white/10 bg-white/2 p-2 pt-6">
          <Button type="button" size="lg" className="w-full gap-3 normal-case" onClick={onClose}>
            Apply & close
          </Button>
        </div>
      </div>
    </Sheet>
  )
}

const GenreButton = React.memo(
  function GenreButton({
    genre,
    isSelected,
    toggleRef,
  }: {
    genre: string
    isSelected: boolean
    toggleRef: React.MutableRefObject<(g: string) => void>
  }) {
    return (
      <button
        type="button"
        onClick={() => toggleRef.current(genre)}
        className={cn(
          "cursor-pointer border px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-[background-color,border-color,color,box-shadow] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          isSelected
            ? "border-primary bg-primary text-primary-foreground shadow-[0_0_12px_rgba(255,255,255,0.08)]"
            : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/25 hover:bg-white/10 hover:text-foreground"
        )}
      >
        {genre.replace(/_/g, " ")}
      </button>
    )
  },
  (a, b) => a.genre === b.genre && a.isSelected === b.isSelected && a.toggleRef === b.toggleRef
)

GenreButton.displayName = "GenreButton"
