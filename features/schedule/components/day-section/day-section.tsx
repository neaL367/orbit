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
      <div className="border border-white/15 bg-black/40 shadow-lg backdrop-blur-sm index-cut-tr">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 px-4 py-3.5 md:px-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/80">
              Agenda
            </span>
            <span className="h-4 w-px bg-white/20" aria-hidden />
            <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-foreground">{day.name}</span>
            <span className="font-mono text-[11px] font-semibold tabular-nums text-muted-foreground/80">{day.compactDate}</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 tabular-nums">
            <span>{day.totalCount} entries</span>
            {day.liveCount > 0 ? (
              <span className="text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)] flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-primary animate-pulse rotate-45" />
                {day.liveCount} live
              </span>
            ) : null}
          </div>
        </div>

        <SchedulePulseStrip day={day} />

        {day.totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 md:py-20">
            <p className="font-sans text-base font-bold text-muted-foreground/90">No broadcasts found</p>
            <p className="mt-2 max-w-sm text-center font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Select another cycle from the registry above.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {day.agendaHours.map((hourGroup, hourIndex) => (
              <div key={hourGroup.hourKey} className="px-4 py-4 md:px-5 md:py-5 hover:bg-white/5 transition-colors duration-300">
                <div className="mb-3 flex items-center gap-3">
                  <span className="shrink-0 font-mono text-xs font-bold uppercase tracking-[0.2em] text-foreground drop-shadow-sm">
                    {hourGroup.hourLabel}
                  </span>
                  <div className="h-px flex-1 bg-linear-to-r from-white/20 via-white/5 to-transparent" />
                  <span className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60 bg-white/5 px-2 py-0.5 border border-white/10">
                    {hourGroup.entryCount} items
                  </span>
                </div>

                <div className="space-y-3">
                  {hourGroup.slots.map((slot, slotIndex) => (
                    <div key={slot.slotKey}>
                      <div className="mb-2 flex items-baseline gap-2 md:hidden">
                        <span className="font-mono text-xs font-bold tabular-nums text-foreground">
                          {slot.slotLabel}
                        </span>
                        {slot.entries.length > 1 ? (
                          <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-primary/80">
                            ×{slot.entries.length} concurrent
                          </span>
                        ) : null}
                      </div>

                      <div className="grid gap-2 md:grid-cols-[6rem_minmax(0,1fr)] md:gap-4">
                        <div className="hidden md:block">
                          <div className="sticky top-[calc(var(--nav-visible,1)*80px+88px)] py-1 border-l-2 border-primary/30 pl-3">
                            <p className="font-mono text-[13px] font-black tabular-nums leading-none text-foreground">
                              {slot.slotLabel}
                            </p>
                            {slot.entries.length > 1 ? (
                              <p className="mt-1.5 font-mono text-[9px] font-bold uppercase tracking-widest text-primary/80">
                                {slot.entries.length} concurrent
                              </p>
                            ) : null}
                          </div>
                        </div>

                        <div className="space-y-2">
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
    <div className="grid grid-cols-1 border-b border-white/15 md:grid-cols-3">
      {segments.map((seg) => (
        <div
          key={seg.key}
          className={cn(
            "relative border-b border-white/10 px-4 py-3 last:border-b-0 md:border-b-0 md:border-r md:border-white/10 md:px-5 md:py-4 last:md:border-r-0 overflow-hidden",
            seg.accent && seg.count > 0 ? "bg-primary/10 border-b-primary/30 shadow-[inset_0_0_20px_rgba(var(--primary),0.1)]" : "bg-transparent"
          )}
        >
          {seg.accent && seg.count > 0 && (
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-primary/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none" />
          )}
          <div className="relative flex items-center justify-between gap-2 z-10">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/80">
              {seg.label}
            </span>
            <span className={cn("font-mono text-xs font-black tabular-nums", seg.accent && seg.count > 0 ? "text-primary drop-shadow-[0_0_5px_rgba(var(--primary),0.5)]" : "text-foreground")}>
              {seg.count.toString().padStart(2, "0")}
            </span>
          </div>
          {seg.count === 0 ? (
            <p className="relative mt-3 font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/50 z-10">
              None in this bucket.
            </p>
          ) : (
            <ul className="relative mt-3 space-y-2 z-10">
              {seg.entries.slice(0, 3).map((entry) => (
                <li key={entry.schedule.id} className="flex items-start justify-between gap-3 group/item">
                  <span className="min-w-0 truncate font-sans text-xs font-bold text-foreground/90 group-hover/item:text-primary transition-colors">
                    {entry.title}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] font-bold tabular-nums text-muted-foreground/80 group-hover/item:text-primary/80 transition-colors">
                    {entry.timeLabel}
                  </span>
                </li>
              ))}
              {seg.count > 3 ? (
                <li className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 pt-1">
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
