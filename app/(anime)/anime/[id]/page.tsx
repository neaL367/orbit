import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { AnimeDetailContent } from "@/features/anime/components/detail/anime-detail-content"
import { getCachedAnime } from "@/lib/graphql/data"
import { getAnimeTitle } from "@/lib/utils/anime-utils"
import { BASE_URL } from "@/lib/constants"
import type { Media } from "@/lib/graphql/types/graphql"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id: animeId } = await params
  const id = parseInt(animeId, 10)

  if (isNaN(id)) notFound()

  const result = await getCachedAnime(id)
  const anime = result.data?.Media as Media | undefined

  if (!anime) notFound()

  const title = getAnimeTitle(anime)
  const description = anime.description?.replace(/<[^>]*>/g, "").substring(0, 160)
  const image =
    anime.bannerImage || anime.coverImage?.extraLarge || anime.coverImage?.large || `${BASE_URL}/opengraph-image.png`

  return {
    title: `${title} — Registry`,
    description,
    alternates: {
      canonical: `/anime/${id}`,
    },
    openGraph: {
      title: `${title} — Registry`,
      description,
      url: `${BASE_URL}/anime/${id}`,
      images: [{ url: image }],
      type: "video.tv_show",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — Registry`,
      description,
      images: [image],
    },
  }
}

export default function AnimeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <AnimeDetailContent params={params} />
}
