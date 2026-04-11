import { getScheduleAnime } from "@/lib/graphql/data"
import { NextAiringClient } from "./next-airing-client"
import type { ScheduleAnimeHeroQuery } from "@/lib/graphql/types/graphql"

interface NextAiringProps {
  className?: string
}

export async function NextAiring({ className }: NextAiringProps) {
  const response = await getScheduleAnime(1, 5)

  const schedules = response?.data?.Page?.airingSchedules
  if (!schedules?.length) {
    return null
  }

  return <NextAiringClient className={className} data={response.data as ScheduleAnimeHeroQuery} />
}
