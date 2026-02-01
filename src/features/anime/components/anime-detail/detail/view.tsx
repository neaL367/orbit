import dynamic from 'next/dynamic'
import { Hero } from '../anime-detail-view/hero'
import { HeroContent } from '../anime-detail-view/hero-content'
import { Info } from '../anime-detail-view/info'
import { Synopsis } from '../anime-detail-view/synopsis'
import type { Media } from '@/lib/graphql/types/graphql'

const Trailer = dynamic(() => import('../anime-detail-view/trailer').then(mod => mod.Trailer), { ssr: true })
const Characters = dynamic(() => import('../anime-detail-view/characters').then(mod => mod.Characters), { ssr: true })
const Recommendations = dynamic(() => import('../anime-detail-view/recommendations').then(mod => mod.Recommendations), { ssr: true })
const Relations = dynamic(() => import('../anime-detail-view/relations').then(mod => mod.Relations), { ssr: true })
const StreamingEpisodes = dynamic(() => import('../anime-detail-view/streaming-episodes').then(mod => mod.StreamingEpisodes), { ssr: true })

type DetailViewProps = {
  data: Media
}

export function DetailView({ data }: DetailViewProps) {
  const recommendations = data?.recommendations?.nodes?.filter(Boolean) || []
  const relations = data?.relations?.edges?.filter(Boolean) || []
  const characters = data?.characters?.edges?.filter(Boolean) || []
  const streamingEpisodes = data?.streamingEpisodes?.filter(Boolean) || []
  const title = data?.title?.userPreferred || data?.title?.romaji || data?.title?.english || 'Unknown'

  return (
    <div className="min-h-screen bg-black text-white">
      <Hero anime={data} />

      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <HeroContent anime={data} />

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 mt-10">
          {/* Left Sidebar - Anime Details */}
          <aside className="w-full lg:w-[380px] shrink-0 space-y-6">
            <Info anime={data} />
          </aside>

          {/* Right Side - Main Content */}
          <main className="flex-1 space-y-10">
            <Synopsis description={data.description} />
            <Trailer trailer={data.trailer} title={title} />
            <StreamingEpisodes streamingEpisodes={streamingEpisodes} />
            <Characters characters={characters} />
            <Recommendations recommendations={recommendations} />
            <Relations relations={relations} />
          </main>
        </div>
      </div>
    </div>
  )
}

