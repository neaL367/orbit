import { Suspense } from "react";
import { AnimeGrid } from "@/components/anime-grid";
import { getAllAnime } from "@/lib/db";

interface AnimePageProps {
  searchParams: Promise<{
    genre?: string;
    season?: string;
    status?: string;
  }>;
}

export default async function AnimePage({ searchParams }: AnimePageProps) {
  const { genre, season, status } = await searchParams;

  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-3xl font-bold">Anime Catalog</h1>

      <Suspense fallback={<div>Loading anime...</div>}>
        <AnimeList genre={genre} season={season} status={status} />
      </Suspense>
    </div>
  );
}

async function AnimeList({
  genre,
  season,
  status,
}: {
  genre?: string;
  season?: string;
  status?: string;
}) {
  const allAnime = await getAllAnime();

  // Filter anime based on search params
  let filteredAnime = allAnime;

  if (genre) {
    filteredAnime = filteredAnime.filter((anime) =>
      anime.genres.some((g) => g.toLowerCase() === genre.toLowerCase())
    );
  }

  if (season) {
    filteredAnime = filteredAnime.filter((anime) =>
      anime.season.toLowerCase().includes(season.toLowerCase())
    );
  }

  if (status) {
    filteredAnime = filteredAnime.filter((anime) => anime.status === status);
  }

  return <AnimeGrid animeList={filteredAnime} />;
}
