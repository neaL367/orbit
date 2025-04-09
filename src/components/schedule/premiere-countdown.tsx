"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ScheduleMetadata } from "@/app/(pages)/schedule/page";

interface PremiereCountdownProps {
  premieres: ScheduleMetadata[];
  currentPremiereIndex: number;
  setCurrentPremiereIndex: (index: number) => void;
  currentPremiere: ScheduleMetadata;
  timeRemaining: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
}

export function PremiereCountdown({
  premieres,
  currentPremiereIndex,
  setCurrentPremiereIndex,
  currentPremiere,
  timeRemaining,
}: PremiereCountdownProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
  }, [currentPremiereIndex]);

  if (premieres.length === 0) return null;

  const title =
    currentPremiere.media.title.english ||
    currentPremiere.media.title.romaji ||
    "Unknown Anime";

  const formattedDate = new Date(
    currentPremiere.airingAt * 1000
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handlePrevious = () => {
    setCurrentPremiereIndex(
      (currentPremiereIndex - 1 + premieres.length) % premieres.length
    );
  };

  const handleNext = () => {
    setCurrentPremiereIndex((currentPremiereIndex + 1) % premieres.length);
  };

  return (
    <div className="mb-8 overflow-hidden rounded-xl border bg-background/50 backdrop-blur-sm">
      <div className="relative">
        {/* Main content */}
        <div className="flex flex-col md:flex-row">
          {/* Left column - Info */}
          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 flex flex-col items-start justify-center md:w-1/2 lg:w-3/5">
            {/* Premiere label */}
            <div className="w-max flex justify-center items-center gap-1.5 bg-black/10 dark:bg-white/10 px-3 py-1 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span className="text-xs font-medium tracking-wide">
                PREMIERES {formattedDate}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight line-clamp-2">
              {title}
            </h2>

            {/* Genres */}
            {currentPremiere.media.genres &&
              currentPremiere.media.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {currentPremiere.media.genres
                    .slice(0, 4)
                    .map((genre, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="rounded-md font-normal text-xs"
                      >
                        {genre}
                      </Badge>
                    ))}
                </div>
              )}

            {/* Description */}
            {currentPremiere.media.description && (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p
                  className="line-clamp-2 sm:line-clamp-3 text-muted-foreground text-sm"
                  dangerouslySetInnerHTML={{
                    __html: currentPremiere.media.description,
                  }}
                />
              </div>
            )}

            {/* Countdown */}
            <div className="pt-2 sm:pt-4 w-full">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">
                  Countdown to premiere
                </p>
              </div>
              <div className="grid grid-cols-4 gap-1 sm:gap-2">
                {[
                  { value: timeRemaining.days, label: "Days" },
                  { value: timeRemaining.hours, label: "Hours" },
                  { value: timeRemaining.minutes, label: "Min" },
                  { value: timeRemaining.seconds, label: "Sec" },
                ].map((time, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-muted rounded-md px-1 py-1 sm:py-2">
                      <p className="text-base sm:text-xl md:text-2xl font-mono font-bold">
                        {time.value.toString().padStart(2, "0")}
                      </p>
                    </div>
                    <p className="text-[10px] sm:text-xs mt-1 text-muted-foreground">
                      {time.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column - Image */}
          <div className="relative h-48 sm:h-64 md:h-auto md:w-1/2 lg:w-2/5 overflow-hidden">
            <div className="absolute inset-0 bg-muted/50 animate-pulse"></div>
            {currentPremiere.media.bannerImage ? (
              <Image
                src={currentPremiere.media.bannerImage || ""}
                alt={title}
                fill
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
                className={cn(
                  "object-cover transition-opacity duration-500",
                  imageLoaded ? "opacity-100" : "opacity-0"
                )}
                onLoad={() => setImageLoaded(true)}
              />
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  backgroundColor:
                    currentPremiere.media.coverImage.color || "#1f2937",
                }}
              >
                <Image
                  src={currentPremiere.media.coverImage.large || ""}
                  alt={title}
                  fill
                  priority
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
                  className={cn(
                    "object-cover transition-opacity duration-500",
                    imageLoaded ? "opacity-100" : "opacity-0"
                  )}
                  onLoad={() => setImageLoaded(true)}
                />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-background to-transparent md:bg-gradient-to-r"></div>
          </div>
        </div>

        {/* Navigation controls */}
        {premieres.length > 1 && (
          <div className="absolute bottom-4 right-4 flex items-center gap-2 z-10">
            <button
              onClick={handlePrevious}
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center border border-border/40 text-foreground hover:bg-background transition-colors"
              aria-label="Previous premiere"
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
            <div className="text-[10px] sm:text-xs font-medium px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm border border-border/40">
              {currentPremiereIndex + 1} / {premieres.length}
            </div>
            <button
              onClick={handleNext}
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center border border-border/40 text-foreground hover:bg-background transition-colors"
              aria-label="Next premiere"
            >
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
