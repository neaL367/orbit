import { Anime } from '@/types'
import { Redis } from '@upstash/redis'

// Initialize Redis client using the provided environment variables
export const redis = new Redis({
  url: process.env.KV_REST_API_URL || '',
  token: process.env.KV_REST_API_TOKEN || '',
})

// Database functions
export async function getAnimeById(id: string): Promise<Anime | null> {
  try {
    const anime = await redis.hgetall(`anime:${id}`)
    if (!anime || Object.keys(anime).length === 0) return null
    
    // Convert genres from string to array
    if (typeof anime.genres === 'string') {
      anime.genres = anime.genres
    }
    
    return anime as unknown as Anime
  } catch (error) {
    console.error('Error fetching anime:', error)
    return null
  }
}

export async function getAllAnime(): Promise<Anime[]> {
  try {
    const animeIds = await redis.smembers('animes')
    // console.log('Anime IDs:', animeIds)  // Log the IDs fetched
    if (!animeIds.length) return []
    
    const animeList = await Promise.all(
      animeIds.map(id => getAnimeById(id))
    )
    
    // console.log('Anime List:', animeList)  // Log the fetched anime
    return animeList.filter(Boolean) as Anime[]
  } catch (error) {
    console.error('Error fetching all anime:', error)
    return []
  }
}

export async function getAnimeByGenre(genre: string): Promise<Anime[]> {
  try {
    const animeIds = await redis.smembers(`genre:${genre}`)
    if (!animeIds.length) return []
    
    const animeList = await Promise.all(
      animeIds.map(id => getAnimeById(id))
    )
    
    return animeList.filter(Boolean) as Anime[]
  } catch (error) {
    console.error(`Error fetching anime by genre ${genre}:`, error)
    return []
  }
}

export async function getSchedule(day?: string): Promise<Anime[]> {
  try {
    const today = day || getDayOfWeek()
    const scheduleIds = await redis.smembers(`schedule:${today.toLowerCase()}`)
    
    if (!scheduleIds.length) return []
    
    const animeList = await Promise.all(
      scheduleIds.map(id => getAnimeById(id))
    )
    
    return animeList.filter(Boolean) as Anime[]
  } catch (error) {
    console.error('Error fetching schedule:', error)
    return []
  }
}

export async function searchAnime(query: string): Promise<Anime[]> {
  try {
    const allAnime = await getAllAnime()
    return allAnime.filter(anime => 
      anime.title.toLowerCase().includes(query.toLowerCase()) ||
      anime.description.toLowerCase().includes(query.toLowerCase()) ||
      anime.genres.some(genre => genre.toLowerCase().includes(query.toLowerCase()))
    )
  } catch (error) {
    console.error('Error searching anime:', error)
    return []
  }
}


// Helper functions
export function getDayOfWeek(): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[new Date().getDay()]
}