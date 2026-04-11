"use client";

import { useRouter } from "next/navigation";
import { useMemo, useCallback, memo } from "react";
import { cn } from "@/lib/utils";
import { getAnimeTitle, formatTimeUntilAiring } from "@/lib/utils/anime-utils";
import { useCurrentTime } from "@/hooks/use-current-time";
import { IndexImage } from "@/components/shared/index-image";
import type { AiringSchedule } from "@/lib/graphql/types/graphql";

function formatMediaKind(format: string | null | undefined): string {
  if (!format) return "Series";
  const map: Record<string, string> = {
    TV: "TV",
    TV_SHORT: "Short TV",
    MOVIE: "Movie",
    SPECIAL: "Special",
    OVA: "OVA",
    ONA: "ONA",
    MUSIC: "Music",
    MANGA: "Manga",
    NOVEL: "Novel",
    ONE_SHOT: "One shot",
  };
  return map[format] ?? format.replace(/_/g, " ");
}

type ScheduleCardProps = {
  schedule: AiringSchedule;
  media: NonNullable<AiringSchedule["media"]>;
  formatTimeAction: (timestamp: number) => string;
  getStreamingLinksAction: (schedule: AiringSchedule) => Array<{
    site: string;
    url: string;
    icon?: string | null;
    color?: string | null;
  }>;
  priority?: boolean;
};

