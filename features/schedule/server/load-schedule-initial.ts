import 'server-only'

import { getCachedScheduleWeekBundle } from '@/lib/graphql/data'
import { mergeScheduleAiringLists } from '@/features/schedule/lib/merge-schedule-airing'
import type { AiringSchedule } from '@/lib/graphql/types/graphql'

export async function loadScheduleInitialAiring(): Promise<AiringSchedule[]> {
  const { finished, upcomingToday, week } = await getCachedScheduleWeekBundle()
  const rows = (lists: typeof finished) =>
    (lists ?? []).filter((x): x is NonNullable<typeof x> => x != null) as AiringSchedule[]

  return mergeScheduleAiringLists(rows(finished), rows(upcomingToday), rows(week))
}
