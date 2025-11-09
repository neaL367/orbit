"use client"

import { useMemo } from "react"
import { FilterX, Tags, Calendar, Clock, Film, PlayCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { FilterButtonGroup, Dropdown, COMMON_GENRES, FORMATS, SEASONS, STATUSES } from "./"
import { useAnimeFilters } from "../../_hooks/use-anime-filters"

type FiltersProps = {
  className?: string
}

export function Filters({ className }: FiltersProps) {
  const {
    years,
    genres,
    year,
    season,
    format,
    status,
    selectedGenres,
    selectedYear,
    selectedSeason,
    selectedFormat,
    selectedStatus,
    open,
    setOpen,
    popoverOpen,
    setPopoverOpenState,
    handleFilterSelect,
    handleClearFilter,
    clearAllFilters,
  } = useAnimeFilters()

  const genreOptions = useMemo(() => COMMON_GENRES.map((genre) => ({ label: genre, value: genre })), [])
  const yearOptions = useMemo(() => years.map((year) => ({ label: year.toString(), value: year.toString() })), [years])
  const seasonOptions = useMemo(() => SEASONS.map((s) => ({ label: s.label, value: s.value })), [])
  const formatOptions = useMemo(() => FORMATS.map((f) => ({ label: f.label, value: f.value })), [])
  const statusOptions = useMemo(() => STATUSES.map((s) => ({ label: s.label, value: s.value })), [])

  const hasActiveFilters = genres.length > 0 || year || season || format || status

  // Filter categories with icons
  const filterCategories = useMemo(() => [
    {
      key: "genres" as const,
      label: "Genres",
      icon: Tags,
      options: genreOptions,
      selectedValues: selectedGenres,
      isMultiSelect: true,
      value: genres.length > 0 ? (genres.length === 1 ? genres[0] : `${genres.length} selected`) : "Select...",
      displayValue: genres.length > 0 ? (genres.length === 1 ? genres[0] : `${genres.length} selected`) : "Select...",
    },
    {
      key: "year" as const,
      label: "Year",
      icon: Calendar,
      options: yearOptions,
      selectedValues: selectedYear,
      isMultiSelect: false,
      value: year || "",
      displayValue: year || "Select...",
    },
    {
      key: "season" as const,
      label: "Season",
      icon: Clock,
      options: seasonOptions,
      selectedValues: selectedSeason,
      isMultiSelect: false,
      value: season || "",
      displayValue: season ? (SEASONS.find((s) => s.value === season)?.label || season) : "Select...",
    },
    {
      key: "format" as const,
      label: "Format",
      icon: Film,
      options: formatOptions,
      selectedValues: selectedFormat,
      isMultiSelect: false,
      value: format || "",
      displayValue: format ? (FORMATS.find((f) => f.value === format)?.label || format) : "Select...",
    },
    {
      key: "status" as const,
      label: "Status",
      icon: PlayCircle,
      options: statusOptions,
      selectedValues: selectedStatus,
      isMultiSelect: false,
      value: status || "",
      displayValue: status ? (STATUSES.find((s) => s.value === status)?.label || status) : "Select...",
    },
  ], [
    genreOptions,
    yearOptions,
    seasonOptions,
    formatOptions,
    statusOptions,
    selectedGenres,
    selectedYear,
    selectedSeason,
    selectedFormat,
    selectedStatus,
    genres,
    year,
    season,
    format,
    status,
  ])

  const handleCategorySelect = (categoryKey: string) => {
    setOpen(false)
    setPopoverOpenState(categoryKey, true)
  }

  const handleOptionSelect = (categoryKey: string, optionValue: string, isMultiSelect: boolean) => {
    handleFilterSelect(categoryKey, optionValue, isMultiSelect)
  }

  return (
    <div className={cn(className, 'flex flex-wrap  gap-2')}>
      <div className="flex items-center gap-2 flex-wrap">
        <Dropdown
          open={open}
          onOpenChange={setOpen}
          categories={filterCategories}
          onCategorySelect={handleCategorySelect}
          onOptionSelect={handleOptionSelect}
        />

        {/* Filter Button Groups */}
        {filterCategories.map((category) => {
          const hasValue = category.value !== "" && (category.key !== "genres" || genres.length > 0)
          const isOpen = popoverOpen[category.key] || false

          return (
            <FilterButtonGroup
              key={category.key}
              category={category}
              hasValue={hasValue}
              isOpen={isOpen}
              onSelect={(key, value) => handleOptionSelect(key, value, category.isMultiSelect)}
              onClear={handleClearFilter}
              onOpenChange={(isOpen) => setPopoverOpenState(category.key, isOpen)}
            />
          )
        })}

      </div>
      {/* Clear Button */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearAllFilters}
          className="h-8"
        >
          <FilterX className="mr-2 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  )
}

