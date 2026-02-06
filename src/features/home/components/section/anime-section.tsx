import { extractMediaList } from '@/lib/utils/anime-utils'
import { SectionView } from './section-view'
import { getCachedTrending, getCachedPopular, getCachedSeasonal, getCachedTopRated } from '@/lib/graphql/server-cache'
import { MediaSeason } from '@/lib/graphql/types/graphql'
import { connection } from 'next/server'
import { getCurrentSeason, getCurrentYear, getNextSeason, getNextSeasonYear } from '@/lib/utils'

type SectionType = 'trending' | 'popular' | 'seasonal' | 'top-rated' | 'upcoming'

type AnimeSectionServerProps = {
    type: SectionType
    title?: string
    viewAllHref?: string
    showRank?: boolean
    subtitle?: string
    season?: MediaSeason
    year?: number
    perPage?: number
    variant?: 'grid' | 'featured' | 'list' | 'compact'
}

async function fetchData(type: SectionType, season?: MediaSeason, year?: number, perPage: number = 6) {
    switch (type) {
        case 'trending':
            return getCachedTrending(perPage)
        case 'popular':
            return getCachedPopular(perPage)
        case 'seasonal':
            if (!season || !year) throw new Error('Season and year are required for seasonal section')
            return getCachedSeasonal(season, year, perPage)
        case 'top-rated':
            return getCachedTopRated(perPage)
        case 'upcoming':
            if (!season || !year) throw new Error('Season and year are required for upcoming section')
            return getCachedSeasonal(season, year, perPage)
        default:
            throw new Error(`Invalid section type: ${type}`)
    }
}

export async function AnimeSection({
    type,
    title: initialTitle,
    subtitle,
    viewAllHref,
    showRank = false,
    season: initialSeason,
    year: initialYear,
    perPage = 6,
    variant = 'grid'
}: AnimeSectionServerProps) {
    let season = initialSeason
    let year = initialYear
    let title = initialTitle

    // Handle dynamic sensing inside the Suspense boundary
    // Essential because the GraphQL rate limiter uses Date.now()
    await connection()

    if (type === 'seasonal' || type === 'upcoming') {
        if (type === 'seasonal') {
            season = season || getCurrentSeason()
            year = year || getCurrentYear()
            title = title || `${season} ${year}`
        } else if (type === 'upcoming') {
            season = season || getNextSeason()
            year = year || getNextSeasonYear()
            title = title || `${season} ${year}`
        }
    }

    const response = await fetchData(type, season, year, perPage)
    const animeList = extractMediaList(response.data)

    return (
        <SectionView
            data={animeList}
            title={title || 'Registry'}
            subtitle={subtitle}
            viewAllHref={viewAllHref}
            showRank={showRank}
            perPage={perPage}
            variant={variant}
        />
    )
}
