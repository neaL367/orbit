'use client'

import { Suspense, useMemo } from 'react'
import dynamic from 'next/dynamic'
import {
  getCurrentSeason,
  getCurrentYear,
  getNextSeason,
  getNextSeasonYear,
} from '@/lib/utils'

const UpcomingAiringCarousel = dynamic(
  () => import('@/features/home/components/hero-carousel').then((mod) => ({ default: mod.UpcomingAiringCarousel })),
  { ssr: true }
)

const AnimeSection = dynamic(
  () => import('./section').then((mod) => ({ default: mod.AnimeSection })),
  { ssr: true }
)

import {
  TrendingAnimeQuery,
  PopularAnimeQuery,
  TopRatedAnimeQuery,
  SeasonalAnimeQuery,
} from '@/lib/graphql/queries'

type HomeProps = {
  trendingInitial?: unknown
  popularInitial?: unknown
  seasonalInitial?: unknown
  upcomingInitial?: unknown
  topRatedInitial?: unknown
}

function HomeContent({
  trendingInitial,
  popularInitial,
  seasonalInitial,
  upcomingInitial,
  topRatedInitial
}: HomeProps) {
  const dateValues = useMemo(() => ({
    currentSeason: getCurrentSeason(),
    currentYear: getCurrentYear(),
    nextSeason: getNextSeason(),
    nextSeasonYear: getNextSeasonYear(),
  }), [])

  const { currentSeason, currentYear, nextSeason, nextSeasonYear } = dateValues

  return (
    <div className="min-h-screen max-w-[1680px] space-y-12 mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-white">
      <UpcomingAiringCarousel />

      <AnimeSection
        title="Trending Now"
        query={TrendingAnimeQuery}
        variables={{ page: 1, perPage: 6 }}
        viewAllHref="/anime?sort=trending"
        initialData={trendingInitial}
      />

      <AnimeSection
        title="Popular This Season"
        query={SeasonalAnimeQuery}
        variables={{ season: currentSeason, seasonYear: currentYear, page: 1, perPage: 6 }}
        viewAllHref={`/anime?sort=seasonal&season=${currentSeason}&year=${currentYear}`}
        initialData={seasonalInitial}
      />

      <AnimeSection
        title="Upcoming Next Season"
        query={SeasonalAnimeQuery}
        variables={{ season: nextSeason, seasonYear: nextSeasonYear, page: 1, perPage: 6 }}
        viewAllHref={`/anime?sort=seasonal&season=${nextSeason}&year=${nextSeasonYear}`}
        initialData={upcomingInitial}
      />

      <AnimeSection
        title="Top 100"
        query={TopRatedAnimeQuery}
        variables={{ page: 1, perPage: 6 }}
        viewAllHref="/anime?sort=top-rated"
        showRank={true}
        initialData={topRatedInitial}
      />

      <AnimeSection
        title="All Time Popular"
        query={PopularAnimeQuery}
        variables={{ page: 1, perPage: 6 }}
        viewAllHref="/anime?sort=popular"
        initialData={popularInitial}
      />
    </div>
  )
}

export function Home(props: HomeProps) {
  return (
    <Suspense>
      <HomeContent {...props} />
    </Suspense>
  )
}
