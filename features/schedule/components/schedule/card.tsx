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
        "inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[8px] font-semibold uppercase tracking-[0.18em]",
        entry.isAiringNow
          ? "border-primary/30 bg-primary text-primary-foreground shadow-[0_0_24px_rgba(255,255,255,0.12)]"
          : entry.isFinished
            ? "border-white/10 bg-white/3 text-muted-foreground"
            : "border-white/10 bg-white/2 text-foreground"
      )}
    >
      <div
        className={cn(
          "h-1.5 w-1.5 rotate-45",
          entry.isAiringNow ? "bg-primary-foreground" : entry.isFinished ? "bg-white/20" : "bg-primary/70"
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
        className="relative flex h-13 w-[2.35rem] shrink-0 items-center justify-center rounded-sm border border-white/12 bg-secondary/40 sm:h-16 sm:w-[2.85rem]"
        aria-hidden
      >
        <span className="px-0.5 text-center font-mono text-[6px] uppercase leading-tight tracking-wider text-muted-foreground/45">
          N/C
        </span>
      </div>
    )
  }

  return (
    <div className="relative h-13 w-[2.35rem] shrink-0 overflow-hidden rounded-sm border border-white/18 bg-secondary shadow-[0_6px_20px_rgba(0,0,0,0.45)] ring-1 ring-white/10 sm:h-16 sm:w-[2.85rem]">
      <IndexImage
        src={coverImage}
        alt={entry.title}
        fill
        sizes="(max-width: 640px) 48px, 56px"
        priority={priority}
        showTechnicalDetails={false}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
      />
      {entry.isAiringNow ? (
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-primary/35 motion-safe:animate-pulse motion-reduce:animate-none" />
      ) : null}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/55 to-transparent" />
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
        "group relative flex items-start justify-between gap-2.5 border border-white/6 bg-white/2 px-2.5 py-2.5 transition-all duration-300 sm:items-center sm:gap-3",
        "hover:border-white/12 hover:bg-white/4",
        entry.isAiringNow && "border-primary/25 bg-primary/5"
      )}
    >
      <Link
        href={`/anime/${entry.media.id}`}
        aria-label={`View ${entry.title}`}
        className="absolute inset-0 z-0 rounded-[inherit] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      />

      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-px bg-linear-to-b from-primary/70 via-primary/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative z-10 flex min-w-0 flex-1 items-start gap-2.5 pointer-events-none sm:items-center">
        <ScheduleMiniThumb entry={entry} priority={priority} />

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[8px] font-semibold uppercase tracking-[0.22em] text-primary/65">
              {entry.formatLabel}
            </span>
            <span className="border border-white/10 bg-white/4 px-2 py-0.5 font-mono text-[8px] font-semibold uppercase tracking-[0.2em] text-foreground">
              Ep {entry.episodeLabel}
            </span>
            <span className="font-mono text-[8px] uppercase tracking-[0.22em] text-muted-foreground/60">
              ~{entry.durationMinutes} min
            </span>
          </div>

          <h3 className="line-clamp-2 font-sans text-[13px] font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary sm:line-clamp-1 sm:text-sm">
            {entry.title}
          </h3>

          {links.length > 0 ? (
            <div className="relative z-20 flex flex-wrap items-center gap-x-2 gap-y-1 pt-0.5">
              {visibleLinks.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pointer-events-auto font-mono text-[8px] font-semibold uppercase tracking-[0.14em] text-primary/75 underline decoration-primary/25 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary/55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  style={link.color ? { color: link.color } : undefined}
                >
                  {link.site}
                </a>
              ))}
              {overflowLinkCount > 0 ? (
                <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted-foreground/50">
                  +{overflowLinkCount}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="relative z-10 flex shrink-0 flex-col items-end gap-1.5 self-start pointer-events-none sm:self-auto">
        <ScheduleStatusBadge entry={entry} />
        <span className="max-w-36 text-right font-mono text-[8px] uppercase tracking-[0.2em] text-muted-foreground/60 sm:max-w-none">
          {entry.countdownLabel
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
  return prev.entry.schedule.id === next.entry.schedule.id && prev.entry.airingAt === next.entry.airingAt
})
