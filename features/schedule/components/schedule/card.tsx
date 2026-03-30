"use client";

import { useRouter } from "next/navigation";
import { useMemo, useCallback, memo } from "react";
import { cn } from "@/lib/utils";
import { getAnimeTitle, formatTimeUntilAiring } from "@/lib/utils/anime-utils";
import { useCurrentTime } from "@/hooks/use-current-time";
import { IndexImage } from "@/components/shared/index-image";
import type { AiringSchedule } from "@/lib/graphql/types/graphql";

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
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  }, [handleCardClick]);

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        "group relative flex flex-col sm:flex-row items-stretch sm:items-center p-3 transition-all duration-300 cursor-pointer overflow-hidden outline-none focus-visible:ring-1 focus-visible:ring-primary",
        "bg-white/1 border border-white/5 hover:bg-white/3 hover:border-white/10",
        isAiringNow && "border-primary/30 bg-primary/2"
      )}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
    >
      {/* 1. Temporal Axis (Time Rail) */}
      <div className="sm:w-32 flex flex-col items-start sm:items-center py-4 border-b sm:border-b-0 sm:border-r border-white/5 shrink-0 relative bg-white/2">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-primary/20 via-primary/5 to-transparent sm:hidden" />
        <span className={cn(
          "font-mono text-2xl font-black tracking-tighter tabular-nums",
          isAiringNow ? "text-primary animate-pulse" : "text-foreground"
        )}>
          {formatTimeAction(airingAt)}
        </span>
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className={cn("w-1 h-1 rotate-45", isAiringNow ? "bg-primary animate-pulse" : "bg-white/10")} />
          <span className="font-mono text-[8px] uppercase text-muted-foreground/40 tracking-[0.3em] font-bold">
            UTC_SYN
          </span>
        </div>
      </div>

      {/* 2. Primary Identity (Image & Branding) */}
      <div className="flex-1 flex flex-col sm:flex-row items-center gap-5 px-5 py-3 sm:py-0">
        <div className="w-full sm:w-20 h-40 sm:h-28 bg-secondary border border-white/5 shrink-0 overflow-hidden relative group-hover:border-white/20 transition-colors shadow-2xl">
          {coverImage && (
            <IndexImage
              src={coverImage}
              alt={title}
              fill
              sizes="120px"
              showTechnicalDetails={false}
              className="w-full h-full object-cover active grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
              priority={priority}
            />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute bottom-2 right-2 flex gap-1 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
            <div className="w-1.5 h-1.5 bg-primary/40" />
            <div className="w-1.5 h-1.5 bg-primary" />
          </div>
          {isAiringNow && (
            <div className="absolute inset-0 bg-primary/5 animate-pulse" />
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-3 text-center sm:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <span className="font-mono text-[8px] uppercase tracking-[0.4em] text-primary/40 font-bold">Registry // {media.format || "ARCHIVE"}</span>
              <div className="flex-1 h-px bg-white/5 hidden sm:block" />
            </div>
            <h3 className="font-mono text-base md:text-lg font-black uppercase truncate group-hover:text-primary transition-colors leading-tight">
              {title}
            </h3>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
            <div className="flex items-center gap-2 px-2.5 py-1 bg-white/5 border border-white/10">
              <span className="font-mono text-[9px] text-muted-foreground/60">EP//</span>
              <span className="font-mono text-[10px] text-foreground font-black">{schedule.episode.toString().padStart(2, '0')}</span>
            </div>

            {timeUntilFormatted ? (
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 bg-primary animate-ping" />
                <span className="font-mono text-[9px] font-black uppercase text-primary tracking-widest tabular-nums">
                  T-MINUS: {timeUntilFormatted}
                </span>
              </div>
            ) : !isFinished && (
              <div className="font-mono text-[9px] uppercase text-muted-foreground/40 tracking-widest flex items-center gap-2">
                <span className="w-1 h-1 bg-white/10" />
                EST_DUR: {media.duration || 24}M
              </div>
            )}
          </div>

          {/* Sub-Transmission Nodes */}
          {streamingLinks.length > 0 && (
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-1 opacity-30 group-hover:opacity-100 transition-opacity duration-500">
              {streamingLinks.slice(0, 4).map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="font-mono text-[8px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors underline underline-offset-4 decoration-white/10 hover:decoration-primary/40"
                >
                  {link.site}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Status Terminal (Transmission State) */}
      <div className="sm:w-40 flex flex-col justify-center items-center sm:items-end px-5 py-4 sm:py-0 border-t sm:border-t-0 sm:border-l border-white/5 bg-white/1">
        <div className={cn(
          "relative w-full text-center px-4 py-2 transition-all duration-500",
          isAiringNow ? "bg-primary shadow-[0_0_20px_rgba(var(--primary),0.2)]" :
            isFinished ? "bg-white/5 border border-white/10" : "bg-white/2 border border-white/5"
        )}>
          <span className={cn(
            "font-mono text-[10px] font-black uppercase tracking-[0.3em] relative z-10",
            isAiringNow ? "text-background" : isFinished ? "text-muted-foreground" : "text-foreground"
          )}>
            {isFinished ? "ARCHIVED" : isAiringNow ? "LIVE_SYN" : "PENDING"}
          </span>
          {isAiringNow && (
            <div className="absolute inset-0 bg-primary animate-pulse blur-md opacity-20" />
          )}
        </div>
        <div className="hidden sm:flex flex-col items-end mt-2 opacity-20 group-hover:opacity-40 transition-opacity">
          <div className="w-16 h-0.5 bg-white/40 mb-1" />
          <span className="font-mono text-[7px] uppercase tracking-tighter">Status_Buffer</span>
        </div>
      </div>

      {/* 4. Global Detail Notches */}
      <div className="absolute top-0 right-0 w-12 h-12 pointer-events-none overflow-hidden">
        <div className={cn(
          "absolute top-0 right-0 w-[40px] h-[40px] translate-x-1/2 -translate-y-1/2 rotate-45 transition-colors duration-500",
          isAiringNow ? "bg-primary" : "bg-white/5"
        )} />
      </div>
      <div className="absolute bottom-0 left-0 w-2 h-8 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="h-full w-[2px] bg-primary animate-[height_1s_ease-out]" />
      </div>
    </div>
  );
}

export const ScheduleCard = memo(ScheduleCardComponent, (prev, next) => {
  return prev.schedule.id === next.schedule.id && prev.schedule.airingAt === next.schedule.airingAt;
});
