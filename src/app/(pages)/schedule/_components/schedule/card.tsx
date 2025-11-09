'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useCallback, memo } from 'react'
import { Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getAnimeTitle, formatTimeUntilAiring } from '@/lib/anime-utils'
import { useCurrentTime } from '@/hooks/use-current-time'
import type { AiringSchedule } from '@/lib/graphql/types/graphql'
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

function ScheduleCardComponent({ schedule, media, formatTime, getStreamingLinks }: ScheduleCardProps) {
  const router = useRouter()
  const now = useCurrentTime()
  const [imageLoaded, setImageLoaded] = useState(false)

  // Extract only necessary data from Media object
  const mediaData = useMemo(() => {
    return {
      id: media.id,
      title: getAnimeTitle(media),
      coverImage: media.coverImage?.medium || media.coverImage?.large || media.coverImage?.extraLarge || undefined,
      coverColor: media.coverImage?.color || '#000000',
      format: media.format,
      duration: media.duration,
      coverImageObj: media.coverImage, // Keep reference for srcset generation
    }
  }, [media])

  // Extract only necessary data from Schedule object
  const scheduleData = useMemo(() => {
    return {
      id: schedule.id,
      airingAt: schedule.airingAt,
      episode: schedule.episode,
    }
  }, [schedule])

  const title = mediaData.title
  const coverImage = mediaData.coverImage
  const coverColor = mediaData.coverColor
  const format = mediaData.format
  const streamingLinks = useMemo(() => getStreamingLinks(schedule), [schedule, getStreamingLinks])

  // Generate srcset for cover image - schedule cards are small (max 400px in grid)
  // Optimized widths to match actual display sizes in grid layout
  const coverSrcSet = useMemo(() => {
    if (!coverImage) return undefined
    const sizes = []
    if (mediaData.coverImageObj?.medium) sizes.push(`${mediaData.coverImageObj.medium} 250w`)
    if (mediaData.coverImageObj?.large) sizes.push(`${mediaData.coverImageObj.large} 350w`)
    if (mediaData.coverImageObj?.extraLarge) sizes.push(`${mediaData.coverImageObj.extraLarge} 450w`)
    return sizes.length > 1 ? sizes.join(', ') : undefined
  }, [mediaData.coverImageObj, coverImage])

  const timeUntilAiring = useMemo(() => {
    const timeUntil = scheduleData.airingAt - now
    return timeUntil > 0 ? timeUntil : 0
  }, [scheduleData.airingAt, now])

  const timeUntilAiringFormatted = formatTimeUntilAiring(timeUntilAiring)

  const status = useMemo(() => {
    const airingAt = scheduleData.airingAt
    const timeSinceAiring = now - airingAt

    if (timeSinceAiring < 0) return 'upcoming'

    const durationInSeconds = (mediaData.duration || 30) * 60
    const episodeEndTime = airingAt + durationInSeconds
    const finishedTime = episodeEndTime + 1800

    if (now > finishedTime) return 'finished'
    if (timeSinceAiring >= 0 && timeSinceAiring <= 1800 && now < episodeEndTime) return 'airing'
    if (now >= episodeEndTime && now <= finishedTime) return 'finished'

    return 'airing'
  }, [scheduleData.airingAt, mediaData.duration, now])
  
  const referrerData = useMemo(() => ({
    pathname: '/schedule',
    search: '',
    sort: null,
  }), [])

  const handleCardClick = useCallback(() => {
    sessionStorage.setItem('animeDetailReferrer', JSON.stringify(referrerData))
    sessionStorage.setItem('animeDetailTitle', title)
    router.push(`/anime/${mediaData.id}`)
  }, [referrerData, title, router, mediaData.id])
  
  const handleLinkClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    sessionStorage.setItem('animeDetailReferrer', JSON.stringify(referrerData))
    sessionStorage.setItem('animeDetailTitle', title)
  }, [referrerData, title])

  return (
    <Card 
      className="bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700/80 hover:bg-zinc-900/70 transition-all duration-200 group overflow-hidden cursor-pointer" 
      onClick={handleCardClick}
    >
      <div className="p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:gap-4">
          {coverImage && (
            <Link
              href={`/anime/${mediaData.id}` as Route}
              className="shrink-0"
              onClick={handleLinkClick}
            >
              <div className="relative w-full h-36 rounded-lg overflow-hidden ring-1 ring-zinc-800/50 group-hover:ring-zinc-700/50 transition-all">
                <div 
                  className="absolute inset-0 bg-zinc-800/50 transition-opacity duration-500"
                  style={{ 
                    backgroundColor: coverColor,
                    opacity: imageLoaded ? 0 : 1
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <img
                  src={coverImage}
                  srcSet={coverSrcSet}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  alt={title}
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageLoaded(true)}
                  className={cn(
                    'absolute inset-0 w-full h-full object-cover object-[25%_25%] group-hover:scale-110 transition-all duration-500',
                    imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                  )}
                />
              </div>
            </Link>
          )}

          <div className="flex-1 min-w-0 flex flex-col gap-2.5">
            <Link
              href={`/anime/${mediaData.id}` as Route}
              onClick={handleLinkClick}
              className="block"
            >
              <h3 className="text-sm sm:text-base font-bold text-white line-clamp-2 leading-snug group-hover:text-zinc-200 transition-colors">
                {title}
              </h3>
            </Link>

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

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-semibold text-zinc-300 bg-zinc-800/60 px-2 py-1 rounded-md border border-zinc-700/50">
                {formatTime(scheduleData.airingAt)}
              </span>
              <Badge
                variant="outline"
                className="text-[10px] sm:text-xs px-2 py-1 border-zinc-700/60 text-zinc-300 bg-zinc-800/40"
              >
                Ep {scheduleData.episode}
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

        {streamingLinks.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mt-2.5">
            {streamingLinks.slice(0, 4).map((link, idx) => {
              const linkColor = link.color || '#ffffff'
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
                        width={14}
                        height={14}
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                        referrerPolicy="no-referrer"
                        className="relative object-contain"
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

export const ScheduleCard = memo(ScheduleCardComponent, (prevProps, nextProps) => {
  // Compare schedule data
  if (prevProps.schedule.id !== nextProps.schedule.id) return false
  if (prevProps.schedule.airingAt !== nextProps.schedule.airingAt) return false
  if (prevProps.schedule.episode !== nextProps.schedule.episode) return false

  // Compare media data
  const prevMedia = prevProps.media
  const nextMedia = nextProps.media
  
  if (prevMedia.id !== nextMedia.id) return false
  
  // Compare title
  const prevTitle = prevMedia.title?.userPreferred || prevMedia.title?.romaji || prevMedia.title?.english
  const nextTitle = nextMedia.title?.userPreferred || nextMedia.title?.romaji || nextMedia.title?.english
  if (prevTitle !== nextTitle) return false
  
  // Compare cover image
  const prevCover = prevMedia.coverImage?.medium || prevMedia.coverImage?.large || prevMedia.coverImage?.extraLarge
  const nextCover = nextMedia.coverImage?.medium || nextMedia.coverImage?.large || nextMedia.coverImage?.extraLarge
  if (prevCover !== nextCover) return false
  
  // Compare cover color
  if (prevMedia.coverImage?.color !== nextMedia.coverImage?.color) return false
  
  // Compare format and duration
  if (prevMedia.format !== nextMedia.format) return false
  if (prevMedia.duration !== nextMedia.duration) return false

  // Compare function references (these should be stable, but check anyway)
  if (prevProps.formatTime !== nextProps.formatTime) return false
  if (prevProps.getStreamingLinks !== nextProps.getStreamingLinks) return false
  
  return true
})

