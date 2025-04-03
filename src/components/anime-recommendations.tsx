import { AnimeCard } from "./anime-card";
import { fetchAnimeRecommendations } from "@/lib/api";
import type { AnimeMedia } from "@/lib/types";

export async function AnimeRecommendations({ id }: { id: string }) {
  const recommendations = await fetchAnimeRecommendations(id);

  if (recommendations.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No recommendations available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {recommendations.map((anime: AnimeMedia) => (
        <AnimeCard key={anime.id} anime={anime} />
      ))}
    </div>
  );
}
