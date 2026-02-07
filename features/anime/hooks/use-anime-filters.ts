"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback, useMemo } from "react"
import { useDebouncedCallback } from "use-debounce"
import type { Route } from "next"

/**
 * Hook for managing anime filters with URL state synchronization.
 * Supports genres (multi-select), year, season, format, and status (single-select).
 */
export function useAnimeFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentFilters = useMemo(() => {
    return {
      search: searchParams.get("search") || "",
      genres: searchParams.get("genres")?.split(",").filter(Boolean) || [],
      year: searchParams.get("year") || "",
      season: searchParams.get("season") || "",
      format: searchParams.get("format") || "",
      status: searchParams.get("status") || "",
      sort: searchParams.get("sort") || "trending",
      page: parseInt(searchParams.get("page") || "1", 10),
    }
  }, [searchParams])

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: 60 }, (_, i) => (currentYear + 1 - i).toString())
  }, [])

  const updateUrl = useDebouncedCallback((newFilters: Partial<typeof currentFilters>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(newFilters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          params.set(key, value.join(","))
        } else {
          params.delete(key)
        }
      } else if (value) {
        params.set(key, value.toString())
      } else {
        params.delete(key)
      }
    })

    // Reset page on filter change unless explicitly setting page
    if (!newFilters.page) {
      params.delete("page")
    }

    router.push(`${pathname}?${params.toString()}` as Route, { scroll: false })
  }, 300)

  const setSearch = useCallback((term: string) => {
    updateUrl({ search: term })
  }, [updateUrl])

  const toggleGenre = useCallback((genre: string) => {
    const newGenres = currentFilters.genres.includes(genre)
      ? currentFilters.genres.filter((g) => g !== genre)
      : [...currentFilters.genres, genre]
    updateUrl({ genres: newGenres })
  }, [currentFilters.genres, updateUrl])

  const setFilter = useCallback((key: keyof typeof currentFilters, value: string) => {
    updateUrl({ [key]: value === currentFilters[key] ? "" : value })
  }, [currentFilters, updateUrl])

  const clearFilters = useCallback(() => {
    router.push(pathname as Route, { scroll: false })
  }, [pathname, router])

  return {
    filters: currentFilters,
    years,
    toggleGenre,
    setFilter,
    setSearch,
    clearFilters,
  }
}
