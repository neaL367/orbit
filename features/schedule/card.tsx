'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getAnimeTitle, formatTimeUntilAiring } from '@/features/shared'
import { useCurrentTime } from '@/hooks/use-current-time'
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
  const router = useRouter()
  const now = useCurrentTime()

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

  // Calculate time until airing from airingAt timestamp
  const timeUntilAiring = useMemo(() => {
    const airingAt = schedule.airingAt
    const timeUntil = airingAt - now
    return timeUntil > 0 ? timeUntil : 0
  }, [schedule.airingAt, now])

  const timeUntilAiringFormatted = formatTimeUntilAiring(timeUntilAiring)

  // Determine status: airing now (within 30 minutes) or finished
  const status = useMemo(() => {
    const airingAt = schedule.airingAt
    const timeSinceAiring = now - airingAt

    // Upcoming: hasn't aired yet
    if (timeSinceAiring < 0) {
      return 'upcoming'
    }

    // Duration is in minutes, convert to seconds. If null, use 30 minutes (1800 seconds) as default
    const durationInSeconds = (media.duration || 30) * 60
    const episodeEndTime = airingAt + durationInSeconds // When episode actually ends
    const finishedTime = episodeEndTime + 1800 // airingAt + duration + 30 min buffer

    // Finished: current time > (airingAt + duration + 30 minutes)
    if (now > finishedTime) {
      return 'finished'
    }

    // Airing now: started within last 30 minutes AND episode hasn't finished yet
    if (timeSinceAiring >= 0 && timeSinceAiring <= 1800 && now < episodeEndTime) {
      return 'airing'
    }

    // Episode has finished but within 30 minute buffer - show finished
    if (now >= episodeEndTime && now <= finishedTime) {
      return 'finished'
    }

    // Between 30 minutes and finished time - still airing but not showing badge
    return 'airing'
  }, [schedule.airingAt, media.duration, now])

  const handleCardClick = () => {
    router.push(`/anime/${media.id}`)
  }

  return (
    <Card className="bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700/80 hover:bg-zinc-900/70 transition-all duration-200 group overflow-hidden cursor-pointer" onClick={handleCardClick}>
      <div className="p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Cover Image - Mobile (< sm) and Large (>= lg) */}
          {coverImage && (
            <>
              {/* Mobile: coverImage */}
              <Link
                href={`/anime/${media.id}` as Route}
                className="shrink-0 "
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative w-full h-36 rounded-lg overflow-hidden ring-1 ring-zinc-800/50 group-hover:ring-zinc-700/50 transition-all">
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <img
                    src={coverImage}
                    srcSet={coverImageSrcSet}
                    sizes="(max-width: 640px) 100vw"
                    alt={title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-[25%_25%] group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </Link>
            </>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col gap-2.5">
            {/* Title */}
            <Link
              href={`/anime/${media.id}` as Route}
              onClick={(e) => e.stopPropagation()}
              className="block"
            >
              <h3 className="text-sm sm:text-base font-bold text-white line-clamp-2 leading-snug group-hover:text-zinc-200 transition-colors">
                {title}
              </h3>
            </Link>

            {/* Status Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              {status === 'airing' && (
                <Badge className="text-[10px] sm:text-xs px-2 py-1 bg-green-500/20 text-green-400 border-green-500/50 shadow-sm shadow-green-500/20">
                  <Clock className="h-3 w-3 mr-1.5" />
                  Airing Now
                </Badge>
              )}
              {status === 'finished' && (
                <Badge className="text-[10px] sm:text-xs px-2 py-1 bg-zinc-700/60 text-zinc-400 border-zinc-600/60">
                  Finished
                </Badge>
              )}
              {status === 'upcoming' && timeUntilAiringFormatted && timeUntilAiring > 0 && (
                <Badge variant="outline" className="text-[10px] sm:text-xs px-2 py-1 border-blue-500/40 text-blue-400 bg-blue-500/10">
                  <Clock className="h-3 w-3 mr-1.5" />
                  {timeUntilAiringFormatted}
                </Badge>
              )}
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-semibold text-zinc-300 bg-zinc-800/60 px-2 py-1 rounded-md border border-zinc-700/50">
                {formatTime(schedule.airingAt)}
              </span>
              <Badge
                variant="outline"
                className="text-[10px] sm:text-xs px-2 py-1 border-zinc-700/60 text-zinc-300 bg-zinc-800/40"
              >
                Ep {schedule.episode}
              </Badge>
              {format && (
                <Badge
                  variant="outline"
                  className="text-[10px] sm:text-xs px-2 py-1 border-zinc-700/60 text-zinc-400 bg-zinc-800/30"
                >
                  {format.replace(/_/g, ' ')}
                </Badge>
              )}
            </div>


          </div>

        </div>
        {/* Streaming Links */}
        {streamingLinks.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mt-2.5">
            {streamingLinks.slice(0, 4).map((link, idx) => {
              const linkColor = link.color || "#ffffff"
              const linkIcon = link.icon

              return (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md backdrop-blur-sm border transition-all hover:scale-105 hover:shadow-lg active:scale-95"
                  style={{
                    backgroundColor: `${linkColor}18`,
                    borderColor: `${linkColor}50`,
                  }}
                >
                  {linkIcon ? (
                    <div className="relative w-3.5 h-3.5 shrink-0">
                      <div
                        className="absolute inset-0 rounded"
                        style={{ backgroundColor: linkColor }}
                      />
                      <img
                        src={linkIcon}
                        alt={link.site}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className="relative w-full h-full object-contain"
                        style={{ filter: `drop-shadow(0 0 2px ${linkColor}90)` }}
                      />
                    </div>
                  ) : (
                    <div
                      className="w-3.5 h-3.5 rounded shrink-0"
                      style={{ backgroundColor: linkColor }}
                    />
                  )}
                  <span className="text-[10px] sm:text-[11px] font-medium text-white truncate max-w-[70px] sm:max-w-[90px]">
                    {link.site}
                  </span>
                </a>
              )
            })}
            {streamingLinks.length > 4 && (
              <span className="text-[10px] sm:text-[11px] text-zinc-500 font-medium px-2">
                +{streamingLinks.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

