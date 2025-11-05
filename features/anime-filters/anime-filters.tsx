"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import { useDebouncedCallback } from "use-debounce"
import { X, Check, Sliders, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { MediaFormat, MediaSeason, MediaStatus } from "@/graphql/graphql"
import type { Route } from "next"

type AnimeFiltersProps = {
  className?: string
}

const COMMON_GENRES = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Ecchi",
  "Fantasy",
  "Horror",
  "Mahou Shoujo",
  "Mecha",
  "Music",
  "Mystery",
  "Psychological",
  "Romance",
  "Sci-Fi",
  "Slice of Life",
  "Sports",
  "Supernatural",
  "Thriller",
]

const FORMATS: { value: MediaFormat; label: string }[] = [
  { value: "TV" as MediaFormat, label: "TV" },
  { value: "MOVIE" as MediaFormat, label: "Movie" },
  { value: "OVA" as MediaFormat, label: "OVA" },
  { value: "ONA" as MediaFormat, label: "ONA" },
  { value: "SPECIAL" as MediaFormat, label: "Special" },
]

const SEASONS: { value: MediaSeason; label: string }[] = [
  { value: "WINTER" as MediaSeason, label: "Winter" },
  { value: "SPRING" as MediaSeason, label: "Spring" },
  { value: "SUMMER" as MediaSeason, label: "Summer" },
  { value: "FALL" as MediaSeason, label: "Fall" },
]

const STATUSES: { value: MediaStatus; label: string }[] = [
  { value: "RELEASING" as MediaStatus, label: "Releasing" },
  { value: "FINISHED" as MediaStatus, label: "Finished" },
  { value: "NOT_YET_RELEASED" as MediaStatus, label: "Not Yet Released" },
  { value: "CANCELLED" as MediaStatus, label: "Cancelled" },
  { value: "HIATUS" as MediaStatus, label: "Hiatus" },
]

type AnimeFacetedFilterProps = {
  title: string
  options: { label: string; value: string }[]
  selectedValues: string[]
  onSelect: (value: string) => void
  onClear: () => void
  isMultiSelect?: boolean
  hasSearch?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  popoverWidth?: string
}

function AnimeFacetedFilter({
  title,
  options,
  selectedValues,
  onSelect,
  onClear,
  isMultiSelect = false,
  hasSearch = false,
  open,
  onOpenChange,
  popoverWidth = "w-[200px]",
}: AnimeFacetedFilterProps) {
  const selectedSet = new Set(selectedValues)

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircle className="mr-2 h-4 w-4" />
          {title}
          {selectedSet.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedSet.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedSet.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedSet.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedSet.has(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={String(option.value)}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className={`${popoverWidth} p-0`} align="start">
        <Command>
          {hasSearch && <CommandInput placeholder={title} />}
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedSet.has(option.value)
                return (
                  <CommandItem
                    key={String(option.value)}
                    onSelect={() => {
                      if (isMultiSelect) {
                        onSelect(option.value)
                      } else {
                        onSelect(isSelected ? "" : option.value)
                      }
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className="h-4 w-4" />
                    </div>
                    <span>{option.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selectedSet.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={onClear}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}


export function AnimeFilters({ className }: AnimeFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Generate years from 1940 to present
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const yearsList: number[] = []
    for (let year = currentYear; year >= 1940; year--) {
      yearsList.push(year)
    }
    return yearsList
  }, [])

  // Get current filter values from URL
  const genres = useMemo(() => {
    return searchParams.get("genres")?.split(",").filter(Boolean) || []
  }, [searchParams])

  const year = searchParams.get("year") || ""
  const season = searchParams.get("season") || ""
  const format = searchParams.get("format") || ""
  const status = searchParams.get("status") || ""

  // State for popover open/close
  const [openStates, setOpenStates] = useState<Record<string, boolean>>({
    genres: false,
    year: false,
    season: false,
    format: false,
    status: false,
    presets: false,
  })

  const setOpenState = (key: string, value: boolean) => {
    setOpenStates((prev) => ({ ...prev, [key]: value }))
  }


  const updateFilters = useDebouncedCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete("page")
      router.push(`/anime?${params.toString()}` as Route)
    },
    300,
  )

  const toggleGenre = useDebouncedCallback(
    (genre: string) => {
      const currentGenres = genres
      const newGenres = currentGenres.includes(genre)
        ? currentGenres.filter((g) => g !== genre)
        : [...currentGenres, genre]
      updateFilters("genres", newGenres.join(","))
    },
    300,
  )

  const clearAllFilters = useDebouncedCallback(() => {
    const params = new URLSearchParams()
    const sort = searchParams.get("sort")
    if (sort) params.set("sort", sort)
    router.push(`/anime?${params.toString()}` as Route)
  }, 300)


  // Filter configurations
  const filterConfigs = useMemo(() => {
    const genreOptions = COMMON_GENRES.map((genre) => ({ label: genre, value: genre }))
    const yearOptions = years.map((year) => ({ label: year.toString(), value: year.toString() }))
    const seasonOptions = SEASONS.map((s) => ({ label: s.label, value: s.value }))
    const formatOptions = FORMATS.map((f) => ({ label: f.label, value: f.value }))
    const statusOptions = STATUSES.map((s) => ({ label: s.label, value: s.value }))

    return [
      {
        key: "genres",
        title: "Genres",
        options: genreOptions,
        selectedValues: genres,
        isMultiSelect: true,
        hasSearch: true,
        popoverWidth: "w-[200px]",
      },
      {
        key: "year",
        title: "Year",
        options: yearOptions,
        selectedValues: year ? [year] : [],
        isMultiSelect: false,
        hasSearch: false,
        popoverWidth: "w-[200px]",
      },
      {
        key: "season",
        title: "Season",
        options: seasonOptions,
        selectedValues: season ? [season] : [],
        isMultiSelect: false,
        hasSearch: false,
        popoverWidth: "w-[200px]",
      },
      {
        key: "format",
        title: "Format",
        options: formatOptions,
        selectedValues: format ? [format] : [],
        isMultiSelect: false,
        hasSearch: false,
        popoverWidth: "w-[200px]",
      },
      {
        key: "status",
        title: "Status",
        options: statusOptions,
        selectedValues: status ? [status] : [],
        isMultiSelect: false,
        hasSearch: false,
        popoverWidth: "w-[200px]",
      },
    ]
  }, [genres, year, season, format, status, years])

  const hasActiveFilters = genres.length > 0 || year || season || format || status

  return (
    <div className={`mb-8 ${className}`}>
      {/* Header with title and clear action */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="h-6 w-6" />
          <h2 className="text-2xl font-semibold tracking-tight">Filters</h2>
        </div>
      </div>    

      {/* Filter buttons */}
      <div className="mt-6 flex flex-wrap gap-3 md:gap-2">
        {filterConfigs.map((filter) => {
          const handleSelect = (value: string) => {
            if (filter.key === "genres") {
              toggleGenre(value)
            } else {
              updateFilters(filter.key, value)
            }
          }

          const handleClear = () => {
            updateFilters(filter.key, "")
          }

          return (
            <AnimeFacetedFilter
              key={filter.key}
              title={filter.title}
              options={filter.options}
              selectedValues={filter.selectedValues}
              onSelect={handleSelect}
              onClear={handleClear}
              isMultiSelect={filter.isMultiSelect}
              hasSearch={filter.hasSearch}
              open={openStates[filter.key] || false}
              onOpenChange={(open) => setOpenState(filter.key, open)}
              popoverWidth={filter.popoverWidth}
            />
          )
        })}

        {/* Reset Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearAllFilters}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
