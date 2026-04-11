"use client"

import { YouTubeTrailerEmbed } from "@/components/shared/youtube-trailer-embed"

interface AnimeTrailerProps {
  videoId: string
  title?: string
  thumbnail?: string | null
}

export function AnimeTrailer({ videoId, title, thumbnail }: AnimeTrailerProps) {
  if (!videoId) return null

  return (
    <div className="w-full">
      <YouTubeTrailerEmbed videoId={videoId} title={title} thumbnail={thumbnail} />
    </div>
  )
}
