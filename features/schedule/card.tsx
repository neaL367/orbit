'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { ExternalLink, Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getAnimeTitle, formatTimeUntilAiring } from '@/features/shared'
import { useCountdownTimer } from '@/hooks/use-countdown-timer'
import type { AiringSchedule } from '@/graphql/graphql'
import type { Route } from 'next'

type ScheduleCardProps = {
  schedule: AiringSchedule
  media: NonNullable<AiringSchedule['media']>
  formatTime: (timestamp: number) => string
  getStreamingLinks: (schedule: AiringSchedule) => Array<{
    site: string
    url: string
    icon?: string | null
    color?: string | null
  }>
}

export function ScheduleCard({ schedule, media, formatTime, getStreamingLinks }: ScheduleCardProps) {
  const title = getAnimeTitle(media)
  const coverImage = media.coverImage?.large || media.coverImage?.medium
  const coverImageSrcSet = useMemo(() => {
    const images = []
    if (media.coverImage?.medium) images.push(`${media.coverImage.medium} 300w`)
    if (media.coverImage?.large) images.push(`${media.coverImage.large} 600w`)
    if (media.coverImage?.extraLarge) images.push(`${media.coverImage.extraLarge} 1000w`)
    return images.length > 0 ? images.join(', ') : undefined
  }, [media])
  const format = media.format
  const streamingLinks = getStreamingLinks(schedule)
  
  const timeUntilAiring = useCountdownTimer(schedule.timeUntilAiring)
  const timeUntilAiringFormatted = formatTimeUntilAiring(timeUntilAiring)

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition-all group">
      <div className="p-4">
        <div className="flex gap-4">
          {/* Cover Image */}
          {coverImage && (
            <Link 
              href={`/anime/${media.id}` as Route}
              className="shrink-0"
            >
              <div className="relative w-24 h-36 sm:w-28 sm:h-40 rounded overflow-hidden">
                <img
                  src={coverImage}
                  srcSet={coverImageSrcSet}
                  sizes="(max-width: 640px) 96px, 112px"
                  alt={title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
            </Link>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Time & Episode */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-zinc-300 bg-zinc-800 px-2 py-1 rounded">
                {formatTime(schedule.airingAt)}
              </span>
              {timeUntilAiringFormatted && timeUntilAiring > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 bg-zinc-800/50 px-2 py-1 rounded">
                  <Clock className="h-3 w-3" />
                  {timeUntilAiringFormatted}
                </span>
              )}
              <Badge 
                variant="outline" 
                className="text-[10px] px-2 py-0.5 border-zinc-700 text-zinc-300"
              >
                Ep {schedule.episode}
              </Badge>
              {format && (
                <Badge 
                  variant="outline" 
                  className="text-[10px] px-2 py-0.5 border-zinc-700 text-zinc-300"
                >
                  {format.replace(/_/g, ' ')}
                </Badge>
              )}
            </div>

            {/* Title */}
            <Link 
              href={`/anime/${media.id}` as Route}
              className="block"
            >
              <h3 className="text-sm font-semibold text-white line-clamp-1 leading-tight hover:text-zinc-300 transition-colors">
                {title}
              </h3>
            </Link>

            {/* Streaming Links */}
            {streamingLinks.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-1">
                {streamingLinks.slice(0, 3).map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded bg-zinc-800/50 hover:bg-zinc-800"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span className="truncate max-w-[80px]">{link.site}</span>
                  </a>
                ))}
                {streamingLinks.length > 3 && (
                  <span className="text-[10px] text-zinc-500 px-2">
                    +{streamingLinks.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

