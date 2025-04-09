import type React from "react";
import { Calendar, Clock, Info, Tag, Video } from "lucide-react";
import type { AnimeMedia } from "@/lib/types";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader } from "../ui/card";

interface AnimeInfoCardProps {
  anime: AnimeMedia;
  sourceMapping: Record<string, string>;
  statusMapping: Record<string, string>;
}

export function AnimeInfoCard({
  anime,
  sourceMapping,
  statusMapping,
}: AnimeInfoCardProps) {
  return (
    <Card className="overflow-hidden border bg-card/80 backdrop-blur-sm">
      <CardHeader className="bg-primary/20 py-3">
        <h3 className="font-semibold">Anime Details</h3>
      </CardHeader>

      <CardContent className="p-4 grid gap-6">
        {/* Section: Format & Episodes */}
        <div>
          <h3 className="font-semibold text-sm mb-3">General Info</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <InfoItem
              label="Format"
              value={anime.format || "Unknown"}
              icon={<Video className="h-4 w-4 text-primary" />}
            />

            <InfoItem
              label="Episodes"
              value={anime.episodes?.toString() || "Unknown"}
              icon={<Video className="h-4 w-4 text-primary" />}
            />
          </div>
        </div>

        {/* Section: Additional Details */}
        <div>
          <h3 className="font-semibold text-sm mb-3">Additional Details</h3>
          <div className="grid gap-3 text-sm">
            {/* Duration (if available) */}
            {anime.duration && (
              <InfoItem
                label="Duration"
                value={`${anime.duration} min`}
                icon={<Clock className="h-4 w-4 text-primary" />}
              />
            )}

            {/* Season */}
            <InfoItem
              label="Season"
              value={
                anime.season && anime.seasonYear
                  ? `${
                      anime.season.charAt(0).toUpperCase() +
                      anime.season.slice(1)
                    } ${anime.seasonYear}`
                  : "Unknown"
              }
              icon={<Calendar className="h-4 w-4 text-primary" />}
            />

            {/* Status */}
            <InfoItem
              label="Status"
              value={
                statusMapping[anime.status as keyof typeof statusMapping] ||
                "Unknown"
              }
              icon={<Info className="h-4 w-4 text-primary" />}
            />

            {/* Source */}
            {anime.source && (
              <InfoItem
                label="Source"
                value={
                  sourceMapping[anime.source as keyof typeof sourceMapping] ||
                  anime.source
                }
                icon={<Tag className="h-4 w-4 text-primary" />}
              />
            )}
          </div>
        </div>

        {/* Section: Genres */}
        {anime.genres && anime.genres.length > 0 && (
          <div>
            <h3 className="font-semibold text-sm mb-3">Genres</h3>
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="flex flex-wrap gap-2">
                {anime.genres.map((genre, index) => (
                  <Link
                    prefetch={true}
                    key={`${genre}-${index}`}
                    href={`/genres/${genre}`}
                    className="px-2.5 py-1 text-xs rounded-full bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    {genre}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section: Studios */}
        {anime.studios?.nodes && anime.studios.nodes.length > 0 && (
          <div>
            <h3 className="font-semibold text-sm mb-3">Studios</h3>
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="flex flex-wrap gap-2">
                {anime.studios.nodes.map((studio, index) => (
                  <Badge
                    key={`${studio.id}-${index}`}
                    variant="secondary"
                    className="rounded-full"
                  >
                    {studio.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper component for info items
function InfoItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-muted/30 rounded-lg p-3 flex flex-col">
      <span className="text-xs text-muted-foreground mb-1">{label}</span>
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-medium text-sm">{value}</span>
      </div>
    </div>
  );
}
