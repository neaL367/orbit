import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getCachedAnime } from '@/lib/graphql/server-cache'
import { getAnimeTitle } from '@/lib/utils/anime-utils'
import type { Media } from '@/lib/graphql/types/graphql'
import { IndexSectionHeader } from '@/components/shared/index-section-header'
import { ErrorState } from '@/components/shared'
import { AnimeEpisodes } from "@/features/anime/components/anime-episodes"
import { AnimeTrailer } from "@/features/anime/components/anime-trailer"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id: animeId } = await params
    const id = parseInt(animeId, 10)

    if (isNaN(id)) return { title: '404_NOT_FOUND' }

    const result = await getCachedAnime(id)
    const anime = result.data?.Media as Media | undefined

    if (!anime) return { title: '404_NOT_FOUND' }

    const title = getAnimeTitle(anime)
    return {
        title: `${title} — Registry`,
        description: anime.description?.replace(/<[^>]*>/g, '').substring(0, 160),
    }
}

async function AnimeDetailContent({ id }: { id: number }) {
    const result = await getCachedAnime(id)
    const anime = result.data?.Media as Media | undefined

    if (!anime) return <ErrorState message="Entry_Not_Found" />

    const title = getAnimeTitle(anime)

    return (
        <div className="space-y-16 reveal">
            {/* Banner Section */}
            {anime.bannerImage && (
                <div className="relative w-full h-[25vh] md:h-[40vh] overflow-hidden border border-border/50 bg-secondary/5 group select-none">
                    <img
                        src={anime.bannerImage}
                        alt="Banner"
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-1000 scale-105"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

                    {/* Tech Grid Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

                    {/* Metadata Badge */}
                    <div className="absolute bottom-4 right-4 font-mono text-[9px] uppercase tracking-widest text-muted-foreground/30 border border-border/20 px-3 py-1 bg-background/80 backdrop-blur-md">
                        VISUAL_DATA_LAYER_01
                    </div>
                </div>
            )}

            {/* Editorial Header */}
            <header className="flex flex-col md:flex-row gap-12 border-b border-border pb-16">
                <div className="w-full md:w-80 shrink-0">
                    <div className="aspect-[2/3] border border-border overflow-hidden">
                        <img
                            src={anime.coverImage?.extraLarge || ''}
                            alt={title}
                            className="w-full h-full object-cover transition-all duration-700"
                        />
                    </div>
                </div>

                <div className="flex-1 space-y-8">
                    <div className="space-y-4">
                        <div className="bg-foreground text-background px-3 py-1 font-mono text-[10px] uppercase w-fit index-cut-tr">
                            ID: {anime.id} {'//'} {anime.status}
                        </div>
                        <h1 className="text-3xl sm:text-5xl md:text-7xl font-mono uppercase tracking-tighter leading-none">
                            {title}
                        </h1>
                        <div className="flex flex-wrap gap-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground mr-8">
                            <span>{anime.format}</span>
                            <span>{anime.startDate?.year}</span>
                            <span>{anime.episodes} EP</span>
                            <span>{anime.season}</span>
                        </div>
                    </div>

                    <div
                        className="prose prose-invert prose-sm max-w-2xl font-sans text-muted-foreground leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: anime.description || 'No_Data_Available' }}
                    />

                    <div className="flex flex-wrap gap-2 pt-4">
                        {anime.genres?.map(genre => (
                            <span key={genre} className="px-3 py-1 border border-border font-mono text-[9px] uppercase text-muted-foreground hover:bg-white/5 cursor-default transition-colors">
                                {genre}
                            </span>
                        ))}
                    </div>
                </div>
            </header>

            {/* Trailer Section - Full Width on Mobile, Integrated on Desktop */}
            {anime.trailer?.id && anime.trailer?.site === 'youtube' && (
                <section className="mb-12">
                    <IndexSectionHeader title="Visual_Preview" subtitle="Trailer_Link" />
                    <AnimeTrailer
                        videoId={anime.trailer.id}
                        thumbnail={anime.trailer.thumbnail || anime.bannerImage || anime.coverImage?.extraLarge}
                    />
                </section>
            )}

            {/* Grid Layout for Meta */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-1 space-y-12">
                    <section className="space-y-6">
                        <IndexSectionHeader title="Technical_Data" />
                        <div className="space-y-4 font-mono text-[10px] uppercase tracking-wider">
                            <div className="flex justify-between border-b border-border pb-2">
                                <span className="text-muted-foreground">Average_Score</span>
                                <span>{anime.averageScore ? `${anime.averageScore}%` : 'N/A'}</span>
                            </div>
                            <div className="flex justify-between border-b border-border pb-2">
                                <span className="text-muted-foreground">Popularity</span>
                                <span>{anime.popularity?.toLocaleString() || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between border-b border-border pb-2">
                                <span className="text-muted-foreground">Source</span>
                                <span>{anime.source?.replace(/_/g, " ") || 'Unknown'}</span>
                            </div>
                            <div className="flex justify-between border-b border-border pb-2">
                                <span className="text-muted-foreground">Studio</span>
                                <span>{anime.studios?.nodes?.[0]?.name || 'Unknown'}</span>
                            </div>
                        </div>
                    </section>

                    {/* Streaming Episodes Section */}
                    <AnimeEpisodes episodes={anime.streamingEpisodes || []} />

                    {/* Relations Section */}
                    {anime.relations?.edges && anime.relations.edges.length > 0 && (() => {
                        const nonAdultRelations = anime.relations.edges.filter(edge =>
                            edge?.node &&
                            edge.node.type === 'ANIME' &&
                            !edge.node.isAdult
                        );

                        if (nonAdultRelations.length === 0) return null;

                        return (
                            <section className="space-y-6">
                                <IndexSectionHeader title="Relations" />
                                <div className="flex flex-col gap-3">
                                    {nonAdultRelations.map(edge => {
                                        if (!edge?.node) return null;
                                        return (
                                            <a
                                                key={edge.node.id}
                                                href={`/anime/${edge.node.id}`}
                                                className="block p-3 border border-border hover:border-foreground hover:bg-white/5 transition-all group"
                                            >
                                                <span className="font-mono text-[9px] uppercase block text-muted-foreground mb-1 group-hover:text-primary transition-colors">
                                                    {edge.relationType?.replace(/_/g, ' ')}
                                                </span>
                                                <span className="font-mono text-[11px] font-bold uppercase block truncate text-foreground group-hover:underline decoration-1 underline-offset-4">
                                                    {getAnimeTitle(edge.node)}
                                                </span>
                                            </a>
                                        )
                                    })}
                                </div>
                            </section>
                        );
                    })()}
                </div>

                <div className="lg:col-span-2 space-y-16">
                    {/* Characters Section */}
                    {anime.characters?.edges && anime.characters.edges.length > 0 && (
                        <section className="space-y-8">
                            <IndexSectionHeader title="Cast_Registry" subtitle={`Index_Size: ${anime.characters?.edges?.length || 0}`} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                {anime.characters.edges.slice(0, 8).map(edge => {
                                    if (!edge?.node) return null;
                                    const voiceActor = edge.voiceActors?.[0];

                                    return (
                                        <div key={edge.node.id} className="flex h-28 border border-border/50 hover:border-border transition-colors group bg-secondary/10 hover:bg-secondary/30">
                                            {/* Character Image */}
                                            <div className="w-20 bg-secondary shrink-0 overflow-hidden relative border-r border-border/30">
                                                <img
                                                    src={edge.node.image?.large || ''}
                                                    alt={edge.node.name?.full || ''}
                                                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                                                />
                                            </div>

                                            <div className="flex-1 flex flex-col justify-center px-4 overflow-hidden">
                                                <div className="font-mono text-[12px] font-bold uppercase truncate text-foreground group-hover:text-primary transition-colors">
                                                    {edge.node.name?.full}
                                                </div>
                                                <div className="font-mono text-[10px] uppercase text-muted-foreground truncate">
                                                    {edge.role}
                                                </div>
                                            </div>

                                            {/* Voice Actor */}
                                            {voiceActor && (
                                                <div className="flex flex-col items-end justify-center px-4 w-1/3 border-l border-border/30 bg-background/50">
                                                    <div className="text-right w-full">
                                                        <div className="font-mono text-[10px] font-bold uppercase truncate text-foreground">
                                                            {voiceActor.name?.full}
                                                        </div>
                                                        <div className="font-mono text-[9px] uppercase text-muted-foreground/80 truncate">
                                                            {voiceActor.languageV2}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Voice Actor Image */}
                                            {voiceActor && (
                                                <div className="w-20 bg-secondary shrink-0 overflow-hidden relative border-l border-border/30 transition-all">
                                                    <img
                                                        src={voiceActor.image?.medium || ''}
                                                        alt={voiceActor.name?.full || ''}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </section>
                    )}

                    {/* Recommendations Section */}
                    {anime.recommendations?.nodes && anime.recommendations.nodes.length > 0 && (() => {
                        const nonAdultRecommendations = anime.recommendations.nodes.filter(node =>
                            node?.mediaRecommendation && !node.mediaRecommendation.isAdult
                        );

                        if (nonAdultRecommendations.length === 0) return null;

                        return (
                            <section className="space-y-8">
                                <IndexSectionHeader title="System_Recommendations" />
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {nonAdultRecommendations.slice(0, 4).map(node => {
                                        const recAnime = node?.mediaRecommendation;
                                        if (!recAnime) return null;

                                        return (
                                            <a key={recAnime.id} href={`/anime/${recAnime.id}`} className="group space-y-2 block">
                                                <div className="aspect-[2/3] border border-border overflow-hidden relative">
                                                    <img
                                                        src={recAnime.coverImage?.large || ''}
                                                        alt={getAnimeTitle(recAnime)}
                                                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                                </div>
                                                <div className="font-mono text-[10px] uppercase font-bold text-foreground truncate group-hover:underline underline-offset-4">
                                                    {getAnimeTitle(recAnime)}
                                                </div>
                                            </a>
                                        )
                                    })}
                                </div>
                            </section>
                        );
                    })()}
                </div>
            </div>
        </div>
    )
}

export default async function AnimeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const animeId = parseInt(id, 10)

    return (
        <Suspense fallback={<div className="h-screen border border-border shimmer" />}>
            <AnimeDetailContent id={animeId} />
        </Suspense>
    )
}
