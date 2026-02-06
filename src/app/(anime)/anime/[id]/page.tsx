import { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import { getCachedAnime } from '@/lib/graphql/server-cache'
import { getAnimeTitle } from '@/lib/utils/anime-utils'
import type { Media } from '@/lib/graphql/types/graphql'
import { IndexSectionHeader } from '@/components/shared/index-section-header'
import { AnimeEpisodes } from "@/features/anime/components/anime-episodes"
import { AnimeTrailer } from "@/features/anime/components/anime-trailer"
import { IndexImage, BackButton } from "@/components/shared"
import { AnimeDescription } from "@/features/anime/components/anime-description"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id: animeId } = await params
    const id = parseInt(animeId, 10)

    if (isNaN(id)) notFound()

    const result = await getCachedAnime(id)
    const anime = result.data?.Media as Media | undefined

    if (!anime) notFound()

    const title = getAnimeTitle(anime)
    const description = anime.description?.replace(/<[^>]*>/g, '').substring(0, 160)
    const image = anime.bannerImage || anime.coverImage?.extraLarge || anime.coverImage?.large || '/opengraph-image.png'

    return {
        title: `${title} — Registry`,
        description,
        alternates: {
            canonical: `/anime/${id}`,
        },
        openGraph: {
            title: `${title} — Registry`,
            description,
            url: `https://animex-index.vercel.app/anime/${id}`,
            images: [{ url: image }],
            type: 'video.tv_show',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${title} — Registry`,
            description,
            images: [image],
        }
    }
}

async function AnimeDetailContent({ params }: { params: Promise<{ id: string }> }) {
    const { id: idStr } = await params
    const id = parseInt(idStr, 10)
    await connection()
    const result = await getCachedAnime(id)
    const anime = result.data?.Media as Media | undefined

    if (!anime) notFound()

    const title = getAnimeTitle(anime)

    return (
        <div className="space-y-16 reveal relative">
            <div className="absolute top-4 left-4 z-50 md:top-8 md:left-8">
                <BackButton />
            </div>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': anime.format === 'MOVIE' ? 'Movie' : 'TVSeries',
                        name: title,
                        description: anime.description?.replace(/<[^>]*>/g, ''),
                        image: anime.coverImage?.extraLarge || anime.bannerImage,
                        genre: anime.genres,
                        datePublished: anime.startDate?.year ? `${anime.startDate.year}-${anime.startDate.month || '01'}-${anime.startDate.day || '01'}` : undefined,
                        aggregateRating: anime.averageScore ? {
                            '@type': 'AggregateRating',
                            ratingValue: anime.averageScore,
                            bestRating: 100,
                            worstRating: 0,
                            ratingCount: anime.popularity,
                        } : undefined,
                    }),
                }}
            />
            {/* Banner Section - Always render to preserve layout/back button zone */}
            <div className="relative w-full h-[25vh] md:h-[40vh] overflow-hidden border border-border/50 bg-secondary/5 group select-none">
                {anime.bannerImage ? (
                    <IndexImage
                        src={anime.bannerImage}
                        alt="Banner"
                        fill
                        priority
                        sizes="100vw"
                        showTechnicalDetails={true}
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-1000 scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary/20">
                        <div className="flex flex-col items-center gap-4 text-muted-foreground/20">
                            <div className="w-16 h-16 border border-current flex items-center justify-center rounded-full">
                                <div className="w-1 h-8 bg-current rotate-45" />
                            </div>
                            <span className="font-mono text-xs uppercase tracking-[0.5em]">No_Visual_Data</span>
                        </div>
                    </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

                {/* Tech Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

                {/* Metadata Badge */}
                <div className="absolute bottom-4 right-4 font-mono text-[9px] uppercase tracking-widest text-muted-foreground/50 border border-border/20 px-3 py-1 bg-background/80 backdrop-blur-md">
                    {anime.bannerImage ? 'VISUAL_DATA_LAYER_01' : 'NO_SIGNAL_DETECTED'}
                </div>
            </div>

            {/* Editorial Header */}
            <header className="flex flex-col md:flex-row gap-12 pb-16">
                <div className="w-full md:w-80 shrink-0">
                    <div className="aspect-[2/3] border border-border overflow-hidden relative">
                        <IndexImage
                            src={anime.coverImage?.extraLarge || ''}
                            alt={title}
                            fill
                            sizes="(max-width: 768px) 100vw, 320px"
                            priority
                            showTechnicalDetails={false}
                            className="w-full h-full object-cover transition-all duration-700"
                        />
                    </div>
                </div>

                <div className="flex-1 space-y-8">
                    <div className="space-y-4">
                        <div className="bg-foreground text-background px-3 py-1 font-mono text-[10px] uppercase w-fit index-cut-tr">
                            ID: {anime.id} {'//'} {anime.status}
                        </div>
                        <h1 className="text-3xl sm:text-5xl md:text-7xl font-mono uppercase tracking-tighter leading-none text-foreground">
                            {title}
                        </h1>
                        <div className="flex flex-wrap gap-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground mr-8">
                            <span>{anime.format}</span>
                            <span>{anime.startDate?.year}</span>
                            <span>{anime.episodes} EP</span>
                            <span>{anime.season}</span>
                        </div>
                    </div>

                    <AnimeDescription description={anime.description} />

                    <div className="flex flex-wrap gap-2 pt-4">
                        {anime.genres?.map(genre => (
                            <span key={genre} className="px-3 py-1 border border-border font-mono text-[9px] uppercase text-muted-foreground hover:bg-foreground/5 cursor-default transition-colors">
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
                                <span className="text-foreground">{anime.averageScore ? `${anime.averageScore}%` : 'N/A'}</span>
                            </div>
                            <div className="flex justify-between border-b border-border pb-2">
                                <span className="text-muted-foreground">Popularity</span>
                                <span className="text-foreground">{anime.popularity?.toLocaleString() || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between border-b border-border pb-2">
                                <span className="text-muted-foreground">Source</span>
                                <span className="text-foreground">{anime.source?.replace(/_/g, " ") || 'Unknown'}</span>
                            </div>
                            <div className="flex justify-between border-b border-border pb-2">
                                <span className="text-muted-foreground">Studio</span>
                                <span className="text-foreground">{anime.studios?.nodes?.[0]?.name || 'Unknown'}</span>
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
                                                className="block p-3 border border-border hover:border-foreground hover:bg-foreground/5 transition-all group"
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
                                                <IndexImage
                                                    src={edge.node.image?.large || ''}
                                                    alt={edge.node.name?.full || ''}
                                                    fill
                                                    sizes="80px"
                                                    showTechnicalDetails={false}
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
                                                    <IndexImage
                                                        src={voiceActor.image?.medium || ''}
                                                        alt={voiceActor.name?.full || ''}
                                                        fill
                                                        sizes="80px"
                                                        showTechnicalDetails={false}
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
                                                    <IndexImage
                                                        src={recAnime.coverImage?.large || ''}
                                                        alt={getAnimeTitle(recAnime)}
                                                        fill
                                                        sizes="(max-width: 640px) 50vw, 200px"
                                                        showTechnicalDetails={false}
                                                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                                                    />
                                                    <div className="absolute inset-0 bg-transparent group-hover:bg-foreground/5 transition-colors" />
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

export default function AnimeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    return (
        <Suspense fallback={<div className="h-screen border border-border shimmer" />}>
            <AnimeDetailContent params={params} />
        </Suspense>
    )
}
