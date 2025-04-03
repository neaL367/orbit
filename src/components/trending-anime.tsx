import { AnimeCard } from "./anime-card";
import { fetchTrendingAnime } from "@/lib/api";

export async function TrendingAnime() {
  const { media: anime } = await fetchTrendingAnime();

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {anime.map((item) => (
        <AnimeCard key={item.id} anime={item} />
      ))}
    </div>
  );
}
