import { Suspense } from "react";
import { notFound } from "next/navigation";
import AnilistQueries from "@/lib/anilist";
import AnimeCard from "@/components/anime-card";
import Pagination from "@/components/pagination";
import { LoadingAnimeGrid } from "@/components/loading-anime";

interface GenrePageProps {
  params: Promise<{
    genre: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function GenrePage(props: GenrePageProps) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const genre = decodeURIComponent(params.genre);
  const page = Number.parseInt(searchParams.page || "1", 10);
  const perPage = 24;

  const data = await AnilistQueries.getByGenre({ genre, page, perPage });
  const animeList = data?.data?.Page?.media || [];

  if (animeList.length === 0 && page === 1) {
    notFound();
  }

  const pageInfo = data?.data?.Page?.pageInfo || {
    currentPage: 1,
    lastPage: 1,
    hasNextPage: false,
    total: 0,
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="mb-2 text-3xl font-bold">{genre} Anime</h1>
      <p className="mb-8 text-muted-foreground">
        Found {pageInfo.total || 0} anime in this genre
      </p>

      <Suspense fallback={<LoadingAnimeGrid count={perPage} />}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {animeList.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      </Suspense>

      <Pagination
        currentPage={pageInfo.currentPage}
        totalPages={pageInfo.lastPage}
        hasNextPage={pageInfo.hasNextPage}
      />
    </div>
  );
}
