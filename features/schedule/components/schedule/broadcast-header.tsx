"use client"

import { cn } from "@/lib/utils"
import type { ScheduleDayModel } from "./types"

type ScheduleBroadcastHeaderProps = {
  days: ScheduleDayModel[]
  activeDay?: ScheduleDayModel
}

export function ScheduleBroadcastHeader({ days, activeDay }: ScheduleBroadcastHeaderProps) {
  const allEntries = days.flatMap((day) => day.entries)
  const liveCount = allEntries.filter((entry) => entry.isAiringNow).length
  const soonCount = allEntries.filter(
    (entry) =>
      !entry.isAiringNow &&
      !entry.isFinished &&
      entry.timeUntilSec != null &&
      entry.timeUntilSec > 0 &&
      entry.timeUntilSec <= 3 * 60 * 60
  ).length
  const nextUpcoming = allEntries.find(
    (entry) => !entry.isAiringNow && !entry.isFinished && entry.timeUntilSec != null && entry.timeUntilSec > 0
  )

  if (!activeDay) return null

  return (
    <header className="reveal relative overflow-hidden border border-white/8 bg-white/2 index-cut-tr">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-primary/45 via-primary/10 to-transparent" />

      <div className="flex flex-col gap-3 px-3 py-3 md:flex-row md:items-center md:justify-between md:gap-6 md:px-4 md:py-3.5">
        <div className="min-w-0 flex items-start gap-3">
          <div className="mt-0.5 hidden h-8 w-px bg-white/10 sm:block" aria-hidden />
          <div className="min-w-0">
            <p className="font-mono text-[8px] font-semibold uppercase tracking-[0.32em] text-muted-foreground/55">
              Registry // Transmission
            </p>
            <h1 className="mt-1 font-sans text-base font-semibold tracking-tight text-foreground md:text-lg">
              Weekly schedule
            </h1>
            <p className="mt-0.5 truncate font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground/65">
              {activeDay.dateString} · {activeDay.totalCount} entries
            </p>
          </div>
        </div>

        <dl className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4 md:w-auto md:max-w-208 md:gap-0 md:divide-x md:divide-white/8">
          <Stat label="Live" value={liveCount} active={liveCount > 0} />
          <Stat label="Soon" value={soonCount} active={soonCount > 0} subtitle="≤3h" />
          <Stat
            label="Next"
            value={nextUpcoming?.timeLabel ?? "—"}
            active={Boolean(nextUpcoming)}
            wide
            subtitle={nextUpcoming?.title}
          />
          <Stat label="Day" value={activeDay.totalCount.toString().padStart(2, "0")} subtitle="selected" />
        </dl>
      </div>
    </header>
  )
}

function Stat({
  label,
  value,
  subtitle,
  active,
  wide,
}: {
  label: string
  value: string | number
  subtitle?: string
  active?: boolean
  wide?: boolean
}) {
  return (
    <div
      className={cn(
        "border border-white/8 bg-background/30 px-2.5 py-2 md:border-0 md:bg-transparent md:px-4 md:py-0",
        wide && "sm:col-span-2 md:col-span-1"
      )}
    >
      <dt className="font-mono text-[7px] font-semibold uppercase tracking-[0.28em] text-muted-foreground/55">
        {label}
      </dt>
      <dd className="mt-1">
        <span
          className={cn(
            "font-mono text-sm font-bold tabular-nums tracking-tight text-foreground md:text-base",
            active && "text-primary"
          )}
        >
          {value}
        </span>
        {subtitle ? (
          <p className="mt-0.5 line-clamp-1 font-mono text-[8px] uppercase tracking-[0.14em] text-muted-foreground/60">
            {subtitle}
          </p>
        ) : null}
      </dd>
    </div>
  )
}
