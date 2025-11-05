"use client"

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
  const currentSeason = getCurrentSeason()
  const currentYear = getCurrentYear()
  const nextSeason = getNextSeason()
  const nextSeasonYear = getNextSeasonYear()

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <UpcomingAiringCarousel />

        <AnimeSection
          title="Trending Now"
          query={TrendingAnimeQuery}
          variables={{ page: 1, perPage: 5 }}
          viewAllHref="/anime?sort=trending"
        />

        <AnimeSection
          title="Popular This Season"
          query={SeasonalAnimeQuery}
          variables={{ season: currentSeason, seasonYear: currentYear, page: 1, perPage: 5 }}
          viewAllHref={`/anime?sort=seasonal&season=${currentSeason}&year=${currentYear}`}
        />

        <AnimeSection
          title="Upcoming Next Season"
          query={SeasonalAnimeQuery}
          variables={{ season: nextSeason, seasonYear: nextSeasonYear, page: 1, perPage: 5 }}
          viewAllHref={`/anime?sort=seasonal&season=${nextSeason}&year=${nextSeasonYear}`}
        />

        <AnimeSection
          title="Top 100"
          query={TopRatedAnimeQuery}
          variables={{ page: 1, perPage: 5 }}
          viewAllHref="/anime?sort=top-rated"
        />

        <AnimeSection
          title="All Time Popular"
          query={PopularAnimeQuery}
          variables={{ page: 1, perPage: 5 }}
          viewAllHref="/anime?sort=popular"
        />
      </div>
    </div>
  )
}
