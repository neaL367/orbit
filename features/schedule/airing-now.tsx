'use client'

import { useMemo, useState, useEffect } from 'react'
import { ScheduleCard } from './card'
import { SectionHeader } from '@/features/shared'
import { Badge } from '@/components/ui/badge'
import { Radio } from 'lucide-react'
import type { AiringSchedule } from '@/graphql/graphql'

type AiringNowSectionProps = {
  schedules: AiringSchedule[]
  formatTime: (timestamp: number) => string
  getStreamingLinks: (schedule: AiringSchedule) => Array<{
    site: string
    url: string
    icon?: string | null
    color?: string | null
  }>
}

export function AiringNow({ schedules, formatTime, getStreamingLinks }: AiringNowSectionProps) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000))

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000))
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  // Group schedules by how recently they started airing
  const { currentlyAiring, recentlyStarted } = useMemo(() => {
    const current: AiringSchedule[] = []
    const recent: AiringSchedule[] = []

    schedules.forEach((schedule) => {
      const airingAt = schedule.airingAt
      const timeSinceStart = now - airingAt

      // Currently airing (started within last 5 minutes)
      if (timeSinceStart >= 0 && timeSinceStart <= 300) {
        current.push(schedule)
      }
      // Recently started (started within last 30 minutes)
      else if (timeSinceStart > 300 && timeSinceStart <= 1800) {
        recent.push(schedule)
      }
    })

    // Sort by airing time
    current.sort((a, b) => a.airingAt - b.airingAt)
    recent.sort((a, b) => a.airingAt - b.airingAt)

    return {
      currentlyAiring: current,
      recentlyStarted: recent,
    }
  }, [schedules, now])

  const hasSchedules = schedules.length > 0

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <SectionHeader
            title="Airing Now"
            subtitle="Episodes currently airing or recently started"
            className="mb-0"
          />
          {hasSchedules && (
            <Badge variant="outline" className="text-xs px-2 py-1 border-zinc-700 text-zinc-300">
              {schedules.length}
            </Badge>
          )}
        </div>
      </div>

      {!hasSchedules ? (
        <div className="flex-1 flex items-center justify-center text-sm text-zinc-600 text-center py-12 rounded-lg border border-zinc-800 bg-zinc-900/30 min-h-[400px]">
          <div className="space-y-2">
            <Radio className="h-8 w-8 mx-auto text-zinc-700" />
            <p>No anime currently airing</p>
            <p className="text-xs text-zinc-600">Check back later for new episodes</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 h-[500px] overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
          {/* Currently Airing Section */}
          {currentlyAiring.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/50">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <h3 className="text-sm font-semibold text-green-400">
                    Live Now
                  </h3>
                </div>
                <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-zinc-700 text-zinc-400">
                  {currentlyAiring.length}
                </Badge>
              </div>
              <div className="space-y-3">
                {currentlyAiring.map((schedule) => {
                  const media = schedule.media
                  if (!media) return null

                  return (
                    <div key={schedule.id} className="relative">
                      {/* Live indicator glow */}
                      <div className="absolute -inset-0.5 bg-green-500/20 rounded-lg blur-sm opacity-50 animate-pulse" />
                      <div className="relative">
                        <ScheduleCard
                          schedule={schedule}
                          media={media}
                          formatTime={formatTime}
                          getStreamingLinks={getStreamingLinks}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Recently Started Section */}
          {recentlyStarted.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/50 pt-2">
                <h3 className="text-sm font-semibold text-zinc-400">
                  Recently Started
                </h3>
                <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-zinc-700 text-zinc-400">
                  {recentlyStarted.length}
                </Badge>
              </div>
              <div className="space-y-3">
                {recentlyStarted.map((schedule) => {
                  const media = schedule.media
                  if (!media) return null

                  return (
                    <ScheduleCard
                      key={schedule.id}
                      schedule={schedule}
                      media={media}
                      formatTime={formatTime}
                      getStreamingLinks={getStreamingLinks}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* Other schedules (if any) */}
          {schedules.filter(s => {
            const airingAt = s.airingAt
            const timeSinceStart = now - airingAt
            return timeSinceStart > 1800
          }).length > 0 && (
            <div className="space-y-3 pt-2">
              {schedules
                .filter(s => {
                  const airingAt = s.airingAt
                  const timeSinceStart = now - airingAt
                  return timeSinceStart > 1800
                })
                .map((schedule) => {
                  const media = schedule.media
                  if (!media) return null

                  return (
                    <ScheduleCard
                      key={schedule.id}
                      schedule={schedule}
                      media={media}
                      formatTime={formatTime}
                      getStreamingLinks={getStreamingLinks}
                    />
                  )
                })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

