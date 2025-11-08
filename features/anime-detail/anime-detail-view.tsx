import {
  Hero,
  HeroContent,
  Info,
  Synopsis,
  Recommendations,
  Relations,
  Trailer,
  Characters,
  StreamingEpisodes,
} from '@/features/anime-detail'
import type { Media } from '@/graphql/graphql'

type AnimeDetailViewProps = {
  data: Media
}

export function AnimeDetailView({ data }: AnimeDetailViewProps) {
  const recommendations = data?.recommendations?.nodes?.filter(Boolean) || []
  const relations = data?.relations?.edges?.filter(Boolean) || []
  const characters = data?.characters?.edges?.filter(Boolean) || []
  const streamingEpisodes = data?.streamingEpisodes?.filter(Boolean) || []
  const title = data?.title?.userPreferred || data?.title?.romaji || data?.title?.english || 'Unknown'

  return (
    <div className="min-h-screen bg-black text-white">
      <Hero anime={data} />

      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12 lg:py-16">
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

