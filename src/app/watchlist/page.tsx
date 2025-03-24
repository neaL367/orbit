import { AnimeGrid } from "@/components/anime-grid";

export default async function WatchlistPage() {
  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-3xl font-bold">My Watchlist</h1>

      <AnimeGrid
        emptyMessage="Your watchlist is empty. Add anime to your watchlist to see them here."
        animeList={[]}
      />
    </div>
  );
}
