'use client'

import { Suspense, useMemo, useCallback, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import { Search, ArrowUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAnimeList } from '@/hooks/use-anime-list'
import { AnimeCard, BackButton } from '@/features/shared'
import { Filters } from '@/features/anime-filters'
import {
  Loading,
  Error,
  Empty,
  LoadMore,
} from '@/features/anime-list'
import type { Route } from 'next'

type SortType = 'trending' | 'popular' | 'top-rated' | 'seasonal' | 'search'

function getPageTitle(sort: SortType, search?: string, season?: string, year?: string): string {
  if (sort === 'search' && search) {
    return `Search: ${search}`
  }
  switch (sort) {
    case 'trending':
      return 'Trending Now'
    case 'popular':
      return 'All Time Popular'
    case 'top-rated':
      return 'Top 100'
    case 'seasonal':
      if (season && year) {
        const capitalizedSeason = season.charAt(0).toUpperCase() + season.slice(1).toLowerCase()
        return `${capitalizedSeason} ${year} Anime`
      }
      return 'Seasonal Anime'
    default:
      return 'Anime'
  }
}

function AnimeListContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sort = (searchParams.get('sort') || 'trending') as SortType
  const searchQuery = searchParams.get('search') || ''
  const season = searchParams.get('season') || undefined
  const year = searchParams.get('year') || undefined

  const [searchInput, setSearchInput] = useState(searchQuery)
  const [showScrollToTop, setShowScrollToTop] = useState(false)

  // Update local state when URL search param changes
  useEffect(() => {
    setSearchInput(searchQuery)
  }, [searchQuery])

  // Handle scroll to top button visibility
  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY || document.documentElement.scrollTop
          setShowScrollToTop(scrollY > 400) // Show button after scrolling 400px
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }, [])

  const {
    animeList,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    showRank,
    perPage,
  } = useAnimeList()

  const title = useMemo(
    () => getPageTitle(sort, searchQuery, season, year),
    [sort, searchQuery, season, year]
  )

  const handleSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value.trim()) {
      params.set('search', value.trim())
      params.set('sort', 'search')
    } else {
      params.delete('search')
      params.delete('sort')
    }
    params.delete('page')
    router.push(`/anime?${params.toString()}` as Route)
  }, 300)

  const handleLoadMore = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16" style={{ maxWidth: '1680px' }}>
        <div className="mb-8">
          <BackButton className="mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-2">{title}</h1>
          <p className="text-zinc-400 mb-6">
            {animeList.length > 0 && `${animeList.length} anime loaded`}
          </p>

          {/* Search Input */}
          <div className="mb-6 flex items-center gap-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                type="search"
                placeholder="Search anime..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value)
                  handleSearch(e.target.value)
                }}
                className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:border-zinc-700"
              />
            </div>
              <Filters />
          </div>

        </div>

        {isLoading && animeList.length === 0 && (
          <Loading count={perPage} />
        )}

        {error && <Error onRetry={() => refetch()} />}

        {animeList.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-12">
              {animeList.map((anime, index) => {
                if (!anime) return null
                const rank = showRank ? index + 1 : undefined
                return <AnimeCard key={anime.id} anime={anime} rank={rank} />
              })}
            </div>

            <LoadMore
              onLoadMore={handleLoadMore}
              isLoading={isFetchingNextPage}
              hasMore={hasNextPage}
            />
          </>
        )}

        {!isLoading && !error && animeList.length === 0 && <Empty />}
      </div>

      {/* Scroll to Top Button */}
      <Button
        onClick={scrollToTop}
        className={cn(
          'fixed bottom-8 right-8 z-50 h-12 w-12 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 shadow-lg transition-all duration-300',
          showScrollToTop
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        )}
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-5 w-5 text-white" />
      </Button>
    </div>
  )
}

export default function AnimeListPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16" style={{ maxWidth: '1680px' }}>
            <Loading count={24} />
          </div>
        </div>
      }
    >
      <AnimeListContent />
    </Suspense>
  )
}