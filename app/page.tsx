"use client"

import { useMemo } from 'react'
import { AnimeSection } from '@/features/anime-section'
import { UpcomingAiringCarousel } from '@/features/anime-carousel'
import {
  TrendingAnimeQuery,
  PopularAnimeQuery,
  TopRatedAnimeQuery,
  SeasonalAnimeQuery,
} from '@/queries/media'
import {
  getCurrentSeason,
  getCurrentYear,
  getNextSeason,
  getNextSeasonYear,
} from '@/hooks/use-date'

export default function HomePage() {
  const dateValues = useMemo(() => ({
    currentSeason: getCurrentSeason(),
    currentYear: getCurrentYear(),
    nextSeason: getNextSeason(),
    nextSeasonYear: getNextSeasonYear(),
  }), []) 

  const { currentSeason, currentYear, nextSeason, nextSeasonYear } = dateValues

  return (
    <div className="min-h-screen max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-white">

      <UpcomingAiringCarousel />

      <AnimeSection
        title="Trending Now"
        query={TrendingAnimeQuery}
        variables={{ page: 1, perPage: 6 }}
        viewAllHref="/anime?sort=trending"
      />

      <AnimeSection
        title="Popular This Season"
        query={SeasonalAnimeQuery}
        variables={{ season: currentSeason, seasonYear: currentYear, page: 1, perPage: 6 }}
        viewAllHref={`/anime?sort=seasonal&season=${currentSeason}&year=${currentYear}`}
      />

      <AnimeSection
        title="Upcoming Next Season"
        query={SeasonalAnimeQuery}
        variables={{ season: nextSeason, seasonYear: nextSeasonYear, page: 1, perPage: 6 }}
        viewAllHref={`/anime?sort=seasonal&season=${nextSeason}&year=${nextSeasonYear}`}
      />

      <AnimeSection
        title="Top 100"
        query={TopRatedAnimeQuery}
        variables={{ page: 1, perPage: 6 }}
        viewAllHref="/anime?sort=top-rated"
        showRank={true}
      />

      <AnimeSection
        title="All Time Popular"
        query={PopularAnimeQuery}
        variables={{ page: 1, perPage: 6 }}
        viewAllHref="/anime?sort=popular"
      />
    </div>
  )
}
