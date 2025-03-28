import { Suspense } from "react";
import { Link } from "next-view-transitions";
import AnimeCard from "@/components/anime/anime-card";
import { LoadingAnimeGrid } from "@/components/loading-anime";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { MediaQueries } from "@/anilist/queries/media";
import { getCurrentSeason } from "@/anilist/utils/formatters";
import { AnimeMedia } from "@/anilist/modal/media";


export default async function Home() {
  const [trendingData, popularData, seasonalData, topRatedData] =
    await Promise.all([
      MediaQueries.getTrending({ page: 1, perPage: 6 }),
      MediaQueries.getPopular({ page: 1, perPage: 6 }),
      MediaQueries.getSeasonal({
        season: getCurrentSeason().season,
        year: getCurrentSeason().year,
        page: 1,
        perPage: 6,
      }),
      MediaQueries.getTopRated({ page: 1, perPage: 6 }),
    ]);

  const trending = trendingData?.data?.Page?.media || [];
  const popular = popularData?.data?.Page?.media || [];
  const seasonal = seasonalData?.data?.Page?.media || [];
  const topRated = topRatedData?.data?.Page?.media || [];
  const { season, year } = getCurrentSeason();

  return (
    <main className="mt-24 mb-24">
      {/* Trending Section - Second */}
      <section className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Trending Now</h2>
          <Link href="/trending">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 hover:cursor-pointer"
            >
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <Suspense fallback={<LoadingAnimeGrid count={6} />}>
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {trending.map((anime: AnimeMedia) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        </Suspense>
      </section>

      {/* Top 100 Anime Section - New */}
      <section className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Top 100 Anime</h2>
          <Link href="/top-rated">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 hover:cursor-pointer"
            >
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <Suspense fallback={<LoadingAnimeGrid count={6} />}>
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {topRated.map((anime: AnimeMedia, index: number) => (
              <div key={anime.id} className="relative">
                <div
                  className="absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center font-bold z-10 text-white shadow"
                  style={{
                    backgroundColor: anime.coverImage?.color ?? "#3b82f6",
                  }}
                >
                  {index + 1}
                </div>
                <AnimeCard key={anime.id} anime={anime} />
              </div>
            ))}
          </div>
        </Suspense>
      </section>

      {/* Popular Section - First */}
      <section className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">All-Time Popular</h2>
          <Link href="/all-time-popular">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 hover:cursor-pointer"
            >
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <Suspense fallback={<LoadingAnimeGrid count={6} />}>
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {popular.map((anime: AnimeMedia) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        </Suspense>
      </section>

      {/* Seasonal Section - Last */}
      <section className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {season.charAt(0) + season.slice(1).toLowerCase()} {year} Anime
          </h2>
          <Link href={`/seasonal?season=${season.toLowerCase()}&year=${year}`}>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 hover:cursor-pointer"
            >
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <Suspense fallback={<LoadingAnimeGrid count={6} />}>
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {seasonal.map((anime: AnimeMedia) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        </Suspense>
      </section>
    </main>
  );
}
