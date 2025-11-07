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
      className="group relative block rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all hover:shadow-lg"
    >
      <div className="relative aspect-video w-full">
        {/* Thumbnail */}
        {thumbnail ? (
          <>
            <div className="absolute inset-0 bg-zinc-800" />
            <img
              src={thumbnail}
              alt={title}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onLoad={() => setThumbnailLoaded(true)}
              className={cn(
                "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
                thumbnailLoaded ? "opacity-100" : "opacity-0"
              )}
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
            <Play className="w-12 h-12 text-zinc-600" />
          </div>
        )}

        {/* Overlay with play button */}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white/30 transition-colors duration-300 transform group-hover:scale-110">
            <Play className="w-8 h-8 text-white ml-1 fill-white" />
          </div>
        </div>

        {/* Site badge */}
        {site && (
          <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/70 backdrop-blur-sm border border-white/20">
            <span className="text-[10px] font-medium text-white uppercase tracking-wide">
              {site}
            </span>
          </div>
        )}
      </div>

      {/* Title */}
      <div className="p-3">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-white line-clamp-2 leading-tight group-hover:text-zinc-300 transition-colors flex-1">
            {title}
          </h4>
          <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-zinc-400 transition-colors shrink-0" />
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
    <div className="mt-16 space-y-8">
      <div>
        <h2 className="text-3xl md:text-4xl font-bold mb-3">Streaming Episodes</h2>
        <p className="text-zinc-400 text-sm md:text-base">Watch episodes on legal streaming platforms</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedEpisodes.map((episode, index) => (
          <StreamingEpisodeItem key={index} episode={episode} />
        ))}
      </div>
      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={handleLoadMore}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 text-white font-medium transition-all hover:shadow-lg"
          >
            <span>Load More</span>
            <ChevronDown className="w-4 h-4" />
            <span className="text-xs text-zinc-400">
              ({validEpisodes.length - visibleCount} remaining)
            </span>
          </button>
        </div>
      )}
    </div>
  )
}

