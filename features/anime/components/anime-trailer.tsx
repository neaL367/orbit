"use client"

import { PrecisionPlayer } from "@/components/shared/precision-player"
import { cn } from "@/lib/utils"

interface AnimeTrailerProps {
  videoId: string
  title?: string
  thumbnail?: string | null
  className?: string
}

/**
 * Detail-page trailer: precision player (ambient palette, supersampled desktop path).
 * Autoplay is off — user explicitly starts playback to avoid surprise audio and YouTube UI flashes.
 */
export function AnimeTrailer({
  videoId,
  title,
  thumbnail,
  className,
}: AnimeTrailerProps) {
  if (!videoId) return null

  const displayTitle = title?.trim() || "Trailer"

  return (
    <div className={cn("w-full", className)}>
      <PrecisionPlayer
        videoId={videoId}
        title={displayTitle}
        externalPosterUrl={thumbnail ?? undefined}
        id={`anime-trailer-${videoId}`}
      />
    </div>
  )
}
