import { Suspense } from "react";
import { Link } from "next-view-transitions";
import AnimeCard from "@/components/anime-card";
import { LoadingAnimeGrid } from "@/components/loading-anime";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { getCurrentSeason } from "@/lib/utils";
import AnilistQueries from "@/lib/anilist";

export default async function Home() {
  const [trendingData, popularData, seasonalData] = await Promise.all([
    AnilistQueries.getTrending({ page: 1, perPage: 12 }),
    AnilistQueries.getPopular({ page: 1, perPage: 12 }),
    AnilistQueries.getSeasonal({
      season: getCurrentSeason().season,
      year: getCurrentSeason().year,
      page: 1,
      perPage: 12,
    }),
  ]);

  const trending = trendingData?.data?.Page?.media || [];
  const popular = popularData?.data?.Page?.media || [];
  const seasonal = seasonalData?.data?.Page?.media || [];
  const { season, year } = getCurrentSeason();

  return (
    <div className="py-8">
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
            {trending.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        </Suspense>
      </section>

      <section className="mb-12">
        <div className="mb-6 mx-3.5 flex items-center justify-between">
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
          <div className="grid mx-3.5 grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {seasonal.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        </Suspense>
      </section>

      <section className="mb-12">
        <div className="mb-6 mx-3.5 flex items-center justify-between">
          <h2 className="text-2xl font-bold">All-Time Popular</h2>
          <Link href="/popular">
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
          <div className="grid mx-3.5 grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {popular.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        </Suspense>
      </section>
    </div>
  );
}
