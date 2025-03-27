"use client";

import { useState } from "react";
import { Link } from "next-view-transitions";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatStatus } from "@/anilist/utils/formatters";

interface AnimeCardProps {
  anime: {
    id: number;
    title: {
      romaji: string;
      english: string | null;
      native: string;
    };
    coverImage: {
      large: string | null;
      medium: string | null;
    };
    genres: string[];
    averageScore: number | null;
    status: string;
    season?: string | null;
    seasonYear?: number | null;
  };
}

export default function AnimeCard({ anime }: AnimeCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  const title = anime.title.english || anime.title.romaji;

  return (
    <Link href={`/anime/${anime.id}`}>
      <Card
        className="h-full overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-md bg-transparent relative"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm">
          <Image
            src={anime.coverImage.large || anime.coverImage.medium || ""}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            priority
          />

          {/* Score Badge */}
          {anime.averageScore && anime.averageScore > 0 && (
            <div className="absolute right-2 top-2 rounded-full px-2 py-1 text-xs font-bold bg-gradient-to-r from-primary to-purple-400 transition-all z-10">
              {anime.averageScore}%
            </div>
          )}

          {/* Hover Overlay with Details */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 flex flex-col justify-end transition-opacity duration-300 ${
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
