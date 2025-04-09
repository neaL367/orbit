import { Calendar, Clock, Info, Star, Users } from "lucide-react";
import { AnimeMedia } from "@/lib/types";
import { getTimeUntilAiring } from "@/lib/utils";

interface AnimeStatsProps {
  anime: AnimeMedia;
  title: string;
  showNextEpisode?: boolean;
}

export function AnimeStats({ anime, title, showNextEpisode = true }: AnimeStatsProps) {
  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 md:p-6 border shadow-sm">
      <h1 className="text-2xl md:text-4xl font-bold text-white">{title}</h1>
      {anime.title.native && (
        <p className="mt-1 text-lg text-muted-foreground">{anime.title.native}</p>
      )}

      {/* Score, Popularity, Date & Duration */}
      <div className="flex flex-wrap gap-6 mt-4">
        {anime.averageScore && (
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-yellow-500/10">
              <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
            </div>
            <div>
              <div className="font-medium">{anime.averageScore / 10}</div>
              <div className="text-xs text-muted-foreground">Score</div>
            </div>
          </div>
        )}
        
        {anime.popularity ? (
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-medium">{anime.popularity.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Popularity</div>
            </div>
          </div>
        ) : null}
        
        {anime.startDate && anime.startDate.year && (
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-medium">
                {`${anime.startDate.year}-${
                  anime.startDate.month?.toString().padStart(2, "0") || "??"
                }-${
                  anime.startDate.day?.toString().padStart(2, "0") || "??"
                }`}
              </div>
              <div className="text-xs text-muted-foreground">Release Date</div>
            </div>
          </div>
        )}
        
        {anime.duration && (
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-medium">{anime.duration} min</div>
              <div className="text-xs text-muted-foreground">Per Episode</div>
            </div>
          </div>
        )}
      </div>

      {/* Next Episode Info */}
      {showNextEpisode && anime.nextAiringEpisode && (
        <div className="flex mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Info className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-medium">
                Episode {anime.nextAiringEpisode.episode} airing in{" "}
                {getTimeUntilAiring(anime.nextAiringEpisode.airingAt)}
              </div>
              <div className="text-xs text-muted-foreground">Next Episode</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}