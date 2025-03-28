import { AnimeMedia } from "@/anilist/modal/media";
import { Star, Users, PlayCircle, Clock, Calendar } from "lucide-react";

export function AnimeStats({ anime }: { anime: AnimeMedia }) {
  // Format date
  const formatDate = (date?: {
    year?: number | null;
    month?: number | null;
    day?: number | null;
  }) => {
    if (!date || !date.year) return "TBA";
    return new Date(
      date.year,
      (date.month || 1) - 1,
      date.day || 1
    ).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const startDate = formatDate(anime.startDate);
  const endDate =
    anime.status === "FINISHED" ? formatDate(anime.endDate) : "Ongoing";

  // Format studios: join names if studios are available.
  const studios = anime.studios?.nodes?.length
    ? anime.studios.nodes.map((studio) => studio.name).join(", ")
    : null;

  return (
    <div className="flex flex-wrap justify-center md:justify-start gap-3.5 p-4 bg-card rounded-lg border border-border shadow-sm">
      {anime.averageScore && anime.averageScore > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <Star className="h-4 w-4 text-yellow-500" />
          <span>{anime.averageScore}% Rating</span>
        </div>
      )}

      {anime.popularity > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4" />
          <span>{anime.popularity.toLocaleString()} Users</span>
        </div>
      )}

      {anime.episodes && anime.episodes > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <PlayCircle className="h-4 w-4" />
          <span>{anime.episodes} Episodes</span>
        </div>
      )}

      {anime.duration && anime.duration > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4" />
          <span>{anime.duration} mins per ep</span>
        </div>
      )}

      {anime.startDate?.year && (
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4" />
          <span>
            {startDate} - {endDate}
          </span>
        </div>
      )}

      {studios && (
        <div className="flex items-center gap-2 text-sm">
          <span className="font-bold">Studios:</span>
          <span>{studios}</span>
        </div>
      )}

      {anime.source && (
        <div className="flex items-center gap-2 text-sm">
          <span className="font-bold">Source:</span>
          <span>{anime.source}</span>
        </div>
      )}
    </div>
  );
}
