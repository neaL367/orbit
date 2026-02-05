import { extractMediaList } from '@/lib/anime-utils'
import { SectionView } from './section-view'
import { getCachedTrending, getCachedPopular, getCachedSeasonal, getCachedTopRated } from '@/lib/graphql/server-cache'
import { MediaSeason } from '@/lib/graphql/types/graphql'

type SectionType = 'trending' | 'popular' | 'seasonal' | 'top-rated'

type AnimeSectionServerProps = {
    type: SectionType
    title: string
    viewAllHref?: string
    showRank?: boolean
    subtitle?: string
    season?: MediaSeason
    year?: number
    perPage?: number
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
        default:
            throw new Error(`Invalid section type: ${type}`)
    }
}

export async function AnimeSection({
    type,
    title,
    subtitle,
    viewAllHref,
    showRank = false,
    season,
    year,
    perPage = 6
}: AnimeSectionServerProps) {
    const response = await fetchData(type, season, year, perPage)
    const animeList = extractMediaList(response.data)

    return (
        <SectionView
            data={animeList}
            title={title}
            subtitle={subtitle}
            viewAllHref={viewAllHref}
            showRank={showRank}
            perPage={perPage}
        />
    )
}
