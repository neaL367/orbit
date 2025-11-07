'use client'

import Link from 'next/link'
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

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition-all group">
      <div className="p-2 sm:p-3">
        <div className="flex gap-2 sm:gap-3">
          {/* Cover Image */}
          {coverImage && (
            <Link 
              href={`/anime/${media.id}` as Route}
              className="shrink-0"
            >
              <div className="relative w-16 h-24 sm:w-20 sm:h-28 rounded overflow-hidden">
                <img
                  src={coverImage}
                  srcSet={coverImageSrcSet}
                  sizes="(max-width: 640px) 64px, 80px"
                  alt={title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
            </Link>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-1.5">
            {/* Time & Episode */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] sm:text-xs font-semibold text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded">
                {formatTime(schedule.airingAt)}
              </span>
              {status === 'airing' && (
                <Badge className="text-[9px] sm:text-[10px] px-1.5 py-0.5 bg-green-500/20 text-green-400 border-green-500/40">
                  <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                  Airing Now
                </Badge>
              )}
              {status === 'finished' && (
                <Badge className="text-[9px] sm:text-[10px] px-1.5 py-0.5 bg-zinc-700/50 text-zinc-400 border-zinc-600/50">
                  Finished
                </Badge>
              )}
              {status === 'upcoming' && timeUntilAiringFormatted && timeUntilAiring > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium text-zinc-400 bg-zinc-800/50 px-1.5 py-0.5 rounded">
                  <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  {timeUntilAiringFormatted}
                </span>
              )}
              <Badge 
                variant="outline" 
                className="text-[9px] sm:text-[10px] px-1.5 py-0.5 border-zinc-700 text-zinc-300"
              >
                Ep {schedule.episode}
              </Badge>
              {format && (
                <Badge 
                  variant="outline" 
                  className="text-[9px] sm:text-[10px] px-1.5 py-0.5 border-zinc-700 text-zinc-300"
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
              <h3 className="text-xs sm:text-sm font-semibold text-white line-clamp-1 leading-tight hover:text-zinc-300 transition-colors">
                {title}
              </h3>
            </Link>

            {/* Streaming Links */}
            {streamingLinks.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                {streamingLinks.slice(0, 2).map((link, idx) => {
                  const linkColor = link.color || "#ffffff"
                  const linkIcon = link.icon
                  
                  return (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg backdrop-blur-sm border transition-all hover:shadow-md"
                      style={{
                        backgroundColor: `${linkColor}15`,
                        borderColor: `${linkColor}40`,
                      }}
                    >
                      {linkIcon ? (
                        <div className="relative w-3 h-3 shrink-0">
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
                            className="absolute inset-0 w-full h-full object-contain"
                            style={{ filter: `drop-shadow(0 0 2px ${linkColor}80)` }}
                          />
                        </div>
                      ) : (
                        <div
                          className="w-3 h-3 rounded shrink-0"
                          style={{ backgroundColor: linkColor }}
                        />
                      )}
                      <span className="text-[9px] sm:text-[10px] font-medium text-white truncate max-w-[60px] sm:max-w-[80px]">
                        {link.site}
                      </span>
                    </a>
                  )
                })}
                {streamingLinks.length > 2 && (
                  <span className="text-[9px] sm:text-[10px] text-zinc-500 px-1.5">
                    +{streamingLinks.length - 2}
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

