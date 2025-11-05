import { AnimeCard } from "@/features/shared"
import type { Media } from "@/graphql/graphql"

type AnimeDetailRecommendationsProps = {
  recommendations: Array<{
    mediaRecommendation?: Media | null
  } | null>
}

export function AnimeDetailRecommendations({ recommendations }: AnimeDetailRecommendationsProps) {
  if (recommendations.length === 0) return null

  return (
    <div className="mt-16 space-y-8">
      <div>
        <h2 className="text-3xl md:text-4xl font-bold mb-3">Recommended For You</h2>
        <p className="text-zinc-400 text-sm md:text-base">Similar anime you might enjoy</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {recommendations.slice(0, 10).map((rec) => {
          if (!rec) return null
          const recAnime = rec.mediaRecommendation
          return recAnime ? <AnimeCard key={recAnime.id} anime={recAnime} /> : null
        })}
      </div>
    </div>
  )
}
