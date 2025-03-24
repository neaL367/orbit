import { Suspense } from "react";
import { AnimeGrid } from "@/components/anime-grid";
import { searchAnime } from "@/lib/db";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export default async function SearchPage(props: SearchPageProps) {
  const searchParams = await props.searchParams;
  const { q } = searchParams;

  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-3xl font-bold">
        {q ? `Search Results for "${q}"` : "Search Results"}
      </h1>

      {q ? (
        <Suspense fallback={<div>Searching...</div>}>
          <SearchResults query={q} />
        </Suspense>
      ) : (
        <p className="text-muted-foreground">Please enter a search query</p>
      )}
    </div>
  );
}

async function SearchResults({ query }: { query: string }) {
  const results = await searchAnime(query);
  return (
    <AnimeGrid
      animeList={results}
      emptyMessage={`No results found for "${query}"`}
    />
  );
}
