import { Home } from '@/features/home/components/home'
import {
  getCachedTrending,
  getCachedPopular,
  getCachedSeasonal,
  getCachedTopRated
} from '@/lib/graphql/server-cache'
import { cookies } from 'next/headers'
import {
  getCurrentSeason,
  getCurrentYear,
  getNextSeason,
  getNextSeasonYear
} from '@/lib/utils'



export default async function HomePage() {
  await cookies()
  const currentSeason = getCurrentSeason()
  const currentYear = getCurrentYear()
  const nextSeason = getNextSeason()
  const nextSeasonYear = getNextSeasonYear()

  const [trending, popular, seasonal, upcoming, topRated] = await Promise.all([
    getCachedTrending(),
    getCachedPopular(),
    getCachedSeasonal(currentSeason, currentYear),
    getCachedSeasonal(nextSeason, nextSeasonYear),
    getCachedTopRated()
  ])

  return (
    <Home
      trendingInitial={trending.data}
      popularInitial={popular.data}
      seasonalInitial={seasonal.data}
      upcomingInitial={upcoming.data}
      topRatedInitial={topRated.data}
    />
  )
}
