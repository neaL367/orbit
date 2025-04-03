"use client";

import { Link } from "next-view-transitions";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { AnimeMedia } from "@/lib/types";
import { useState } from "react";
import { Star } from "lucide-react";

export function AnimeCard({ anime }: { anime: AnimeMedia }) {
  const [isHovering, setIsHovering] = useState(false);

  const title =
    anime.title.userPreferred ||
    anime.title.english ||
    anime.title.romaji ||
    "";
  const imageUrl = anime.coverImage.large || anime.coverImage.medium || "";
  const score = anime.averageScore ? anime.averageScore / 10 : undefined;

  return (
    <Link href={`/anime/${anime.id}`}>
      <Card
        className="h-full overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-md bg-transparent relative rounded-lg"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Rest of your component remains the same */}
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm">
          <Image
            src={imageUrl || ""}
            alt={title || ""}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover brightness-85"
            priority
          />

          {score && (
            <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs text-white">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{score}</span>
            </div>
          )}

          {/* Score Badge
          {anime.averageScore && anime.averageScore > 0 && (
            <div className="absolute right-2 top-2 rounded-md px-2 py-1 text-xs font-normal bg-white text-zinc-950 z-10">
              {anime.averageScore}%
            </div>
          )} */}

          {/* {showAiringBadge && anime.nextAiringEpisode && (
            <div className="absolute w-max left-2 top-2 rounded-md px-2 py-1 text-[10px] sm:text-xs font-normal bg-black/70 text-white z-10">
              <span className="block sm:inline">{timeUntil}</span>
            </div>
          )} */}

          {/* Hover Overlay with Details */}
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
          <h3 className="line-clamp-2 text-sm text-white">{title}</h3>
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
