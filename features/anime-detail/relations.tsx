import { AnimeCard } from "@/features/shared"
import type { Media } from "@/graphql/graphql"

type RelationsProps = {
  relations: Array<{
    node?:
      | ({
          id: number
          type?: string | null
        } & Media)
      | null
  } | null>
}

export function Relations({ relations }: RelationsProps) {
  const validRelations = relations
    .filter((rel) => rel?.node && rel.node.type === "ANIME")
    .slice(0, 10)
    .map((rel) => rel!.node!)

  if (validRelations.length === 0) return null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">Related Anime</h2>
        <p className="text-sm text-zinc-400">Sequels, prequels, and spin-offs</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
        {validRelations.map((relAnime) => (
          <AnimeCard key={relAnime.id} anime={relAnime} />
        ))}
      </div>
    </div>
  )
}

