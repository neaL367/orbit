import { AnimeCard } from "@/features/shared"
import type { Media } from "@/graphql/graphql"

type RecommendationsProps = {
  recommendations: Array<{
    mediaRecommendation?: Media | null
  } | null>
}

export function Recommendations({ recommendations }: RecommendationsProps) {
  if (recommendations.length === 0) return null

  const validRecommendations = recommendations
    .filter((rec) => rec?.mediaRecommendation)
    .slice(0, 10)
    .map((rec) => rec!.mediaRecommendation!)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">Recommended For You</h2>
        <p className="text-sm text-zinc-400">Similar anime you might enjoy</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
        {validRecommendations.map((recAnime) => (
          <AnimeCard key={recAnime.id} anime={recAnime} />
        ))}
      </div>
    </div>
  )
}

