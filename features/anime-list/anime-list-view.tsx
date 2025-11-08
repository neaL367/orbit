'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Filters } from '@/features/anime-filters'
import { AnimeCard } from '@/features/shared'
import { LoadMore, Empty, Loading } from './'
import type { Media } from '@/graphql/graphql'

type AnimeListViewProps = {
  data: (Media | null)[]
  title: string
  searchInput: string
  onSearchChange: (value: string) => void
  showRank?: boolean
  onLoadMore: () => void
  isLoadingMore: boolean
  hasMore: boolean
  isEmpty: boolean
  isLoading?: boolean
  loadingCount?: number
}

export function AnimeListView({
  data,
  title,
  searchInput,
  onSearchChange,
  showRank,
  onLoadMore,
  isLoadingMore,
  hasMore,
  isEmpty,
  isLoading = false,
  loadingCount = 24,
}: AnimeListViewProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Header Section - Always Visible */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">{title}</h1>
          {/* {data.length > 0 && (
            <p className="text-zinc-400 mb-6">
              {data.length} anime found
            </p>
          )} */}

          {/* Search Input */}
          <div className="my-6 flex items-center gap-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                type="search"
                placeholder="Search anime..."
                value={searchInput}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:border-zinc-700"
              />
            </div>
            <Filters />
          </div>
        </div>

        {/* Content Section - Shows loading, empty, or data */}
        {isLoading ? (
          <Loading count={loadingCount} />
        ) : isEmpty ? (
          <Empty />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-12">
              {data.map((anime, index) => {
                if (!anime) return null
                const rank = showRank ? index + 1 : undefined
                return <AnimeCard key={anime.id} anime={anime} rank={rank} />
              })}
            </div>

            <LoadMore
              onLoadMore={onLoadMore}
              isLoading={isLoadingMore}
              hasMore={hasMore}
            />
          </>
        )}
      </div>
    </div>
  )
}

