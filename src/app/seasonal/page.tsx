import { Suspense } from "react"
import { getSeasonalAnime } from "@/lib/anilist"
import AnimeCard from "@/components/anime-card"
import Pagination from "@/components/pagination"
import { LoadingAnimeGrid } from "@/components/loading-anime"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCurrentSeason } from "@/lib/utils"

interface SeasonalPageProps {
  searchParams: Promise<{
    season?: string
    year?: string
    page?: string
  }>
}

export default async function SeasonalPage( props: SeasonalPageProps) {
  const searchParams = await props.searchParams
  const currentSeason = getCurrentSeason()
  const season = (searchParams.season || currentSeason.season).toUpperCase()
  const year = Number.parseInt(searchParams.year || currentSeason.year.toString(), 10)
  const page = Number.parseInt(searchParams.page || "1", 10)
  const perPage = 24

  const data = await getSeasonalAnime(season, year, page, perPage)
  const animeList = data?.data?.Page?.media || []
  const pageInfo = data?.data?.Page?.pageInfo || {
    currentPage: 1,
    lastPage: 1,
    hasNextPage: false,
    total: 0,
  }

  // Generate years for dropdown (5 years back, 2 years forward)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 8 }, (_, i) => currentYear - 5 + i)

  // Format season for display
  const formattedSeason = season.charAt(0) + season.slice(1).toLowerCase()

  return (
    <div className="container py-8">
      <h1 className="mb-2 text-3xl font-bold">
        {formattedSeason} {year} Anime
      </h1>
      <p className="mb-8 text-muted-foreground">Found {pageInfo.total || 0} anime this season</p>

      <div className="mb-8 flex flex-wrap gap-4">
        <div>
          <h3 className="mb-2 text-sm font-medium">Season</h3>
          <Select defaultValue={season.toLowerCase()}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select season" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="winter">Winter</SelectItem>
              <SelectItem value="spring">Spring</SelectItem>
              <SelectItem value="summer">Summer</SelectItem>
              <SelectItem value="fall">Fall</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium">Year</h3>
          <Select defaultValue={year.toString()}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

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
  )
}

