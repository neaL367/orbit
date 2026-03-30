"use client"

import React from 'react'
import { PosterCard } from "@/features/anime/components/poster-card"
import { ErrorState } from "@/components/shared/error-state"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import type { Media } from "@/lib/graphql/types/graphql"

interface DiscoveryGridProps {
  animeList: Media[]
  isLoading: boolean
  isError: boolean
  fetchNextPage: () => void
  hasNextPage?: boolean
  isFetchingNextPage: boolean
  showRank?: boolean
}

export function DiscoveryGrid({
  animeList,
  isLoading,
  isError,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  showRank
}: DiscoveryGridProps) {
  const { targetRef } = useIntersectionObserver(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage()
    }
  })

  if (isError) {
    return <ErrorState message="Request Failed: Registry Temporarily Unreachable" />
  }

  if (isLoading && animeList.length === 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10">
        {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10">
        {animeList.map((anime, index) => (
          <PosterCard
            key={anime.id}
            anime={anime}
            rank={showRank ? index + 1 : undefined}
          />
        ))}

        {isFetchingNextPage && Array.from({ length: 12 }).map((_, i) => (
          <SkeletonCard key={`fetching-${i}`} />
        ))}
      </div>

      {/* Infinite Scroll Trigger */}
      <div className="space-y-12">
        {isFetchingNextPage && (
          <div className="flex flex-col items-center gap-3 py-10 opacity-60">
            <div className="flex items-center gap-3">
              <div className="w-1 h-1 bg-primary animate-ping" />
              <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-primary font-black animate-pulse">Syncing_Archive_Nexus</span>
            </div>
          </div>
        )}

        {hasNextPage && !isFetchingNextPage && (
          <div ref={targetRef} className="h-96 w-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-6 group">
              <div className="w-16 h-px bg-white/10 group-hover:w-32 group-hover:bg-primary/40 transition-all duration-700" />
              <div className="flex flex-col items-center gap-1">
                <span className="font-mono text-[9px] uppercase tracking-[0.6em] text-muted-foreground/30 font-black">Archive_Waiting_For_Sync</span>
              </div>
              <button
                onClick={() => fetchNextPage()}
                className="mt-4 px-6 py-2 border border-white/5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground hover:border-primary/50 hover:text-primary transition-all cursor-pointer bg-white/2"
              >
                Force_Manual_Sync
              </button>
            </div>
          </div>
        )}

        {!hasNextPage && animeList.length > 0 && (
          <div className="py-20 flex flex-col items-center gap-6 opacity-40">
            <div className="h-px w-32 bg-linear-to-r from-transparent via-white/20 to-transparent" />
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] font-black">Archive_Full_Scan_Complete</span>
            <div className="h-px w-32 bg-linear-to-r from-transparent via-white/20 to-transparent" />
          </div>
        )}
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="aspect-[2/3] bg-white/5 border border-white/5 animate-pulse index-cut-tr overflow-hidden relative">
      <div className="absolute inset-0 bg-linear-to-tr from-primary/5 via-transparent to-transparent" />
      <div className="h-full w-full flex flex-col justify-end p-4">
        <div className="h-1 w-1/2 bg-white/10 mb-2" />
        <div className="h-1 w-1/4 bg-white/10" />
      </div>
    </div>
  )
}
