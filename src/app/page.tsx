import { Suspense } from "react";
import Link from "next/link";
import { CombinedQueries } from "@/anilist/queries/combined";
import { LoadingAnimeGrid } from "@/components/loading-anime";
import AnimeCard from "@/components/anime/anime-card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

export default async function HomePage() {
  // Fetch all homepage data in a single GraphQL query
  const data = await CombinedQueries.getHomepageData(6);

  const trendingAnime = data?.data?.trending?.media || [];
  const popularAnime = data?.data?.popular?.media || [];
  const topRatedAnime = data?.data?.topRated?.media || [];
  const upcomingPremieres = data?.data?.upcoming?.airingSchedules || [];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="py-8">
        <h1 className="text-4xl font-bold mb-4">Discover Anime</h1>
        <p className="text-muted-foreground text-lg mb-6">
          Explore the latest trending, popular, and top-rated anime all in one
          place.
        </p>
      </section>

      {/* Trending Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Trending Now</h2>
          <Link href="/trending">
            <Button variant="ghost" className="gap-1 hover:cursor-pointer">
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <Suspense fallback={<LoadingAnimeGrid count={6} />}>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {trendingAnime.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        </Suspense>
      </section>

      {/* Popular Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Most Popular</h2>
          <Link href="/all-time-popular">
            <Button variant="ghost" className="gap-1 hover:cursor-pointer">
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <Suspense fallback={<LoadingAnimeGrid count={6} />}>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {popularAnime.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        </Suspense>
      </section>

      {/* Top Rated Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Top Rated</h2>
          <Link href="/top-rated">
            <Button variant="ghost" className="gap-1 hover:cursor-pointer">
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <Suspense fallback={<LoadingAnimeGrid count={6} />}>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {topRatedAnime.map((anime, index) => (
              <div key={anime.id} className="relative">
                <div
                  className="absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center font-bold z-10 text-white shadow"
                  style={{
                    backgroundColor: anime.coverImage?.color ?? "#3b82f6",
                  }}
                >
                  {index + 1}
                </div>
                <AnimeCard anime={anime} />
              </div>
            ))}
          </div>
        </Suspense>
      </section>

      {/* Upcoming Premieres */}
      <section className="pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Upcoming Premieres</h2>
          <Link href="/schedule">
            <Button variant="ghost" className="gap-1 hover:cursor-pointer">
              View Schedule <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <Suspense fallback={<LoadingAnimeGrid count={6} />}>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {upcomingPremieres.map((schedule) => (
              <AnimeCard
                key={schedule.id}
                anime={schedule.media}
                showAiringBadge={true}
              />
            ))}
          </div>
        </Suspense>
      </section>
    </div>
  );
}
