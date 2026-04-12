/**
 * Unix day boundaries for the schedule UI (local calendar week from today).
 * Shared by server loaders and (previously) client hooks.
 */
export function getScheduleDayRanges(): Array<{
  dayIndex: number
  start: number
  end: number
}> {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const ranges: Array<{ dayIndex: number; start: number; end: number }> = []

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(today)
    dayDate.setDate(today.getDate() + i)

    const start = new Date(dayDate)
    start.setHours(0, 0, 0, 0)

    const end = new Date(dayDate)
    end.setHours(23, 59, 59, 999)

    ranges.push({
      dayIndex: dayDate.getDay(),
      start: Math.floor(start.getTime() / 1000),
      end: Math.floor(end.getTime() / 1000),
    })
  }

  return ranges
}
