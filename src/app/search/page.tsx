import { Suspense } from "react";
import { AnimeGrid } from "@/components/anime-grid";
import { getAllAnime } from "@/lib/db";

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
        {q ? `Search Results for "${q}"` : "Search"}
      </h1>

      {q ? (
        <Suspense fallback={<div>Searching titles...</div>}>
          <SearchResults query={q} />
        </Suspense>
      ) : (
        <p className="text-muted-foreground">
          Please enter a title to search for
        </p>
      )}
    </div>
  );
}

async function SearchResults({ query }: { query: string }) {
  const allAnime = await getAllAnime();
  const results = allAnime.filter((anime) =>
    anime.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimeGrid
      animeList={results}
      emptyMessage={`No titles found matching "${query}"`}
    />
  );
}
