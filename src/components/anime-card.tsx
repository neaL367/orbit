"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { AnimeMedia } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { CountdownTimer, TimerStatus } from "./countdown-timer";

// Helper function to get the appropriate class for the countdown tag based on status
function getTagClass(status?: TimerStatus) {
  switch (status) {
    case TimerStatus.LIVE:
      return "bg-red-600 text-white";
    case TimerStatus.FINISHED:
      return "bg-gray-700 text-gray-300";
    case TimerStatus.UPCOMING:
    default:
      return "bg-white text-blue-600";
  }
}

// Update the AnimeCard props to accept airingAt as a separate prop
export function AnimeCard({
  anime,
  index,
  airingAt,
}: {
  anime: AnimeMedia;
  index?: number;
  airingAt?: number;
}) {
  const [isHovering, setIsHovering] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [timerStatus, setTimerStatus] = useState<TimerStatus>(
    TimerStatus.UPCOMING
  );

  const title =
    anime.title.userPreferred ||
    anime.title.english ||
    anime.title.romaji ||
    "";

  const slug = slugify(title);
  const imageUrl = anime.coverImage.large || anime.coverImage.medium || "";
  const score = anime.averageScore ? anime.averageScore / 10 : undefined;
  const fallbackColor = anime.coverImage?.color || "#1f2937"; // default to gray-800

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cardElement = cardRef.current;

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    if (cardElement) {
      cardElement.addEventListener("mouseenter", handleMouseEnter, {
        passive: true,
      });
      cardElement.addEventListener("mouseleave", handleMouseLeave, {
        passive: true,
      });

      return () => {
        cardElement.removeEventListener("mouseenter", handleMouseEnter);
        cardElement.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, []);

  return (
    <Link prefetch={true} href={`/anime/${anime.id}/${slug}`}>
      <Card
        className="h-full transition-all duration-300 hover:scale-[1.02] hover:shadow-md bg-transparent relative rounded-lg"
        ref={cardRef}
      >
        {/* Rank Number Badge */}
        {typeof index === "number" && (
          <div
            className="z-20 absolute -top-2.5 -left-2.5 md:-top-3 md:-left-3 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-white shadow"
            style={{
              backgroundColor: anime.coverImage?.color ?? "#3b82f6",
            }}
          >
            {index + 1}
          </div>
        )}

        {airingAt ? (
          <div
            className={`absolute top-3 left-0 z-10 ${getTagClass(
              timerStatus
            )} text-xs font-medium py-0.5 px-2 rounded-r-full`}
          >
            <CountdownTimer
              targetTime={airingAt}
              duration={anime.duration}
              onStatusChange={(status) => setTimerStatus(status)}
            />
          </div>
        ) : null}

        {/* Rest of your component remains the same */}
        <div className="relative aspect-[4/5] overflow-hidden w-full rounded-sm">
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${
              imageLoaded ? "opacity-0" : "opacity-100 animate-pulse"
            }`}
            style={{ backgroundColor: fallbackColor }}
          />
          <Image
            src={imageUrl || ""}
            alt={title || ""}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover brightness-85 transition-opacity duration-500 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            priority
            onLoad={() => setImageLoaded(true)}
          />
          {score && (
            <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs text-white">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{score}</span>
            </div>
          )}

          <div
            className={`max-md:hidden absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 flex flex-col justify-end transition-opacity duration-300 ${
              isHovering ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex flex-wrap gap-1 mb-2">
              {anime.genres?.slice(0, 2).map((genre) => (
                <Badge key={genre} variant="secondary" className="text-xs">
                  {genre}
                </Badge>
              ))}
            </div>

            <div className="flex flex-wrap gap-1">
              <Badge
                variant="outline"
                className="text-xs bg-black/50 border-gray-700"
              >
                {formatStatus(anime.status || "")}
              </Badge>
              {anime.season && anime.seasonYear && (
                <Badge
                  variant="outline"
                  className="text-xs bg-black/50 border-gray-700"
                >
                  {anime.season.charAt(0) + anime.season.slice(1).toLowerCase()}{" "}
                  {anime.seasonYear}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="mt-2.5">
          <h3 className="line-clamp-2 text-xs md:text-sm text-white">
            {title}
          </h3>
        </div>
      </Card>
    </Link>
  );
}

function formatStatus(status: string): string {
  switch (status) {
    case "FINISHED":
      return "Finished";
    case "RELEASING":
      return "Airing";
    case "NOT_YET_RELEASED":
      return "Coming Soon";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
}
