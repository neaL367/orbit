import Link from "next/link";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AnimeImageCard } from "./anime-image-card";
import { StreamingPlatforms } from "./streaming-platforms";
import { slugify } from "@/lib/utils";

interface ScheduleAnime {
  id: number;
  title: {
    romaji?: string;
    english?: string;
    native?: string;
    userPreferred?: string;
  };
  coverImage: {
    large: string;
    medium?: string;
  };
  episode: number;
  airingAt: number;
  format: string;
  duration?: number;
  externalLinks?: {
    id: number;
    url: string;
    site: string;
    type?: string;
    language?: string;
    color?: string;
    icon?: string;
  }[];
}

interface ScheduleCardProps {
  anime: ScheduleAnime;
}

export function ScheduleCard({ anime }: ScheduleCardProps) {
  const title =
    anime.title.userPreferred ||
    anime.title.english ||
    anime.title.romaji ||
    "";
  const airingTime = new Date(anime.airingAt * 1000);
  const formattedTime = format(airingTime, "h:mm a");
  const isAiringToday = new Date().toDateString() === airingTime.toDateString();

  return (
    <div className="flex border rounded-lg bg-zinc-900 group hover:shadow-md transition-all">
      <AnimeImageCard
        animeId={anime.id}
        coverImage={anime.coverImage}
        title={title}
        airingAt={anime.airingAt}
        isAiringToday={isAiringToday}
      />
      <div className="flex flex-col flex-grow p-4 gap-2">
        <Link
          href={`/anime/${anime.id}/${slugify(title)}`}
          className="group-hover:text-white text-white/80 transition-colors"
        >
          <h3 className="font-medium text-xs md:text-base line-clamp-1">{title}</h3>
        </Link>
        <div className="flex items-center mt-1 text-xs text-muted-foreground">
          <Badge variant="secondary" className="mr-2 text-xs">
            Ep {anime.episode}
          </Badge>
          <span className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {formattedTime}
          </span>
        </div>
        <div className="flex items-center mt-1 text-xs text-muted-foreground">
          <span className="px-1.5 py-0.5 bg-muted rounded-sm mr-2">
            {anime.format}
          </span>
          {anime.duration && (
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {anime.duration} min
            </span>
          )}
        </div>
        <StreamingPlatforms
          animeId={anime.id}
          title={anime.title.english || anime.title.romaji || ""}
          externalLinks={anime.externalLinks}
        />
      </div>
    </div>
  );
}
