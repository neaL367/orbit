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
  
  // Since we rely on a timestamp that might be syncing
  const nextUpcoming = allEntries.find(
    (entry) => !entry.isAiringNow && !entry.isFinished && entry.timeUntilSec != null && entry.timeUntilSec > 0
  )

  if (!activeDay) return null

  return (
    <header className="reveal relative flex flex-col xl:flex-row xl:items-stretch gap-4 md:gap-6 w-full">
      <div className="relative flex-1 overflow-hidden border border-white/10 bg-secondary/10 p-5 md:p-6 lg:p-8 index-cut-tr shadow-lg group">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-primary/50 via-primary/20 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute right-0 top-0 p-3 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L22 12L12 22L2 12L12 2Z" stroke="currentColor" strokeWidth="1" />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
          </svg>
        </div>
        
        <div className="flex items-start gap-4 h-full flex-col justify-center">
          <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 px-2.5 py-1 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-[9px] font-black uppercase tracking-[0.35em] text-primary/80">
              Registry // Transmission
            </span>
          </div>
          
          <div className="min-w-0 space-y-1">
            <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground md:text-3xl drop-shadow-sm">
              Weekly Schedule
            </h1>
            <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-widest">
              <span className="font-bold text-muted-foreground">{activeDay.dateString}</span>
              <span className="text-white/20">/</span>
              <span className="font-black text-primary/90">{activeDay.totalCount} Entries</span>
            </div>
          </div>
        </div>
      </div>

      <div className="shrink-0 flex gap-px bg-white/10 border border-white/10 p-px overflow-x-auto custom-scrollbar xl:w-[500px]">
        <dl className="grid w-full grid-cols-2 sm:grid-cols-4 gap-px bg-white/10">
          <Stat 
            label="Live" 
            value={liveCount} 
            active={liveCount > 0} 
            icon={
              <div className="flex gap-0.5">
                <div className="w-1 h-3 bg-red-500 animate-[shimmer_1s_infinite]" />
                <div className="w-1 h-3 bg-red-500/40" />
              </div>
            }
          />
          <Stat 
            label="Soon" 
            value={soonCount} 
            active={soonCount > 0} 
            subtitle="≤3H Window" 
          />
          <Stat
            label="Next"
            value={nextUpcoming?.timeLabel ?? "—"}
            active={Boolean(nextUpcoming)}
            wide
            subtitle={nextUpcoming?.title}
            glow
          />
          <Stat 
            label="Day" 
            value={activeDay.totalCount.toString().padStart(2, "0")} 
            subtitle="Selected" 
          />
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
  glow,
  icon,
}: {
  label: string
  value: string | number
  subtitle?: string
  active?: boolean
  wide?: boolean
  glow?: boolean
  icon?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col justify-between bg-background/90 p-4 md:p-5 transition-colors group/stat hover:bg-secondary/40 min-w-0",
        wide ? "col-span-2" : "col-span-1",
        active && "bg-background",
        glow && active && "shadow-[inset_0_0_20px_rgba(var(--primary),0.05)]"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <dt className="font-mono text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 group-hover/stat:text-primary/70 transition-colors">
          {label}
        </dt>
        {icon && <div>{icon}</div>}
      </div>
      
      <dd className="min-w-0">
        <span
          className={cn(
            "block font-mono text-xl font-black tabular-nums tracking-tighter text-foreground truncate",
            active && "text-primary drop-shadow-[0_0_12px_rgba(var(--primary),0.6)]"
          )}
        >
          {value}
        </span>
        {subtitle ? (
          <p className="mt-1.5 truncate font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 group-hover/stat:text-muted-foreground/80 transition-colors">
            {subtitle}
          </p>
        ) : (
          <div className="mt-1.5 h-[13.5px]" aria-hidden />
        )}
      </dd>
      
      {active && glow && (
        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-primary/40 shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
      )}
    </div>
  )
}
