"use client";

import { useRouter } from "next/navigation";
import { useMemo, useCallback, memo } from "react";
import { cn } from "@/lib/utils";
import { getAnimeTitle, formatTimeUntilAiring } from "@/lib/utils/anime-utils";
import { useCurrentTime } from "@/hooks/use-current-time";
import { useImageLoaded } from "@/hooks/use-image-loaded";
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
};

function ScheduleCardComponent({
  schedule,
  media,
  formatTimeAction,
  getStreamingLinksAction,
}: ScheduleCardProps) {
  const router = useRouter();
  const now = useCurrentTime();
  const { loaded, onLoad, ref: imgRef } = useImageLoaded();

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

  return (
    <div
      className="group relative border border-border p-4 bg-background hover:border-foreground transition-all duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="space-y-4">
        {/* Cover with Index state */}
        <div className="relative aspect-video w-full bg-secondary border border-border overflow-hidden">
          {coverImage && (
            <img
              ref={imgRef}
              src={coverImage}
              alt={title}
              loading="lazy"
              onLoad={onLoad}
              className={cn(
                "absolute inset-0 w-full h-full object-cover transition-all duration-700",
                loaded ? "opacity-100" : "opacity-0",
                "group-hover:scale-[1.02]"
              )}
            />
          )}
          <div className="absolute top-0 left-0 bg-foreground text-background px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-tighter index-cut-tr z-10">
            {formatTimeAction(airingAt)}
          </div>
          {isAiringNow && (
            <div className="absolute bottom-0 right-0 bg-white text-black px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest animate-pulse z-10">
              ON_AIR
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <h3 className="font-mono text-[14px] font-bold leading-tight uppercase tracking-tighter text-foreground line-clamp-2 min-h-[2.4em] group-hover:underline">
              {title}
            </h3>
            {timeUntilFormatted && (
              <div className="font-mono text-[11px] font-bold uppercase text-primary tracking-widest">
                T-MINUS: {timeUntilFormatted}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground border-t border-border pt-4">
            <div className="flex gap-4">
              <span>EP: {schedule.episode}</span>
              {media.format && <span>{media.format}</span>}
            </div>
            <div className={cn(
              "transition-colors",
              isAiringNow ? "text-foreground" : "opacity-40"
            )}>
              {isFinished ? "FINISHED" : isAiringNow ? "ACTIVE" : "PENDING"}
            </div>
          </div>

          {/* Minimalist Streaming Registry */}
          {streamingLinks.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 opacity-40 group-hover:opacity-100 transition-opacity">
              {streamingLinks.slice(0, 3).map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="font-mono text-[10px] uppercase tracking-widest hover:text-foreground hover:underline"
                >
                  [{link.site}]
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Index Notch Visual Enhancement */}
      {isAiringNow && (
        <div className="absolute -left-[1px] top-4 w-[2.5px] h-10 bg-foreground" />
      )}
    </div>
  );
}

export const ScheduleCard = memo(ScheduleCardComponent, (prev, next) => {
  return prev.schedule.id === next.schedule.id && prev.schedule.airingAt === next.schedule.airingAt;
});
