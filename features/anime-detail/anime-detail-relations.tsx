import { AnimeCard } from "@/features/shared/anime-card"
import type { Media } from "@/graphql/graphql"

type AnimeDetailRelationsProps = {
  relations: Array<{
    node?:
      | ({
          id: number
          type?: string | null
        } & Media)
      | null
  } | null>
}

export function AnimeDetailRelations({ relations }: AnimeDetailRelationsProps) {
  if (relations.length === 0) return null

  return (
    <div className="mt-16 space-y-8">
      <div>
        <h2 className="text-3xl md:text-4xl font-bold mb-3">Related Anime</h2>
        <p className="text-zinc-400 text-sm md:text-base">Sequels, prequels, and spin-offs</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {relations.slice(0, 10).map((rel) => {
          if (!rel || !rel.node) return null
          const relAnime = rel.node
          return relAnime && relAnime.type === "ANIME" ? <AnimeCard key={relAnime.id} anime={relAnime} /> : null
        })}
      </div>
    </div>
  )
}
