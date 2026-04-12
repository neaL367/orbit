import { loadScheduleInitialAiring } from '@/features/schedule/server/load-schedule-initial'
import { ScheduleView } from './view'

export async function Schedule() {
  const schedules = await loadScheduleInitialAiring()

  if (schedules.length === 0) {
    return (
      <div className="border border-border bg-secondary/5 p-10 text-center md:p-14">
        <p className="font-sans text-sm font-medium text-foreground">No upcoming broadcasts in this window</p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Check back later or browse the registry
        </p>
      </div>
    )
  }

  return (
    <div className="reveal">
      <ScheduleView data={schedules} />
    </div>
  )
}
