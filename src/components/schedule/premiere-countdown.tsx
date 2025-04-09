"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Calendar, Clock, Star } from "lucide-react";
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
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mb-8 overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg">
      <div className="relative overflow-hidden rounded-xl bg-black/5 backdrop-blur-sm">
        {/* Background image with blur effect */}
        <div
          className={cn(
            "absolute inset-0 opacity-20 blur-sm transition-opacity duration-500",
            imageLoaded ? "opacity-20" : "opacity-0"
          )}
          style={{
            backgroundImage: `url(${
              currentPremiere.media.bannerImage ||
              currentPremiere.media.coverImage.large
            })`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <div className="relative z-10 p-4 sm:p-6 md:p-8">
          <div className="grid gap-6 md:grid-cols-[1fr_auto]">
            {/* Left column - Info */}
            <div className="space-y-4">
              {/* Premiere badge */}
              <div className="inline-flex">
                <div className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2">
                  <Star className="h-3 w-3 text-yellow-400" />
                  <span className="uppercase tracking-wide text-[10px] font-medium">
                    Upcoming Premiere
                  </span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
                {title}
              </h2>

              {/* Genres */}
              {currentPremiere.media.genres &&
                currentPremiere.media.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {currentPremiere.media.genres
                      .slice(0, 3)
                      .map((genre, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="rounded-full"
                        >
                          {genre}
                        </Badge>
                      ))}
                  </div>
                )}

              {/* Date */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formattedDate}</span>
              </div>

              {/* Description */}
              {currentPremiere.media.description && (
                <p
                  className="text-sm text-muted-foreground line-clamp-2 md:line-clamp-3 mt-2"
                  dangerouslySetInnerHTML={{
                    __html: currentPremiere.media.description,
                  }}
                />
              )}
            </div>

            {/* Right column - Image and countdown */}
            <div className="flex flex-col items-center gap-4">
              {/* Image */}
              <div className="relative aspect-[3/4] w-full max-w-[200px] overflow-hidden rounded-lg shadow-md">
                <div className="absolute inset-0 bg-muted/50 animate-pulse"></div>
                <Image
                  src={
                    currentPremiere.media.coverImage.large ||
                    "/placeholder.svg?height=300&width=200"
                  }
                  alt={title}
                  fill
                  sizes="(max-width: 768px) 100vw, 200px"
                  className={cn(
                    "object-cover transition-opacity duration-500",
                    imageLoaded ? "opacity-100" : "opacity-0"
                  )}
                  onLoad={() => setImageLoaded(true)}
                />
              </div>

              {/* Countdown */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl blur-sm"></div>
                <div className="relative bg-black/30 backdrop-blur-md rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-3 w-3 text-primary" />
                    <p className="text-xs uppercase tracking-wider opacity-70">
                      Premieres in
                    </p>
                  </div>
                  <div className="grid grid-cols-4 gap-3 sm:gap-4">
                    {[
                      { value: timeRemaining.days, label: "Days" },
                      { value: timeRemaining.hours, label: "Hours" },
                      { value: timeRemaining.minutes, label: "Mins" },
                      { value: timeRemaining.seconds, label: "Secs" },
                    ].map((time, index) => (
                      <div key={index} className="text-center">
                        <div className="bg-black/20 backdrop-blur-sm rounded-md px-2 py-1">
                          <p className="text-xl sm:text-2xl font-mono font-bold">
                            {time.value.toString().padStart(2, "0")}
                          </p>
                        </div>
                        <p className="text-xs mt-1 opacity-70">{time.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation dots */}
        {premieres.length > 1 && (
          <div
            className="flex justify-center py-4 gap-2"
            role="tablist"
            aria-label="Premiere navigation"
          >
            {premieres.map((premiere, index) => (
              <button
                key={premiere.id || index}
                type="button"
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentPremiereIndex
                    ? "bg-white/90 w-8 sm:w-10"
                    : "bg-white/30 w-4 sm:w-5 hover:bg-white/50"
                }`}
                onClick={() => {
                  console.log("Changing premiere to index:", index);
                  setCurrentPremiereIndex(index);
                }}
                aria-label={`View premiere ${index + 1}`}
                aria-selected={index === currentPremiereIndex}
                role="tab"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
