"use client"

import Link from "next/link"
import Image from "next/image"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { Zap } from "lucide-react"
import { getAnimeTitle } from "@/lib/utils/anime-utils"
import { useCurrentTime } from "@/hooks/use-current-time"
import { extractDominantColors } from "@/lib/utils/dominant-colors"
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

const DEFAULT_COLORS: ColorPalette = {
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

interface NextAiringClientProps {
  className?: string
  data: ScheduleAnimeHeroQuery
}

/** Restored from git baseline `0c069ab`; TS/a11y/motion/gradient touch-ups only. */
export function NextAiringClient({ className, data }: NextAiringClientProps) {
  const now = useCurrentTime()
  const [activeIndex, setActiveIndex] = useState(0)
  const [colors, setColors] = useState<ColorPalette[]>([])
  const colorCache = useRef<Map<string, ColorPalette>>(new Map())

  const schedules = useMemo(() => data?.Page?.airingSchedules || [], [data])
  const activeSchedule = schedules[activeIndex]

  useEffect(() => {
    if (schedules.length === 0) return

    const extractColors = async () => {
      const extracted = await Promise.all(
        schedules.slice(0, 5).map(async (schedule) => {
          const imageUrl =
            schedule?.media?.bannerImage ||
            schedule?.media?.coverImage?.extraLarge
          if (!imageUrl) return DEFAULT_COLORS
          if (colorCache.current.has(imageUrl))
            return colorCache.current.get(imageUrl)!
          const extractedColors = await extractDominantColors(imageUrl)
          colorCache.current.set(imageUrl, extractedColors)
          return extractedColors
        })
      )
      setColors(extracted)
    }

    void extractColors()
  }, [schedules])

  useEffect(() => {
    if (schedules.length <= 1) return
    const timer = window.setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % schedules.length)
    }, 8000)
    return () => window.clearTimeout(timer)
  }, [schedules.length, activeIndex])

  const title = useMemo(
    () =>
      activeSchedule?.media
        ? getAnimeTitle(activeSchedule.media as unknown as Media)
        : null,
    [activeSchedule]
  )

  const timeUntilSec =
    activeSchedule?.airingAt && now
      ? activeSchedule.airingAt - now
      : null

  const countdown = useMemo(() => {
    if (!timeUntilSec || timeUntilSec <= 0 || now === null) return null
    const days = Math.floor(timeUntilSec / (3600 * 24))
    const hours = Math.floor((timeUntilSec % (3600 * 24)) / 3600)
    const minutes = Math.floor((timeUntilSec % 3600) / 60)
    const seconds = timeUntilSec % 60
    const pad = (n: number) => n.toString().padStart(2, "0")
    return `${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  }, [timeUntilSec, now])

  const currentColors = colors[activeIndex] || DEFAULT_COLORS

  if (!activeSchedule) return null

  const mediaId = activeSchedule.media?.id

  const heroInner = (
    <>
      <div className="absolute inset-0 bg-secondary/10">
        {activeSchedule.media?.bannerImage ? (
          <Image
            src={activeSchedule.media.bannerImage}
            alt=""
            fill
            className="scale-110 object-cover opacity-20 blur-3xl"
            priority
          />
        ) : null}
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent" />
      </div>

      <div className="relative mx-auto flex h-full w-full max-w-7xl items-center px-6 md:px-12">
        <div className="z-10 w-full max-w-3xl space-y-10">
          <div className="flex items-center gap-3 text-primary/80">
            <Zap
              className="h-4 w-4 shrink-0 fill-current motion-reduce:animate-none animate-pulse"
              aria-hidden
            />
            <span className="font-mono text-xs font-black uppercase tracking-[0.4em]">
              Broadcast_Signal_Sync
            </span>
          </div>

          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 motion-reduce:animate-none">
            <h2 className="line-clamp-2 max-w-4xl font-sans text-4xl font-semibold leading-[1.05] tracking-tight text-balance text-foreground drop-shadow-2xl md:text-6xl lg:text-7xl">
              {title}
            </h2>

            <div className="index-cut-tr flex flex-wrap items-center gap-6 border border-white/10 bg-white/5 p-5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="opacity-40">EP//</span>
                <span className="font-black text-primary">
                  {activeSchedule.episode}
                </span>
              </div>
              <div className="h-3 w-px bg-white/10" />
              <div className="flex items-center gap-2">
                <span className="opacity-40">FORMAT//</span>
                <span className="font-bold text-foreground">
                  {activeSchedule.media?.format?.replace(/_/g, " ") ?? "—"}
                </span>
              </div>
              <div className="h-3 w-px bg-white/10" />
              <div className="flex items-center gap-2">
                <span className="opacity-40">STATUS//</span>
                <span className="font-bold text-foreground">
                  {activeSchedule.media?.status?.replace(/_/g, " ") ?? "—"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <span className="font-mono text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">
                Counter_Synchronization
              </span>
              <div className="index-cut-tr inline-block bg-foreground px-8 py-6 text-background">
                <div className="font-mono text-4xl font-black tabular-nums md:text-6xl">
                  {now === null ? "SYNC..." : countdown || "LIVE"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute right-12 top-1/2 hidden aspect-2/3 h-[70%] -translate-y-1/2 items-center lg:flex">
          <div className="relative h-full w-full transition-transform duration-700 group-hover:scale-105 motion-reduce:group-hover:scale-100">
            <div className="absolute -inset-4 -z-10 translate-x-4 translate-y-4 border border-primary/10" />
            <div className="relative h-full w-full overflow-hidden border border-white/10 bg-secondary shadow-2xl">
              {activeSchedule.media?.coverImage?.extraLarge ? (
                <Image
                  src={activeSchedule.media.coverImage.extraLarge}
                  alt={title ? `${title} cover art` : ""}
                  fill
                  className="object-cover"
                  priority
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-8 left-0 right-0 flex justify-center">
        <div className="pointer-events-auto flex w-full max-w-7xl gap-4 px-6">
          {schedules.map((s, i) => (
            <button
              key={s?.id ?? i}
              type="button"
              onClick={(e) => {
                e.preventDefault()
                setActiveIndex(i)
              }}
              aria-label={`Show upcoming slot ${i + 1} of ${schedules.length}`}
              aria-current={i === activeIndex ? "true" : undefined}
              className={`h-1 transition-all duration-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring ${
                i === activeIndex
                  ? "w-12 bg-primary"
                  : "w-4 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </>
  )

  return (
    <section
      className={`relative flex w-full flex-col overflow-hidden bg-background ${className ?? ""}`}
      style={
        {
          "--current-mid-center": currentColors.midCenter,
        } as React.CSSProperties
      }
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-black">
        <div className="absolute inset-[-20%] opacity-60 blur-[120px] transition-opacity duration-1000">
          <div className="grid h-full w-full grid-cols-3 grid-rows-3">
            {Object.values(currentColors).map((color, i) => (
              <div
                key={i}
                className="transition-colors duration-2000"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-1 flex-col isolate">
        {mediaId != null ? (
          <Link
            href={`/anime/${mediaId}`}
            className="group relative block h-full min-h-[min(72vh,640px)] w-full"
          >
            {heroInner}
          </Link>
        ) : (
          <div className="relative block min-h-[min(72vh,640px)] w-full">
            {heroInner}
          </div>
        )}
      </div>
    </section>
  )
}
