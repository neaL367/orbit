"use client"

import Link from "next/link"
import { memo } from "react"
import { IndexImage } from "@/components/shared/index-image"
import { cn } from "@/lib/utils"
import type { ScheduleAgendaEntry } from "./types"

type ScheduleAgendaRowProps = {
  entry: ScheduleAgendaEntry
  priority?: boolean
}

export function ScheduleStatusBadge({ entry }: { entry: ScheduleAgendaEntry }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em]",
        entry.isAiringNow
          ? "border-primary/40 bg-primary/10 text-primary shadow-[0_0_15px_rgba(var(--primary),0.2)] ring-1 ring-primary/20"
          : entry.isFinished
            ? "border-white/10 bg-white/5 text-muted-foreground/80"
            : "border-white/10 bg-white/5 text-foreground"
      )}
    >
      <div
        className={cn(
          "h-1.5 w-1.5 rotate-45 transition-colors",
          entry.isAiringNow ? "bg-primary animate-pulse" : entry.isFinished ? "bg-white/20" : "bg-primary/50"
        )}
      />
      {entry.statusLabel}
    </div>
  )
}

export function ScheduleMiniThumb({
  entry,
  priority = false,
}: {
  entry: ScheduleAgendaEntry
  priority?: boolean
}) {
  const coverImage =
    entry.media.coverImage?.large ||
    entry.media.coverImage?.medium ||
    entry.media.coverImage?.extraLarge ||
    null
  if (!coverImage) {
    return (
      <div
        className="relative flex h-[3.25rem] w-[2.35rem] shrink-0 items-center justify-center rounded-sm border border-white/10 bg-black/40 sm:h-16 sm:w-[2.85rem]"
        aria-hidden
      >
        <span className="px-0.5 text-center font-mono text-[8px] uppercase leading-tight tracking-wider text-muted-foreground/40">
          N/C
        </span>
      </div>
    )
  }

  return (
    <div className="relative h-[3.25rem] w-[2.35rem] shrink-0 overflow-hidden rounded-sm border border-white/15 bg-black shadow-lg ring-1 ring-white/5 group-hover:ring-primary/30 transition-all duration-300 sm:h-16 sm:w-[2.85rem]">
      <IndexImage
        src={coverImage}
        alt={entry.title}
        fill
        sizes="(max-width: 640px) 48px, 56px"
        priority={priority}
        showTechnicalDetails={false}
        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100"
      />
      {entry.isAiringNow ? (
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-primary/40 motion-safe:animate-pulse motion-reduce:animate-none" />
      ) : null}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black via-black/50 to-transparent" />
    </div>
  )
}

function ScheduleAgendaRowComponent({ entry, priority = false }: ScheduleAgendaRowProps) {
  const links = entry.streamingLinks
  const visibleLinks = links.slice(0, 4)
  const overflowLinkCount = links.length - visibleLinks.length

  return (
    <div
      className={cn(
        "group relative flex items-start justify-between gap-3 border bg-black/40 px-3 py-3 transition-all duration-300 sm:items-center",
        "hover:border-primary/40 hover:bg-white/5 hover:shadow-[0_0_20px_rgba(var(--primary),0.05)] index-cut-tr",
        entry.isAiringNow ? "border-primary/30 bg-primary/5" : "border-white/10"
      )}
    >
      <Link
        href={`/anime/${entry.media.id}`}
        aria-label={`View ${entry.title}`}
        className="absolute inset-0 z-0 rounded-[inherit] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      />

      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-1 bg-primary/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative z-10 flex min-w-0 flex-1 items-start gap-3 pointer-events-none sm:items-center">
        <ScheduleMiniThumb entry={entry} priority={priority} />

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary/80">
              {entry.formatLabel}
            </span>
            <span className="border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">
              Ep {entry.episodeLabel}
            </span>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
              ~{entry.durationMinutes} min
            </span>
          </div>

          <h3 className="line-clamp-2 font-sans text-sm font-bold leading-snug tracking-tight text-foreground/90 transition-colors duration-300 group-hover:text-primary sm:line-clamp-1 sm:text-[15px]">
            {entry.title}
          </h3>

          {links.length > 0 ? (
            <div className="relative z-20 flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
              {visibleLinks.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pointer-events-auto font-mono text-[9px] font-bold uppercase tracking-widest text-primary/70 underline decoration-primary/20 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  style={link.color ? { color: link.color } : undefined}
                >
                  {link.site}
                </a>
              ))}
              {overflowLinkCount > 0 ? (
                <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">
                  +{overflowLinkCount}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="relative z-10 flex shrink-0 flex-col items-end gap-1.5 self-start pointer-events-none sm:self-auto">
        <ScheduleStatusBadge entry={entry} />
        <span className="max-w-36 text-right font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 sm:max-w-none group-hover:text-muted-foreground/80 transition-colors">
          {entry.timeUntilSec === null
            ? 'Awaiting Synchronization'
            : entry.countdownLabel
              ? `Starts in ${entry.countdownLabel}`
              : entry.isAiringNow
                ? 'Live feed active'
                : entry.isFinished
                  ? 'Broadcast ended'
                  : 'Queued'}
        </span>
      </div>
    </div>
  )
}

export const ScheduleAgendaRow = memo(ScheduleAgendaRowComponent, (prev, next) => {
  return prev.entry.schedule.id === next.entry.schedule.id && prev.entry.airingAt === next.entry.airingAt && prev.entry.timeUntilSec === next.entry.timeUntilSec
})
