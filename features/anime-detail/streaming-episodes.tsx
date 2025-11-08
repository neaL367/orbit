"use client"

import Link from "next/link"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Play, ExternalLink, ChevronDown } from "lucide-react"
import type { MediaStreamingEpisode } from "@/graphql/graphql"
import type { Route } from "next"

type StreamingEpisodesProps = {
  streamingEpisodes: Array<MediaStreamingEpisode | null>
}

function StreamingEpisodeItem({ episode }: { episode: MediaStreamingEpisode | null }) {
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false)
  
  if (!episode || !episode.url) return null

  const title = episode.title || "Episode"
  const thumbnail = episode.thumbnail
  const site = episode.site || "Streaming Site"

  return (
    <Link
      href={episode.url as Route}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block rounded-xl overflow-hidden bg-zinc-900/60 border border-zinc-800/50 hover:border-zinc-700/80 hover:bg-zinc-900/80 transition-all duration-200 hover:shadow-xl"
    >
      <div className="relative aspect-video w-full">
        {/* Thumbnail */}
        {thumbnail ? (
          <>
            <div 
              className="absolute inset-0 bg-zinc-800 transition-opacity duration-500"
              style={{ opacity: thumbnailLoaded ? 0 : 1 }}
            />
            <img
              src={thumbnail}
              alt={title}
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              referrerPolicy="no-referrer"
              onLoad={() => setThumbnailLoaded(true)}
              className={cn(
                "absolute inset-0 w-full h-full object-cover transition-all duration-500",
                thumbnailLoaded ? "opacity-100" : "opacity-0"
              )}
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
            <Play className="w-14 h-14 text-zinc-600" />
          </div>
        )}

        {/* Overlay with play button */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent group-hover:from-black/50 group-hover:via-black/20 transition-all duration-300 flex items-center justify-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:bg-white/30 group-hover:border-white/40 transition-all duration-300 transform group-hover:scale-110 shadow-2xl">
            <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-1 fill-white" />
          </div>
        </div>

        {/* Site badge */}
        {site && (
          <div className="absolute top-3 right-3 px-2.5 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/30 shadow-lg">
            <span className="text-[10px] font-semibold text-white uppercase tracking-wide">
              {site}
            </span>
          </div>
        )}
      </div>

      {/* Title */}
      <div className="p-4">
        <div className="flex items-start gap-2.5">
          <h4 className="text-sm font-bold text-white line-clamp-2 leading-tight group-hover:text-zinc-200 transition-colors flex-1">
            {title}
          </h4>
          <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 mt-0.5 transition-colors shrink-0" />
        </div>
      </div>
    </Link>
  )
}

export function StreamingEpisodes({ streamingEpisodes }: StreamingEpisodesProps) {
  const [visibleCount, setVisibleCount] = useState(6)
  const validEpisodes = streamingEpisodes.filter((ep) => ep?.url)
  const displayedEpisodes = validEpisodes.slice(0, visibleCount)
  const hasMore = validEpisodes.length > visibleCount

  if (validEpisodes.length === 0) return null

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 12, validEpisodes.length))
  }

  return (
    <div id="streaming-episodes" className="space-y-6 scroll-mt-24">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">Streaming Episodes</h2>
        <p className="text-sm text-zinc-400">Watch episodes on legal streaming platforms</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {displayedEpisodes.map((episode, index) => (
          <StreamingEpisodeItem key={index} episode={episode} />
        ))}
      </div>
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={handleLoadMore}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-800/60 hover:bg-zinc-700/60 border border-zinc-700/60 hover:border-zinc-600/60 text-white font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
          >
            <span>Load More</span>
            <ChevronDown className="w-4 h-4" />
            <span className="text-xs text-zinc-400 font-medium">
              ({validEpisodes.length - visibleCount} remaining)
            </span>
          </button>
        </div>
      )}
    </div>
  )
}

