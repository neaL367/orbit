import type { AiringSchedule } from '@/lib/graphql/types/graphql'

/**
 * Merges overlapping schedule query results.
 * Dedupes by AiringSchedule `id` so the same row from multiple queries collapses once,
 * while different episodes for the same series (different ids / airing times) are kept.
 */
export function mergeScheduleAiringLists(
  finishedToday: AiringSchedule[],
  upcomingToday: AiringSchedule[],
  weekUpcoming: AiringSchedule[]
): AiringSchedule[] {
  const allItems = [...finishedToday, ...upcomingToday, ...weekUpcoming]
  const byScheduleId = new Map<number, AiringSchedule>()

  for (const item of allItems) {
    if (!item?.media || item.media.isAdult) continue
    if (!byScheduleId.has(item.id)) {
      byScheduleId.set(item.id, item)
    }
  }

  return Array.from(byScheduleId.values())
}
