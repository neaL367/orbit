import { Suspense } from "react"
import Link from "next/link"
import { getTrendingAnime, getPopularAnime, getSeasonalAnime } from "@/lib/anilist"
import AnimeCard from "@/components/anime-card"
import { LoadingAnimeGrid } from "@/components/loading-anime"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { getCurrentSeason } from "@/lib/utils"

export default async function Home() {
  // Fetch data in parallel
  const [trendingData, popularData, seasonalData] = await Promise.all([
    getTrendingAnime(1, 12),
    getPopularAnime(1, 12),
    getSeasonalAnime(getCurrentSeason().season, getCurrentSeason().year, 1, 12),
  ])

  const trending = trendingData?.data?.Page?.media || []
  const popular = popularData?.data?.Page?.media || []
  const seasonal = seasonalData?.data?.Page?.media || []
  const { season, year } = getCurrentSeason()

  return (
    <div className="container py-8">
      <section className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Trending Now</h2>
          <Link href="/trending">
            <Button variant="ghost" size="sm" className="gap-1">
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <Suspense fallback={<LoadingAnimeGrid count={6} />}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {trending.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        </Suspense>
      </section>

      <section className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {season.charAt(0) + season.slice(1).toLowerCase()} {year} Anime
          </h2>
          <Link href={`/seasonal?season=${season.toLowerCase()}&year=${year}`}>
            <Button variant="ghost" size="sm" className="gap-1">
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <Suspense fallback={<LoadingAnimeGrid count={6} />}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {seasonal.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        </Suspense>
      </section>

      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">All-Time Popular</h2>
          <Link href="/popular">
            <Button variant="ghost" size="sm" className="gap-1">
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <Suspense fallback={<LoadingAnimeGrid count={6} />}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {popular.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        </Suspense>
      </section>
    </div>
  )
}

