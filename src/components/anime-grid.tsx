import { AnimeCard } from "@/components/anime-card";
import { Anime } from "@/types";

interface AnimeGridProps {
  animeList: Anime[];
  emptyMessage?: string;
}

export function AnimeGrid({
  animeList,
  emptyMessage = "No anime found",
}: AnimeGridProps) {
  if (!animeList || animeList.length === 0) {
    return <p className="text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {animeList.map((anime) => (
        <AnimeCard key={anime.id} anime={anime} />
      ))}
    </div>
  );
}
