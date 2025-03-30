"use client";

import { useState } from "react";
import { Link } from "next-view-transitions";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatStatus } from "@/anilist/utils/formatters";
import type { AnimeMedia } from "@/anilist/modal/media";

export default function AnimeCard({
  anime,
  airingAt,
}: {
  anime: AnimeMedia;
  airingAt?: number;
}) {
  const [isHovering, setIsHovering] = useState(false);
  const [imageError, setImageError] = useState(false);
  const title = anime.title.english || anime.title.romaji;

  // Get the original image URL
  const imageUrl = anime.coverImage.large || anime.coverImage.medium || "";

  // Format the airing date if it exists
  const formattedDate = airingAt
    ? new Date(airingAt * 1000).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const formattedTime = airingAt
    ? new Date(airingAt * 1000).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <Link href={`/anime/${anime.id}`}>
      <Card
        className="h-full overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-md bg-transparent relative rounded-lg"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm">
          {!imageError && imageUrl ? (
            <Image
              src={imageUrl || ""}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover brightness-85"
              priority
              unoptimized={process.env.NODE_ENV === "production"}
              onError={() => setImageError(true)}
            />
          ) : (
            // Fallback to a placeholder
            <div
              className="w-full h-full bg-gray-800 flex items-center justify-center"
              style={{ aspectRatio: "4/5" }}
            >
              <span className="text-gray-400 text-sm">Image not available</span>
            </div>
          )}

          {/* Score Badge */}
          {anime.averageScore && anime.averageScore > 0 && (
            <div className="absolute right-2 top-2 rounded-md px-2 py-1 text-xs font-normal bg-white text-zinc-950 z-10">
              {anime.averageScore}%
            </div>
          )}

          {/* Airing Date Badge */}
          {formattedDate && (
            <div className="absolute left-2 top-2 rounded-md px-2 py-1 text-xs font-normal bg-black/70 text-white z-10">
              {formattedDate} • {formattedTime}
            </div>
          )}

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
                {formatStatus(anime.status)}
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
