import { extractMediaList } from '@/lib/utils/anime-utils'
import {
    getCachedTrending,
    getCachedPopular,
    getCachedSeasonal,
    getCachedTopRated,
    getCachedUpcomingAiring,
} from '@/lib/graphql/data'
import { MediaSeason } from '@/lib/graphql/types/graphql'
import { getCurrentSeason, getCurrentYear } from '@/lib/utils'
import { MediaSection } from './media-section'

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
            return getCachedUpcomingAiring(perPage)
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
    variant = 'grid',
}: AnimeSectionServerProps) {
    let season = initialSeason
    let year = initialYear
    let title = initialTitle

    // Calendar math uses request time; parent route should call `connection()` once (see app/page.tsx).
    if (type === 'seasonal') {
        season = season || getCurrentSeason()
        year = year || getCurrentYear()
        title = title || `${season} ${year}`
    } else if (type === 'upcoming') {
        title = title || 'On air now'
    }

    const response = await fetchData(type, season, year, perPage)
    const animeList = extractMediaList(response.data)

    return (
        <MediaSection
            data={animeList}
            title={title || 'Section'}
            subtitle={subtitle}
            variant={variant === 'compact' ? 'grid' : variant}
            viewAllHref={viewAllHref}
            showRank={showRank}
        />
    )
}
