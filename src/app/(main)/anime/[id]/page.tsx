import { Suspense } from "react"
import { notFound } from "next/navigation"
import { LoadingAnimeDetails } from "@/components/loading-anime"
import { AnimeDetails } from "@/components/anime/anime-details"
import { GenreQueries } from "@/anilist/queries/genre"

export const experimental_ppr = true

interface AnimePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AnimePage(props: AnimePageProps) {
  const params = await props.params
  const id = Number.parseInt(params.id, 10)

  if (isNaN(id)) {
    notFound()
  }

  const data = await GenreQueries.getById(id)
  const anime = data?.data?.Media

  if (!anime) {
    notFound()
  }

  return (
    <Suspense fallback={<LoadingAnimeDetails />}>
      <AnimeDetails anime={anime} />
    </Suspense>
  )
}

