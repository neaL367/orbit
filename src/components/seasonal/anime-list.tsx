import { ApolloError } from "@apollo/client";
import { Calendar, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AnimeCard } from "@/components/anime-card";
import { AnimeMedia } from "@/lib/types";
import { FORMAT_ORDER, Season, formatSeasonName } from "../../app/(pages)/seasonal/utils/season-utils";

interface AnimeListProps {
  animeList: AnimeMedia[];
  loading: boolean;
  error?: ApolloError;
  selectedSeason: Season;
  selectedYear: number;
}

export function AnimeList({
  animeList,
  loading,
  error,
  selectedSeason,
  selectedYear,
}: AnimeListProps) {
  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">
          Loading anime for {formatSeasonName(selectedSeason)} {selectedYear}...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        Failed to load seasonal anime: {error.message}
      </div>
    );
  }

  if (animeList.length === 0) {
    return (
      <div className="text-center py-16 bg-muted/30 rounded-xl">
        <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
        <h3 className="text-lg font-medium mb-2">
          No anime found for {formatSeasonName(selectedSeason)} {selectedYear}
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          This could be because the season hasn&apos;t started yet, or
          there&apos;s no data available. Try selecting a different season or
          year.
        </p>
      </div>
    );
  }

  const groupedAnime: Record<string, AnimeMedia[]> = animeList.reduce(
    (acc, anime) => {
      const format = anime.format ?? "UNKNOWN";
      if (!acc[format]) acc[format] = [];
      acc[format].push(anime);
      return acc;
    },
    {} as Record<string, AnimeMedia[]>
  );

  const sortedEntries = Object.entries(groupedAnime).sort(
    ([a], [b]) => FORMAT_ORDER.indexOf(a) - FORMAT_ORDER.indexOf(b)
  );

  return (
    <div className="space-y-14">
      {sortedEntries.map(([format, list]) => (
        <div key={format} className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold">{format}</h3>
            <Badge variant="secondary">{list.length}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {list.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}