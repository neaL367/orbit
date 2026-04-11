"use client"

import Link from "next/link"
import Image from "next/image"
import { useQueries } from "@tanstack/react-query"
import React, { useMemo, useState, useEffect, useRef } from "react"
import { Radio } from "lucide-react"

import { execute } from "@/lib/graphql/execute"
import { ScheduleAnimeQuery } from "@/lib/graphql/queries/schedule-anime"
import { getAnimeTitle } from "@/lib/utils/anime-utils"
import { useCurrentTime } from "@/hooks/use-current-time"
import { extractDominantColors } from "@/lib/utils/dominant-colors"
import { cn } from "@/lib/utils"
import type { ScheduleAnimeHeroQuery, Media } from "@/lib/graphql/types/graphql"

type ColorPalette = {
  topLeft: string
  topCenter: string
  topRight: string
  midLeft: string
  midCenter: string
  midRight: string
  bottomLeft: string
  bottomCenter: string
  bottomRight: string
}

const COUNTDOWN_LABELS = ["Days", "Hrs", "Min", "Sec"] as const

export function NextAiring({
  className,
  initialData,
}: {
  className?: string
  initialData?: { data?: ScheduleAnimeHeroQuery }
}) {
  const now = useCurrentTime()
  const [activeIndex, setActiveIndex] = useState(0)
  const [colors, setColors] = useState<ColorPalette[]>([])

  const [currentUnix] = useState(() => Math.floor(Date.now() / 1000))

  const { data, isLoading } = useQueries({
    queries: [
      {
        queryKey: ["NextAiringHero"],
        queryFn: () =>
          execute(ScheduleAnimeQuery, {
            page: 1,
            perPage: 5,
            notYetAired: true,
            airingAt_greater: currentUnix,
          }),
        initialData: initialData,
        staleTime: 5000,
        refetchOnWindowFocus: true,
      },
    ],
  })[0]

  const schedules = useMemo(() => data?.data?.Page?.airingSchedules || [], [data])
  const activeSchedule = schedules[activeIndex]

  const colorCache = useRef<Map<string, ColorPalette>>(new Map())

  useEffect(() => {
    if (schedules.length === 0) return

    const itemsToExtract = schedules.slice(0, Math.min(3, schedules.length))

    Promise.all(
      itemsToExtract.map(async (schedule) => {
        const imageUrl =
          schedule?.media?.bannerImage ||
          schedule?.media?.coverImage?.extraLarge ||
          schedule?.media?.coverImage?.large

        if (!imageUrl) {
          return {
            topLeft: "#2a2a35",
            topCenter: "#2a2a35",
            topRight: "#252530",
            midLeft: "#20202a",
            midCenter: "#2a2a35",
            midRight: "#1a1a25",
            bottomLeft: "#20202a",
            bottomCenter: "#1a1a25",
            bottomRight: "#1a1a25",
          }
        }

        if (colorCache.current.has(imageUrl)) {
          return colorCache.current.get(imageUrl)!
        }

        const extracted = await extractDominantColors(imageUrl)
        const typedColors = extracted as unknown as ColorPalette
        colorCache.current.set(imageUrl, typedColors)
        return typedColors
      })
    ).then((extractedColors) => {
      const allColors = [...extractedColors]
      while (allColors.length < schedules.length) {
        allColors.push({
          topLeft: "#2a2a35",
          topCenter: "#2a2a35",
          topRight: "#252530",
          midLeft: "#20202a",
          midCenter: "#2a2a35",
          midRight: "#1a1a25",
          bottomLeft: "#20202a",
          bottomCenter: "#1a1a25",
          bottomRight: "#1a1a25",
        })
      }
      setColors(allColors)
    })
  }, [schedules])

  useEffect(() => {
    if (schedules.length <= 1) return
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return
    }

    const duration = 8000
    const rotateTimeout = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % schedules.length)
    }, duration)

    return () => clearTimeout(rotateTimeout)
  }, [schedules.length, activeIndex])

  const title = useMemo(
    () => (activeSchedule?.media ? getAnimeTitle(activeSchedule.media as unknown as Media) : null),
    [activeSchedule]
  )
  const timeUntilSec = activeSchedule?.airingAt && now ? activeSchedule.airingAt - now : null

  const countdown = useMemo(() => {
    if (!timeUntilSec || timeUntilSec <= 0 || now === null) return null
    const days = Math.floor(timeUntilSec / (3600 * 24))
    const hours = Math.floor((timeUntilSec % (3600 * 24)) / 3600)
    const minutes = Math.floor((timeUntilSec % 3600) / 60)
    const seconds = timeUntilSec % 60
    const pad = (n: number) => n.toString().padStart(2, "0")
    return [pad(days), pad(hours), pad(minutes), pad(seconds)]
  }, [timeUntilSec, now])

  if (isLoading || !activeSchedule) {
    return (
      <div
        className={cn(
          "relative left-1/2 w-screen -translate-x-1/2 border-b border-border bg-secondary/5 shimmer",
          className || "h-[50vh] md:h-[60vh]"
        )}
      />
    )
  }

  const currentColors = colors[activeIndex] || {
    topLeft: "#1a1a1a",
    topCenter: "#1a1a1a",
    topRight: "#1a1a1a",
    midLeft: "#0a0a0a",
    midCenter: "#1a1a1a",
    midRight: "#0a0a0a",
    bottomLeft: "#0a0a0a",
    bottomCenter: "#0a0a0a",
    bottomRight: "#0a0a0a",
  }

  return (
    <section
      className={cn(
        "group relative left-1/2 z-0 flex w-screen -translate-x-1/2 flex-col overflow-hidden bg-background",
        className || "min-h-[520px] md:min-h-[62vh]"
      )}
      style={
        {
          "--current-top-left": currentColors.topLeft,
          "--current-top-center": currentColors.topCenter,
          "--current-top-right": currentColors.topRight,
          "--current-mid-left": currentColors.midLeft,
          "--current-mid-center": currentColors.midCenter,
          "--current-mid-right": currentColors.midRight,
          "--current-bottom-left": currentColors.bottomLeft,
          "--current-bottom-center": currentColors.bottomCenter,
          "--current-bottom-right": currentColors.bottomRight,
        } as React.CSSProperties
      }
    >
      <div className="pointer-events-none absolute inset-0 z-0 translate-z-0 overflow-hidden bg-black will-change-transform">
        <div className="absolute inset-[-32%] translate-z-0 blur-[72px] saturate-150 brightness-110 transition-opacity duration-1000 will-change-opacity sm:blur-[96px] motion-reduce:blur-none motion-reduce:saturate-100">
          <div className="grid h-full w-full grid-cols-3 grid-rows-3 opacity-75 motion-reduce:opacity-50">
            <div className="transition-colors duration-[2s] ease-in-out" style={{ backgroundColor: currentColors.topLeft }} />
            <div className="transition-colors duration-[2s] ease-in-out" style={{ backgroundColor: currentColors.topCenter }} />
            <div className="transition-colors duration-[2s] ease-in-out" style={{ backgroundColor: currentColors.topRight }} />
            <div className="transition-colors duration-[2s] ease-in-out" style={{ backgroundColor: currentColors.midLeft }} />
            <div
              className="z-10 scale-125 rounded-full blur-xl transition-colors duration-[2s] ease-in-out motion-reduce:scale-100 motion-reduce:blur-none"
              style={{ backgroundColor: currentColors.midCenter }}
            />
            <div className="transition-colors duration-[2s] ease-in-out" style={{ backgroundColor: currentColors.midRight }} />
            <div className="transition-colors duration-[2s] ease-in-out" style={{ backgroundColor: currentColors.bottomLeft }} />
            <div className="transition-colors duration-[2s] ease-in-out" style={{ backgroundColor: currentColors.bottomCenter }} />
            <div className="transition-colors duration-[2s] ease-in-out" style={{ backgroundColor: currentColors.bottomRight }} />
          </div>
        </div>
      </div>

      <div className="relative z-10 isolate flex min-h-0 flex-1 flex-col">
        <Link href={`/anime/${activeSchedule.media?.id}`} className="relative block min-h-[inherit] w-full flex-1">
          <div className="absolute inset-0 bg-secondary/25">
            {schedules.map((schedule, index) => {
              if (index !== activeIndex) return null
              const scheduleImage = schedule?.media?.bannerImage || schedule?.media?.coverImage?.extraLarge
              if (!scheduleImage) return null
              return (
                <div key={schedule?.id || index} className="absolute inset-0 opacity-100 transition-opacity duration-700 ease-out">
                  <Image
                    src={scheduleImage}
                    alt=""
                    fill
                    className="scale-105 object-cover opacity-35 blur-2xl saturate-125 md:opacity-25 md:blur-3xl motion-reduce:blur-none motion-reduce:saturate-100"
                    loading="eager"
                    priority
                  />
                </div>
              )
            })}
            <div className="absolute inset-0 bg-linear-to-t from-background via-background/55 to-transparent" />
            <div className="absolute inset-0 bg-linear-to-r from-background/90 via-background/45 to-transparent" />
          </div>

          <div className="absolute inset-0 flex justify-center">
            <div className="relative flex h-full w-full max-w-[1600px] items-center px-6 pb-24 pt-10 md:px-12 md:pb-20 md:pt-0 lg:px-24">
              <div className="relative z-10 w-full max-w-xl space-y-8 transition-all duration-500 md:max-w-[52%] lg:max-w-md xl:max-w-lg 2xl:max-w-xl">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2.5 text-primary">
                    <Radio className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-primary/90 md:text-[11px] md:tracking-[0.28em]">
                      Next on air
                    </span>
                  </div>
                  <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                    Upcoming episode — opens full series page.
                  </p>
                  <div className="h-px w-full max-w-xs bg-linear-to-r from-primary/35 via-white/10 to-transparent" />
                </div>

                <div key={activeSchedule.id} className="animate-in fade-in duration-500 space-y-8 md:space-y-10">
                  <div className="space-y-4 md:space-y-5">
                    <div className="flex min-h-14 flex-col justify-end md:min-h-20">
                      <h2 className="line-clamp-2 text-balance font-sans text-3xl font-semibold leading-[1.05] tracking-tight text-foreground drop-shadow-md sm:text-4xl md:line-clamp-3 md:text-5xl lg:text-6xl">
                        {title}
                      </h2>
                    </div>

                    <dl className="grid grid-cols-2 gap-3 rounded-md border border-white/10 bg-black/25 px-4 py-3 backdrop-blur-sm sm:grid-cols-4 md:flex md:flex-wrap md:items-center md:gap-x-8 md:gap-y-2 md:border-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none">
                      <div className="flex flex-col gap-0.5">
                        <dt className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Episode</dt>
                        <dd className="font-mono text-sm font-semibold tabular-nums text-foreground">{activeSchedule.episode}</dd>
                      </div>
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <dt className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Status</dt>
                        <dd className="truncate font-mono text-sm font-medium text-foreground/90">
                          {activeSchedule.media?.status?.replace(/_/g, " ") ?? "—"}
                        </dd>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <dt className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Format</dt>
                        <dd className="font-mono text-sm font-medium text-foreground">{activeSchedule.media?.format ?? "—"}</dd>
                      </div>
                      <div className="col-span-2 flex flex-col gap-0.5 sm:col-span-1">
                        <dt className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">AniList</dt>
                        <dd className="font-mono text-sm font-medium tabular-nums text-primary/90">#{activeSchedule.media?.id}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="flex flex-col gap-3">
                    <p className="pl-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                      Countdown
                    </p>
                    <div className="relative w-full sm:w-fit">
                      <div className="absolute -left-1 -top-1 h-3 w-3 border-l-2 border-t-2 border-primary/50 motion-reduce:hidden" />
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 border-b-2 border-r-2 border-primary/50 motion-reduce:hidden" />

                      <div className="rounded-md border border-white/10 bg-foreground px-4 py-4 text-background shadow-xl transition-colors hover:border-primary/40 md:px-8 md:py-6">
                        {now === null ? (
                          <span className="font-mono text-sm opacity-50 motion-reduce:animate-none animate-pulse">Syncing clock…</span>
                        ) : countdown ? (
                          <div className="flex flex-wrap items-end justify-start gap-3 sm:gap-4 md:gap-5">
                            {countdown.map((unit, i) => (
                              <div key={COUNTDOWN_LABELS[i]} className="flex flex-col items-center gap-1">
                                <span className="font-mono text-2xl font-bold tabular-nums tracking-tight sm:text-3xl md:text-5xl">
                                  {unit}
                                </span>
                                <span className="font-mono text-[9px] uppercase tracking-widest text-background/50">
                                  {COUNTDOWN_LABELS[i]}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="font-mono text-sm font-semibold uppercase tracking-widest text-primary">Airing now</span>
                        )}
                      </div>
                    </div>

                    <span className="inline-flex text-sm font-medium text-primary underline-offset-4 group-hover:underline">
                      View series →
                    </span>
                  </div>
                </div>
              </div>

              <div className="absolute right-4 top-1/2 hidden h-[58%] max-h-[420px] -translate-y-1/2 transition-transform duration-700 md:flex lg:right-16 xl:right-24 aspect-2/3 group-hover:scale-[1.02]">
                <div className="relative h-full w-full">
                  <div className="absolute -bottom-3 -left-3 h-8 w-8 border-b border-l border-primary/30 md:h-10 md:w-10" />
                  <div className="relative z-10 h-full w-full overflow-hidden rounded-sm border border-white/15 bg-secondary/40 shadow-2xl ring-1 ring-black/30">
                    {schedules.map((schedule, index) => {
                      if (index !== activeIndex) return null
                      const coverImage = schedule?.media?.coverImage?.extraLarge
                      if (!coverImage) return null
                      return (
                        <div key={schedule.id} className="absolute inset-0">
                          <Image
                            src={coverImage}
                            alt=""
                            fill
                            className="object-cover transition-transform duration-[3s] group-hover:scale-105 motion-reduce:transition-none"
                            priority
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute bottom-6 left-0 right-0 z-20 flex h-12 justify-center md:bottom-8">
                <div className="flex w-full max-w-[1600px] items-center justify-between px-6 md:px-12 lg:px-24">
                  <div className="pointer-events-auto flex items-center gap-2 sm:gap-3">
                    {schedules.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          setActiveIndex(i)
                        }}
                        aria-label={`Show airing ${i + 1} of ${schedules.length}`}
                        aria-current={i === activeIndex ? "true" : undefined}
                        className={cn(
                          "relative flex h-8 items-center justify-center rounded-sm transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                          i === activeIndex ? "w-12 bg-primary/15 px-1" : "w-8 hover:bg-white/5"
                        )}
                      >
                        <span
                          className={cn(
                            "block h-0.5 w-full rounded-full transition-colors",
                            i === activeIndex ? "bg-primary" : "bg-muted-foreground/35 group-hover:bg-muted-foreground/55"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="pointer-events-auto hidden font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60 md:block">
                    {schedules.length} in rotation
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  )
}
