import { AnimeCard } from "@/components/anime-card"
import { Anime } from "@/types"

interface AnimeGridProps {
  animeList: Anime[]
  emptyMessage?: string
}

export function AnimeGrid({ animeList, emptyMessage = "No anime found" }: AnimeGridProps) {
  if (!animeList.length) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {animeList.map((anime) => (
        <AnimeCard key={anime.id} anime={anime} />
      ))}
    </div>
  )
}

