import { format, fromUnixTime } from 'date-fns'
import type { AiringSchedule } from '@/graphql/graphql'

export function formatTime(timestamp: number): string {
  const date = fromUnixTime(timestamp)
  return format(date, 'h:mm a')
}

export function getStreamingLinks(schedule: AiringSchedule): Array<{
  site: string
  url: string
  icon?: string | null
  color?: string | null
}> {
  const media = schedule.media
  if (!media) return []

  // Get external links that are streaming sites
  const externalStreaming = (media.externalLinks || [])
    .filter(link => link?.type === 'STREAMING' && link?.url)
    .map(link => ({
      site: link?.site || 'Unknown',
      url: link?.url ?? '',
      icon: link?.icon,
      color: link?.color,
    }))

  // Get streaming episodes
  const streamingEpisodes = (media.streamingEpisodes || [])
    .filter(ep => ep?.url)
    .map(ep => ({
      site: ep?.site || 'Unknown',
      url: ep?.url ?? '',
      icon: undefined,
      color: undefined,
    }))

  return [...externalStreaming, ...streamingEpisodes]
}