function ScheduleCardComponent({
  schedule,
  media,
  formatTimeAction,
  getStreamingLinksAction,
  priority = false,
}: ScheduleCardProps) {
  const router = useRouter();
  const now = useCurrentTime();

  const title = useMemo(() => getAnimeTitle(media), [media]);
  const coverImage = media.coverImage?.large || media.coverImage?.extraLarge || undefined;

  const airingAt = schedule.airingAt;
  const isAiringNow = now ? (now >= airingAt && now <= airingAt + (media.duration || 30) * 60) : false;
  const isFinished = now ? (now > airingAt + (media.duration || 30) * 60) : false;
  const timeUntilSec = now ? (airingAt - now) : 0;
  const timeUntilFormatted = timeUntilSec > 0 ? formatTimeUntilAiring(timeUntilSec) : null;

  const streamingLinks = useMemo(() => getStreamingLinksAction(schedule), [schedule, getStreamingLinksAction]);

  const handleCardClick = useCallback(() => {
    router.push(`/anime/${media.id}`);
  }, [router, media.id]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  }, [handleCardClick]);

  const statusLabel = isFinished ? "Ended" : isAiringNow ? "On air" : "Upcoming";

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        "group relative flex cursor-pointer flex-col items-stretch overflow-hidden p-3 outline-none transition-all duration-300 sm:flex-row sm:items-center",
        "border border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isAiringNow && "border-primary/35 bg-primary/[0.04] ring-1 ring-primary/15"
      )}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
    >
      <div className="relative flex shrink-0 flex-col items-start border-b border-white/5 bg-white/[0.02] py-4 sm:w-32 sm:border-b-0 sm:border-r sm:items-center">
        <div className="absolute left-0 top-0 h-0.5 w-full bg-linear-to-r from-primary/25 via-primary/5 to-transparent sm:hidden" />
        <span
          className={cn(
            "font-mono text-2xl font-bold tabular-nums tracking-tight",
            isAiringNow ? "text-primary motion-reduce:animate-none motion-safe:animate-pulse" : "text-foreground"
          )}
        >
          {formatTimeAction(airingAt)}
        </span>
        <div className="mt-1.5 flex items-center gap-1.5">
          <div
            className={cn(
              "h-1 w-1 rotate-45",
              isAiringNow ? "bg-primary motion-safe:animate-pulse" : "bg-white/15"
            )}
          />
          <span className="font-mono text-[8px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/70">
            Local time
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center gap-5 px-5 py-3 sm:flex-row sm:py-0">
        <div className="relative h-40 w-full shrink-0 overflow-hidden border border-white/5 bg-secondary shadow-xl transition-colors group-hover:border-white/15 sm:h-28 sm:w-20">
          {coverImage && (
            <IndexImage
              src={coverImage}
              alt={title}
              fill
              sizes="120px"
              showTechnicalDetails={false}
              className="h-full w-full object-cover grayscale-[0.15] transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0 motion-reduce:group-hover:scale-100"
              priority={priority}
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <div className="pointer-events-none absolute bottom-2 right-2 flex translate-y-4 gap-1 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:translate-y-0 motion-reduce:opacity-0">
            <div className="h-1.5 w-1.5 bg-primary/40" />
            <div className="h-1.5 w-1.5 bg-primary" />
          </div>
          {isAiringNow && (
            <div className="pointer-events-none absolute inset-0 bg-primary/5 motion-safe:animate-pulse motion-reduce:animate-none" />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3 text-center sm:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-3 sm:justify-start">
              <span className="font-mono text-[8px] font-semibold uppercase tracking-[0.18em] text-primary/55">
                {formatMediaKind(media.format ?? undefined)}
              </span>
              <div className="hidden h-px flex-1 bg-white/8 sm:block" />
            </div>
            <h3 className="line-clamp-2 font-sans text-base font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary md:text-lg">
              {title}
            </h3>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-start">
            <div className="flex items-center gap-2 border border-white/10 bg-white/[0.04] px-2.5 py-1">
              <span className="font-mono text-[9px] text-muted-foreground/70">Ep</span>
              <span className="font-mono text-[10px] font-bold tabular-nums text-foreground">
                {schedule.episode.toString().padStart(2, "0")}
              </span>
            </div>

            {timeUntilFormatted ? (
              <div className="flex items-center gap-2">
                <span className="h-1 w-1 shrink-0 rounded-full bg-primary motion-safe:animate-ping motion-reduce:animate-none" />
                <span className="font-mono text-[9px] font-semibold uppercase tracking-wider tabular-nums text-primary">
                  In {timeUntilFormatted}
                </span>
              </div>
            ) : !isFinished && (
              <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-wider text-muted-foreground/60">
                <span className="h-1 w-1 bg-white/15" />
                ~{media.duration || 24} min
              </div>
            )}
          </div>

          {streamingLinks.length > 0 && (
            <div className="mt-1 flex flex-wrap justify-center gap-3 opacity-40 transition-opacity duration-500 group-hover:opacity-100 sm:justify-start">
              {streamingLinks.slice(0, 4).map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="font-mono text-[8px] font-semibold uppercase tracking-wider underline decoration-white/15 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary/40"
                >
                  {link.site}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center border-t border-white/5 bg-white/[0.02] px-5 py-4 sm:w-40 sm:border-l sm:border-t-0 sm:items-end sm:py-0">
        <div
          className={cn(
            "relative w-full px-4 py-2 text-center transition-all duration-300",
            isAiringNow
              ? "bg-primary text-primary-foreground shadow-lg ring-1 ring-primary/30"
              : isFinished
                ? "border border-white/10 bg-white/[0.04]"
                : "border border-white/8 bg-white/[0.02]"
          )}
        >
          <span
            className={cn(
              "relative z-10 font-mono text-[10px] font-bold uppercase tracking-[0.2em]",
              isAiringNow ? "text-primary-foreground" : isFinished ? "text-muted-foreground" : "text-foreground"
            )}
          >
            {statusLabel}
          </span>
          {isAiringNow && (
            <div className="pointer-events-none absolute inset-0 bg-primary motion-safe:animate-pulse motion-reduce:animate-none motion-safe:blur-md opacity-15" />
          )}
        </div>
        <div className="mt-2 hidden flex-col items-end opacity-25 transition-opacity group-hover:opacity-45 sm:flex">
          <div className="mb-1 h-0.5 w-16 bg-white/35" />
          <span className="font-mono text-[7px] uppercase tracking-wide text-muted-foreground">Status</span>
        </div>
      </div>

      <div className="pointer-events-none absolute right-0 top-0 h-12 w-12 overflow-hidden">
        <div
          className={cn(
            "absolute right-0 top-0 h-[40px] w-[40px] translate-x-1/2 -translate-y-1/2 rotate-45 transition-colors duration-500",
            isAiringNow ? "bg-primary" : "bg-white/6"
          )}
        />
      </div>
      <div className="pointer-events-none absolute bottom-0 left-0 h-8 w-2 opacity-0 transition-opacity group-hover:opacity-100 motion-reduce:opacity-0">
        <div className="h-full w-0.5 bg-primary" />
      </div>
    </div>
  );
}

export const ScheduleCard = memo(ScheduleCardComponent, (prev, next) => {
  return prev.schedule.id === next.schedule.id && prev.schedule.airingAt === next.schedule.airingAt;
});
