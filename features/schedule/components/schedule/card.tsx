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
        "group relative flex flex-col sm:flex-row items-stretch sm:items-center gap-6 p-4 border border-border bg-background/50 hover:bg-white/[0.02] hover:border-foreground/30 transition-all duration-500 cursor-pointer overflow-hidden outline-none focus-visible:ring-1 focus-visible:ring-primary",
        isAiringNow && "border-primary/50 bg-primary/[0.01]"
      )}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
    >
      {/* Time Column */}
      <div className="sm:w-32 flex flex-col justify-center items-start sm:items-center py-2 border-b sm:border-b-0 sm:border-r border-border/50 shrink-0">
        <span className="font-mono text-[20px] font-bold tracking-tighter text-foreground">
          {formatTimeAction(airingAt)}
        </span>
        <span className="font-mono text-[9px] uppercase text-muted-foreground/50 tracking-widest mt-1">
          UTC_SYNCHRON
        </span>
      </div>

      {/* Visual Identity Column */}
      <div className="w-24 h-16 sm:w-20 sm:h-28 bg-secondary border border-border shrink-0 overflow-hidden relative">
        {coverImage && (
          <IndexImage
            src={coverImage}
            alt={title}
            fill
            sizes="100px"
            showTechnicalDetails={false}
            className="w-full h-full object-cover active group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
            priority={priority}
          />
        )}
        {isAiringNow && (
          <div className="absolute inset-0 bg-primary/10 animate-pulse pointer-events-none" />
        )}
      </div>

      {/* Identity & Metadata Column */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-mono text-[14px] font-bold uppercase truncate group-hover:text-primary transition-colors">
            {title}
          </h3>
          <span className="w-1.5 h-[1.5px] bg-border hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] text-muted-foreground uppercase px-2 py-0.5 border border-border/50">
              EP: {schedule.episode}
            </span>
            {media.format && (
              <span className="font-mono text-[9px] text-muted-foreground uppercase opacity-60">
                {media.format}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          {timeUntilFormatted && (
            <div className="font-mono text-[10px] font-bold uppercase text-primary tracking-widest flex items-center gap-2">
              <span className="w-1 h-1 bg-primary animate-pulse" />
              T-MINUS: {timeUntilFormatted}
            </div>
          )}
          {!isFinished && !isAiringNow && (
            <div className="font-mono text-[10px] uppercase text-muted-foreground/40 flex items-center gap-2">
              EST_DURATION: {media.duration || 24}M
            </div>
          )}
        </div>

        {/* Streaming Nodes */}
        {streamingLinks.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-1 opacity-40 group-hover:opacity-100 transition-opacity">
            {streamingLinks.slice(0, 3).map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="font-mono text-[9px] uppercase tracking-widest hover:text-foreground underline underline-offset-4 decoration-border/50 hover:decoration-primary/50"
              >
                {link.site}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Transmission Status Column */}
      <div className="sm:w-32 flex justify-end items-center sm:pl-6 shrink-0">
        <div className={cn(
          "font-mono text-[10px] font-bold uppercase px-4 py-1.5 index-cut-tr tracking-widest text-center min-w-[100px]",
          isAiringNow ? "bg-primary text-background" :
            isFinished ? "bg-muted text-muted-foreground border border-border" :
              "border border-border text-muted-foreground/60"
        )}>
          {isFinished ? "ARCHIVED" : isAiringNow ? "LIVE_SYN" : "PENDING"}
        </div>
      </div>

      {/* Accent Notch */}
      {isAiringNow && (
        <div className="absolute top-0 right-0 w-8 h-8 border-t-[1.5px] border-r-[1.5px] border-primary z-10" />
      )}
    </div>
  );
}

export const ScheduleCard = memo(ScheduleCardComponent, (prev, next) => {
  return prev.schedule.id === next.schedule.id && prev.schedule.airingAt === next.schedule.airingAt;
});
