"use client"

import { useEffect, useState } from "react"
import { format, addDays, startOfWeek } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Calendar } from "lucide-react"
import CountdownBanner from "./countdown-banner"
import Image from "next/image"
import type { AiringSchedule, AnimeMedia } from "@/lib/anilist/utils/types"
import NSFWToggle from "./nsfw-toggle"
import { ScheduleQueries } from "@/lib/anilist/queries/schedule"

interface ScheduleItem extends AnimeMedia {
  airingAt: number
  episode: number
  airingTime: string
}

interface PremiereItem {
  id: number
  title: {
    romaji: string
    english: string | null
    native: string
  }
  coverImage: {
    large: string | null
    medium: string | null
  }
  bannerImage: string | null
  premiereDate: Date
  episodes: number | string | null
  duration: number | string | null
}

// Map of weekday indices to names
const WEEKDAY_MAP = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
}

export default function ScheduleContent() {
  const [weeklySchedule, setWeeklySchedule] = useState<Record<string, ScheduleItem[]>>({})
  const [upcomingPremieres, setUpcomingPremieres] = useState<PremiereItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showNSFW, setShowNSFW] = useState(false)
  const [activeDay, setActiveDay] = useState(format(new Date(), "EEEE").toLowerCase())

  // Generate the days of the week starting from current week
  const today = new Date()
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }) // Start from Monday

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(startOfCurrentWeek, i)
    return {
      date: day,
      name: format(day, "EEEE"),
      shortName: format(day, "EEE"),
      value: format(day, "EEEE").toLowerCase(),
      isToday: format(today, "yyyy-MM-dd") === format(day, "yyyy-MM-dd"),
    }
  })

  useEffect(() => {
    async function fetchScheduleData() {
      setIsLoading(true)
      try {
        // Initialize empty schedule for all days
        const initialSchedule: Record<string, ScheduleItem[]> = {}
        Object.values(WEEKDAY_MAP).forEach((day) => {
          initialSchedule[day] = []
        })

        // Fetch airing schedule for the current week
        const response = await ScheduleQueries.getAiringSchedule({
          perPage: 50,
        })

        const airingSchedules = response.data.Page.airingSchedules
        console.log(`Total airing schedules fetched: ${airingSchedules.length}`)

        // Process each airing schedule
        airingSchedules.forEach((schedule: AiringSchedule) => {
          // Skip adult content if filter is enabled
          if (!showNSFW && schedule.media.isAdult) {
            return
          }

          // Convert timestamp to Date object
          const airingDate = new Date(schedule.airingAt * 1000)

          // Get day of week (0-6, where 0 is Sunday)
          const dayIndex = airingDate.getDay()

          // Get the weekday name from our map
          const weekday = WEEKDAY_MAP[dayIndex as keyof typeof WEEKDAY_MAP]

          console.log(
            `Show "${schedule.media.title.english || schedule.media.title.romaji}" airs on ${format(airingDate, "EEEE")} (${weekday})`,
          )

          // Add to the appropriate day's schedule
          if (initialSchedule[weekday]) {
            initialSchedule[weekday].push({
              ...schedule.media,
              airingAt: schedule.airingAt,
              episode: schedule.episode,
              airingTime: format(airingDate, "h:mm a"),
            })
          }
        })

        // Log distribution of shows
        Object.entries(initialSchedule).forEach(([day, shows]) => {
          console.log(`${day}: ${shows.length} shows`)
        })

        setWeeklySchedule(initialSchedule)

        // Fetch upcoming premieres (first episodes airing soon)
        const premieresResponse = await ScheduleQueries.getUpcomingPremieres({
          perPage: 10,
        })

        const premieres = premieresResponse.data.Page.airingSchedules
          .filter((schedule: AiringSchedule) => schedule.episode === 1)
          .filter((schedule: AiringSchedule) => showNSFW || !schedule.media.isAdult)
          .map((schedule: AiringSchedule) => ({
            id: schedule.media.id,
            title: schedule.media.title,
            coverImage: schedule.media.coverImage,
            bannerImage: schedule.media.bannerImage,
            premiereDate: new Date(schedule.airingAt * 1000),
            episodes: schedule.media.episodes || "?",
            duration: schedule.media.duration || "?",
          }))
          .slice(0, 3) // Limit to 3 premieres

        setUpcomingPremieres(premieres)
      } catch (error) {
        console.error("Failed to fetch schedule data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchScheduleData()
  }, [showNSFW]) // Re-fetch when NSFW filter changes

  // If we have no data for any day, show a message
  const hasNoData = Object.values(weeklySchedule).every((day) => day.length === 0)

  return (
    <div className="space-y-8">
      {/* Premiere Countdown Banner */}
      {upcomingPremieres.length > 0 && <CountdownBanner premieres={upcomingPremieres} />}

      {/* NSFW Toggle */}
      <NSFWToggle onChange={setShowNSFW} />

      {/* Weekly Schedule Tabs */}
      <Tabs defaultValue={activeDay} onValueChange={setActiveDay} className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          {weekDays.map((day) => (
            <TabsTrigger key={day.value} value={day.value} className={`hover:cursor-pointer hover:bg-foreground transition-all relative ${day.isToday ? "font-bold" : ""}`}>
              <span className="hidden md:inline">{day.name}</span>
              <span className="md:hidden">{day.shortName}</span>
              {day.isToday && (
                <span className="md:ml-1 text-xs max-lg:absolute max-lg:-top-7 bg-primary text-primary-foreground rounded-full px-1.5">Today</span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {hasNoData && !isLoading ? (
          <div className="mt-8 text-center py-12 text-muted-foreground">
            <p>No anime schedule data available for this week.</p>
            <p className="mt-2">This could be due to a seasonal break or API limitations.</p>
          </div>
        ) : (
          weekDays.map((day) => (
            <TabsContent key={day.value} value={day.value} className="mt-6">
              <h2 className="text-xl font-semibold mb-4">
                {day.name} <span className="text-muted-foreground font-normal">({format(day.date, "MMM d")})</span>
              </h2>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4 h-32"></CardContent>
                    </Card>
                  ))}
                </div>
              ) : weeklySchedule[day.value]?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {weeklySchedule[day.value]?.map((anime: ScheduleItem) => (
                    <Card key={anime.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex">
                          <div className="w-24 h-32 shrink-0">
                            <Image
                              src={
                                anime.coverImage.medium || "/placeholder.svg?height=128&width=96" || "/placeholder.svg"
                              }
                              alt={anime.title.english || anime.title.romaji}
                              className="w-full h-full object-cover"
                              width={96}
                              height={128}
                            />
                          </div>
                          <div className="p-3 flex flex-col justify-between flex-1">
                            <div>
                              <h3 className="font-medium line-clamp-2">{anime.title.english || anime.title.romaji}</h3>
                              {anime.isAdult && (
                                <span className="inline-block bg-red-500 text-white text-xs px-1.5 py-0.5 rounded mt-1 mr-1">
                                  NSFW
                                </span>
                              )}
                              <div className="flex items-center text-sm text-muted-foreground mt-1">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                <span>{anime.airingTime}</span>
                              </div>
                            </div>
                            <div className="flex items-center text-sm mt-2">
                              <div className="flex items-center mr-3">
                                <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                                <span>{anime.duration} min</span>
                              </div>
                              <div className="flex items-center">
                                <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                                <span>Ep {anime.episode}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">No anime scheduled for this day</div>
              )}
            </TabsContent>
          ))
        )}
      </Tabs>
    </div>
  )
}

