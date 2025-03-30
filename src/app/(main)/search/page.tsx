import { Suspense } from "react";
import { InfiniteAnimeGrid } from "@/components/infinite-anime-grid";
import { LoadingAnimeGrid } from "@/components/loading-anime";
import { SearchQueries } from "@/anilist/queries/search";
import { fetchMoreSearchResults } from "@/anilist/actions/anime-actions";

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

  // Create a server action wrapper that captures the query
  async function loadMoreAnimeForSearch(page: number) {
    "use server";
    return fetchMoreSearchResults(query, page);
  }

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
              <InfiniteAnimeGrid
                initialAnime={animeList}
                initialHasNextPage={pageInfo.hasNextPage}
                loadMoreFunction={loadMoreAnimeForSearch}
                initialPage={page}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <h2 className="text-xl font-semibold">No results found</h2>
                <p className="text-muted-foreground">
                  Try a different search term or browse trending anime
                </p>
              </div>
            )}
          </Suspense>
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
