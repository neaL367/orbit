import { getScheduleAnime } from '@/lib/graphql/data'
import { NextAiringClient } from './next-airing-client'

interface NextAiringProps {
    className?: string
}

export async function NextAiring({ className }: NextAiringProps) {
    const response = await getScheduleAnime(1, 5)
    
    if (!response || !response.data) {
        return null
    }

    return (
        <NextAiringClient 
            className={className} 
            data={response.data} 
        />
    )
}
