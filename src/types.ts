export interface Anime {
    id: string
    title: string
    description: string
    genres: string[]
    coverImage: string
    releaseDate: string
    airingDay?: string // Day of the week (Monday-Sunday)
    airingTime?: string // Time in 24h format
    season: string
    status: 'airing' | 'completed' | 'upcoming'
    episodeCount: number
    rating: number
}
