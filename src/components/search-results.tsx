import { AnimeCard } from "./anime-card";
import { searchAnime } from "@/lib/api";

export async function SearchResults({ query }: { query: string }) {
  const { media: results } = await searchAnime(query);

  if (results.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-lg text-muted-foreground">
          No results found for &quot;{query}&quot;
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {results.map((item) => (
        <AnimeCard key={item.id} anime={item} />
      ))}
    </div>
  );
}
