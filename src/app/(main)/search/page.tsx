import { Suspense } from "react";
import AnimeCard from "@/components/anime/anime-card";
import Pagination from "@/components/pagination";
import { LoadingAnimeGrid } from "@/components/loading-anime";
import { SearchQueries } from "@/anilist/queries/search";
import { AnimeMedia } from "@/anilist/modal/media";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
}

export default async function SearchPage(props: SearchPageProps) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || "";
  const page = Number.parseInt(searchParams.page || "1", 10);
  const perPage = 18;

  const data = query
    ? await SearchQueries.search({ query, page, perPage })
    : null;
  const animeList = data?.data?.Page?.media || [];
  const pageInfo = data?.data?.Page?.pageInfo || {
    currentPage: 1,
    lastPage: 1,
    hasNextPage: false,
    total: 0,
  };

  return (
    <div className="">
      <h1 className="mb-2 text-3xl font-bold">Search Results</h1>

      {query ? (
        <>
          <p className="mb-8 text-muted-foreground">
            Found {pageInfo.total || 0} results for &quot;{query}&quot;
          </p>

          <Suspense fallback={<LoadingAnimeGrid count={perPage} />}>
            {animeList.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {animeList.map((anime: AnimeMedia) => (
                  <AnimeCard key={anime.id} anime={anime} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <h2 className="text-xl font-semibold">No results found</h2>
                <p className="text-muted-foreground">
                  Try a different search term or browse trending anime
                </p>
              </div>
            )}
          </Suspense>

          {animeList.length > 0 && (
            <Pagination
              currentPage={pageInfo.currentPage}
              totalPages={pageInfo.lastPage}
              hasNextPage={pageInfo.hasNextPage}
            />
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-xl font-semibold">Enter a search term</h2>
          <p className="text-muted-foreground">
            Search for anime by title, genre, or description
          </p>
        </div>
      )}
    </div>
  );
}
