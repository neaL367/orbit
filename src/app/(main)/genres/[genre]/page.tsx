import { Suspense } from "react"
import { notFound } from "next/navigation"
import { InfiniteAnimeGrid } from "@/components/infinite-anime-grid"
import { LoadingAnimeGrid } from "@/components/loading-anime"
import { GenreQueries } from "@/anilist/queries/genre"
import { Navigation } from "@/components/navigation"
import { fetchMoreGenreAnime } from "@/anilist/actions/anime-actions"

interface GenrePageProps {
  params: Promise<{
    genre: string
  }>
  searchParams: Promise<{
    page?: string
  }>
}

export default async function GenrePage(props: GenrePageProps) {
  const searchParams = await props.searchParams
  const params = await props.params
  const genre = decodeURIComponent(params.genre)
  const page = Number.parseInt(searchParams.page || "1", 10)
  const perPage = 18

  const data = await GenreQueries.getByGenre({ genre, page, perPage })
  const animeList = data?.data?.Page?.media || []

  if (animeList.length === 0 && page === 1) {
    notFound()
  }

  const pageInfo = data?.data?.Page?.pageInfo || {
    currentPage: 1,
    lastPage: 1,
    hasNextPage: false,
    total: 0,
  }

  // Create a server action wrapper that captures the genre
  async function loadMoreAnimeForGenre(page: number) {
    "use server"
    return fetchMoreGenreAnime(genre, page)
  }

  return (
    <div className="">
      <Navigation />

      <h1 className="mb-2 text-3xl font-bold">{genre} Anime</h1>
      <p className="mb-8 text-muted-foreground">Found {pageInfo.total || 0} anime in this genre</p>

      <Suspense fallback={<LoadingAnimeGrid count={perPage} />}>
        <InfiniteAnimeGrid
          initialAnime={animeList}
          initialHasNextPage={pageInfo.hasNextPage}
          loadMoreFunction={loadMoreAnimeForGenre}
          initialPage={page}
        />
      </Suspense>
    </div>
  )
}

