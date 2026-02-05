import { extractMediaList } from '@/lib/anime-utils'
import { getCachedUpcomingAiring } from '@/lib/graphql/server-cache'
import { CarouselView } from './carousel-view'

type UpcomingCarouselServerProps = {
    hideViewAll?: boolean
    className?: string
}

export async function UpcomingAiringCarousel({
    className,
}: UpcomingCarouselServerProps) {
    const response = await getCachedUpcomingAiring(10)
    const allMedia = extractMediaList(response.data)

    return (
        <CarouselView
            data={allMedia}
            className={className}
        />
    )
}
