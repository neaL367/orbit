"use client"

import { cn } from "@/lib/utils"
import { ScheduleAgendaRow } from "../schedule/card"
import type { ScheduleAgendaEntry, ScheduleDayModel } from "../schedule/types"

type DaySectionProps = {
  day: ScheduleDayModel
}

export function DaySection({ day }: DaySectionProps) {
  return (
    <section className="reveal pt-3 md:pt-4">
      <div className="border border-white/8 bg-white/2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/8 px-3 py-2 md:px-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[8px] font-bold uppercase tracking-[0.26em] text-muted-foreground/65">
              Agenda
            </span>
            <span className="h-3 w-px bg-white/10" aria-hidden />
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-foreground/90">{day.name}</span>
            <span className="font-mono text-[9px] tabular-nums text-muted-foreground/60">{day.compactDate}</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground/70 tabular-nums">
            <span>{day.totalCount} entries</span>
            {day.liveCount > 0 ? (
              <span className="text-primary">
                {day.liveCount} live
              </span>
            ) : null}
          </div>
        </div>

        <SchedulePulseStrip day={day} />

        {day.totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 md:py-16">
            <p className="font-sans text-sm font-medium text-muted-foreground">No episodes this day</p>
            <p className="mt-2 max-w-sm text-center font-mono text-[9px] uppercase tracking-widest text-muted-foreground/55">
              Pick another day from the rail above.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/8">
            {day.agendaHours.map((hourGroup, hourIndex) => (
              <div key={hourGroup.hourKey} className="px-3 py-3 md:px-4 md:py-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-foreground">
                    {hourGroup.hourLabel}
                  </span>
                  <div className="h-px flex-1 bg-linear-to-r from-white/15 via-white/5 to-transparent" />
                  <span className="shrink-0 font-mono text-[8px] uppercase tracking-[0.2em] text-muted-foreground/55">
                    {hourGroup.entryCount}
                  </span>
                </div>

                <div className="space-y-2">
                  {hourGroup.slots.map((slot, slotIndex) => (
                    <div key={slot.slotKey}>
                      <div className="mb-1.5 flex items-baseline gap-2 md:hidden">
                        <span className="font-mono text-[11px] font-bold tabular-nums text-foreground">
                          {slot.slotLabel}
                        </span>
                        {slot.entries.length > 1 ? (
                          <span className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground/55">
                            ×{slot.entries.length}
                          </span>
                        ) : null}
                      </div>

                      <div className="grid gap-2 md:grid-cols-[5.5rem_minmax(0,1fr)] md:gap-3">
                        <div className="hidden md:block">
                          <div className="sticky top-[calc(var(--nav-visible,1)*80px+88px)] py-0.5">
                            <p className="font-mono text-xs font-bold tabular-nums leading-none text-foreground">
                              {slot.slotLabel}
                            </p>
                            {slot.entries.length > 1 ? (
                              <p className="mt-1 font-mono text-[7px] uppercase tracking-[0.2em] text-muted-foreground/55">
                                {slot.entries.length} simul
                              </p>
                            ) : null}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          {slot.entries.map((entry, entryIndex) => (
                            <ScheduleAgendaRow
                              key={entry.schedule.id}
                              entry={entry}
                              priority={hourIndex === 0 && slotIndex === 0 && entryIndex < 2}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function SchedulePulseStrip({ day }: { day: ScheduleDayModel }) {
  const segments: Array<{
    key: string
    label: string
    count: number
    entries: ScheduleAgendaEntry[]
    accent: boolean
  }> = [
    { key: "live", label: "On air", count: day.summary.live.length, entries: day.summary.live, accent: true },
    { key: "soon", label: "Soon", count: day.summary.soon.length, entries: day.summary.soon, accent: false },
    { key: "later", label: "Later", count: day.summary.later.length, entries: day.summary.later, accent: false },
  ]

  return (
    <div className="grid grid-cols-1 border-b border-white/8 md:grid-cols-3">
      {segments.map((seg) => (
        <div
          key={seg.key}
          className={cn(
            "border-b border-white/8 px-3 py-2.5 last:border-b-0 md:border-b-0 md:border-r md:border-white/8 md:px-4 md:py-3 last:md:border-r-0",
            seg.accent && seg.count > 0 ? "bg-primary/5" : "bg-transparent"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[8px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/65">
              {seg.label}
            </span>
            <span className="font-mono text-[10px] font-bold tabular-nums text-foreground">
              {seg.count.toString().padStart(2, "0")}
            </span>
          </div>
          {seg.count === 0 ? (
            <p className="mt-2 font-mono text-[8px] uppercase tracking-[0.16em] text-muted-foreground/45">
              None in this bucket.
            </p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {seg.entries.slice(0, 3).map((entry) => (
                <li key={entry.schedule.id} className="flex items-start justify-between gap-2">
                  <span className="min-w-0 truncate font-sans text-[11px] font-medium text-foreground">
                    {entry.title}
                  </span>
                  <span className="shrink-0 font-mono text-[9px] tabular-nums text-muted-foreground/70">
                    {entry.timeLabel}
                  </span>
                </li>
              ))}
              {seg.count > 3 ? (
                <li className="font-mono text-[8px] uppercase tracking-[0.16em] text-muted-foreground/50">
                  +{seg.count - 3} in full list below
                </li>
              ) : null}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}
