"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import { useDebouncedCallback } from "use-debounce"
import type { Route } from "next"

export function useAnimeFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState<Record<string, boolean>>({
    genres: false,
    year: false,
    season: false,
    format: false,
    status: false,
  })

  const setPopoverOpenState = (key: string, isOpen: boolean) => {
    setPopoverOpen((prev) => ({ ...prev, [key]: isOpen }))
  }

  // Generate years from 1940 to next year
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const yearsList: number[] = []
    for (let year = currentYear + 1; year >= 1940; year--) {
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

  const selectedGenres = new Set(genres)
  const selectedYear = year ? new Set([year]) : new Set<string>()
  const selectedSeason = season ? new Set([season]) : new Set<string>()
  const selectedFormat = format ? new Set([format]) : new Set<string>()
  const selectedStatus = status ? new Set([status]) : new Set<string>()

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
    setOpen(false)
  }, 300)

  const handleFilterSelect = (categoryKey: string, optionValue: string, isMultiSelect: boolean) => {
    if (categoryKey === "genres") {
      toggleGenre(optionValue)
    } else {
      let selectedValues: Set<string>
      if (categoryKey === "year") {
        selectedValues = selectedYear
      } else if (categoryKey === "season") {
        selectedValues = selectedSeason
      } else if (categoryKey === "format") {
        selectedValues = selectedFormat
      } else {
        selectedValues = selectedStatus
      }
      
      const isSelected = selectedValues.has(optionValue)
      updateFilters(categoryKey, isSelected ? "" : optionValue)
      if (!isMultiSelect) {
        setPopoverOpenState(categoryKey, false)
      }
    }
  }

  const handleClearFilter = (categoryKey: string) => {
    updateFilters(categoryKey, "")
    setPopoverOpenState(categoryKey, false)
  }

  return {
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
  }
}

