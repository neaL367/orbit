import { connection } from 'next/server'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { IndexSectionHeader } from '@/components/shared/index-section-header'
import { AnimeDescription } from "@/features/anime/components/anime-description"
import { AnimeEpisodes } from "@/features/anime/components/anime-episodes"
import { AnimeTrailer } from "@/features/anime/components/anime-trailer"
import { IndexImage } from "@/components/shared/index-image"
import { BackButton } from "@/components/shared/back-button"

import { getCachedAnime } from '@/lib/graphql/data'
import { getAnimeTitle } from '@/lib/utils/anime-utils'
import { BASE_URL } from "@/lib/constants"

import type { Media } from '@/lib/graphql/types/graphql'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id: animeId } = await params
    const id = parseInt(animeId, 10)

    if (isNaN(id)) notFound()

    const result = await getCachedAnime(id)
    const anime = result.data?.Media as Media | undefined

    if (!anime) notFound()

    const title = getAnimeTitle(anime)
    const description = anime.description?.replace(/<[^>]*>/g, '').substring(0, 160)
    const image = anime.bannerImage || anime.coverImage?.extraLarge || anime.coverImage?.large || `${BASE_URL}/opengraph-image.png`

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
        <>
            {/* Registry Navigation Bar (Schedule-Inspired) */}
            <div
                className="fixed left-0 right-0 z-100 transition-all duration-700 ease-out group/ctx-nav bg-transparent border-b border-transparent [&.scrolled]:bg-background/70 [&.scrolled]:backdrop-blur-xl [&.scrolled]:border-white/5 [&.scrolled]:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]"
                id="registry-nav"
                style={{ top: 'calc(var(--nav-visible, 1) * 80px)' }}
                suppressHydrationWarning
            >
                {/* Content Container */}
                <div className="max-w-[1790px] mx-auto w-full px-6 md:px-12 lg:px-24 py-4 relative z-10">
                    <div className="flex items-center gap-6">
                        {/* Navigation Action - Always Visible */}
                        <div className="flex items-center gap-4">
                            <BackButton />
                            <div className="hidden md:block w-px h-8 bg-white/10 group-[.scrolled]/ctx-nav:bg-primary/20 transition-colors" />
                        </div>

                        {/* Title Section - Fades in on scroll */}
                        <div className="flex-1 flex items-center gap-4 opacity-0 translate-x-4 group-[.scrolled]/ctx-nav:opacity-100 group-[.scrolled]/ctx-nav:translate-x-0 transition-all duration-700 pointer-events-none group-[.scrolled]/ctx-nav:pointer-events-auto">
                            <div className="hidden md:flex items-center gap-4">
                                <div className="w-10 h-12 border border-primary/20 bg-secondary/20 relative overflow-hidden shrink-0">
                                    {anime.coverImage?.large && (
                                        <img src={anime.coverImage.large} alt="" className="w-full h-full object-cover opacity-60 grayscale" />
                                    )}
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-primary/40 leading-none">
                                        REGISTRY_ENTRY // {anime.id}
                                    </span>
                                    <h2 className="font-mono text-sm font-black uppercase tracking-tighter truncate max-w-[300px] lg:max-w-md text-foreground">
                                        {title}
                                    </h2>
                                </div>
                            </div>
                        </div>

                        {/* Separator Line */}
                        <div className="flex-1 h-px bg-white/5 group-[.scrolled]/ctx-nav:bg-primary/10 transition-all duration-700 opacity-0 group-[.scrolled]/ctx-nav:opacity-100" />

                        {/* Technical Metadata */}
                        <div className="flex flex-col items-end shrink-0 opacity-0 translate-x-4 group-[.scrolled]/ctx-nav:opacity-100 group-[.scrolled]/ctx-nav:translate-x-0 transition-all duration-700">
                            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/40 leading-none">
                                {anime.status}
                            </span>
                            <div className="flex gap-1 mt-1.5 opacity-40 group-[.scrolled]/ctx-nav:opacity-100 transition-opacity">
                                <div className="w-12 h-0.5 bg-primary/20" />
                                <div className="w-4 h-0.5 bg-primary" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="reveal relative pb-20">

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

                {/* Immersive Hero Section */}
                <div className="w-screen relative left-1/2 -translate-x-1/2 h-[75dvh] group select-none overflow-hidden">
                    {/* Background Ambient Component */}
                    <div className="absolute inset-0 z-0">
                        {anime.bannerImage || anime.coverImage?.extraLarge ? (
                            <div className="absolute inset-0 overflow-hidden">
                                <img
                                    src={anime.bannerImage || anime.coverImage?.extraLarge || ""}
                                    alt=""
                                    className="w-full h-full object-cover blur-3xl opacity-20 scale-125 transition-all duration-3000 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-background/40" />
                            </div>
                        ) : null}

                    </div>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="relative w-full h-full overflow-hidden">
                            {anime.bannerImage ? (
                                <div className="relative w-full h-full overflow-hidden">
                                    <IndexImage
                                        src={anime.bannerImage}
                                        alt="Banner"
                                        fill
                                        priority
                                        sizes="100vw"
                                        showTechnicalDetails={false}
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-1000 scale-[1.02] group-hover:scale-100"
                                    />
                                </div>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-secondary/5">
                                    <span className="font-mono text-[10px] uppercase tracking-[1em] text-muted-foreground/20 animate-pulse">NO_VISUAL_DATA_AVAILABLE</span>
                                </div>
                            )}

                            {/* Technical Overlay Elements */}
                            <div className="absolute inset-0 z-20 pointer-events-none">
                                <div className="absolute top-12 right-12 hidden lg:flex flex-col gap-4 items-end">
                                    <div className="flex flex-col items-end">
                                        <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-white/40">SYSTEM_STATUS</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                            <span className="font-mono text-[10px] uppercase font-bold text-white/80 tracking-widest">STABLE_LINK</span>
                                        </div>
                                    </div>
                                    <div className="h-px w-24 bg-white/10" />
                                    <div className="flex flex-col items-end">
                                        <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-white/40">LATENCY_VAR</span>
                                        <span className="font-mono text-[10px] uppercase font-bold text-white/80 tracking-widest">24ms_SYNC</span>
                                    </div>
                                    <div className="flex flex-col items-end opacity-20">
                                        <span className="font-mono text-[7px] uppercase tracking-[0.3em] text-white/40">ENCRYPTION</span>
                                        <span className="font-mono text-[8px] uppercase font-bold text-white/80 tracking-widest">RSA_4096_V2</span>
                                    </div>
                                </div>

                                <div className="absolute bottom-32 left-8 md:left-16 hidden md:flex flex-col gap-2 opacity-40">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <div className="w-1 h-3 bg-white/20" />
                                            <div className="h-px bg-white/5" style={{ width: `${(i * 123 + 45) % 60 + 20}px` }} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Bottom Gradient Fade & Top Header Protection */}
                            <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-background/60 z-10" />
                            <div className="absolute inset-0 bg-linear-to-b from-background/40 via-transparent to-transparent z-10" />
                        </div>
                    </div>
                </div>

                {/* Main Content Layout */}
                <main className="w-full -mt-32 md:-mt-56 relative z-30 pb-32">
                    <header className="flex flex-col md:flex-row gap-8 md:gap-16 items-start">
                        {/* Poster Section with Technical Frame */}
                        <div className="w-full md:w-80 shrink-0 group/poster relative">
                            <div className="absolute -inset-4 border border-white/5 pointer-events-none group-hover/poster:border-primary/20 transition-colors" />
                            <div className="absolute -top-4 -left-4 w-8 h-8 border-t border-l border-white/20" />
                            <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b border-r border-white/20" />

                            <div className="aspect-2/3 border border-white/10 overflow-hidden relative shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] bg-secondary/20">
                                <IndexImage
                                    src={anime.coverImage?.extraLarge || ''}
                                    alt={title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 320px"
                                    priority
                                    showTechnicalDetails={false}
                                    className="w-full h-full object-cover transition-all duration-1000 group-hover/poster:scale-105"
                                />
                                {/* Glitch Overlay on Hover (Subtle) */}
                                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover/poster:opacity-20 transition-opacity mix-blend-overlay" />
                            </div>

                            <div className="mt-8 grid grid-cols-2 gap-px bg-white/5 border border-white/5 p-px">
                                <div className="bg-background/40 p-3 flex flex-col">
                                    <span className="font-mono text-[8px] uppercase tracking-widest text-primary/40 mb-1 leading-none">SCORE_VAL</span>
                                    <span className="font-mono text-xl font-black text-foreground">{anime.averageScore || '??'}%</span>
                                </div>
                                <div className="bg-background/40 p-3 flex flex-col">
                                    <span className="font-mono text-[8px] uppercase tracking-widest text-primary/40 mb-1 leading-none">POP_RANK</span>
                                    <span className="font-mono text-xl font-black text-foreground">#{anime.popularity?.toLocaleString('en-US') || '??'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Metadata Section */}
                        <div className="flex-1 space-y-12">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="bg-primary text-background px-3 py-1 font-mono text-[10px] font-black uppercase index-cut-tr tracking-widest">
                                        ID: {anime.id} {'//'} {anime.status}
                                    </div>
                                    <div className="hidden sm:flex items-center gap-2 font-mono text-[9px] text-muted-foreground uppercase tracking-widest">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                                        Archived_Registry_File_V.01
                                    </div>
                                </div>

                                <h1 className="text-5xl sm:text-7xl lg:text-8xl font-mono uppercase tracking-tighter leading-[0.85] text-foreground font-black text-balance">
                                    {title}
                                </h1>

                                <div className="flex flex-wrap gap-x-8 gap-y-3 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground/80 font-bold border-y border-white/5 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-primary opacity-40">TYP:</span>
                                        <span>{anime.format}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-primary opacity-40">YR:</span>
                                        <span>{anime.startDate?.year}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-primary opacity-40">EP:</span>
                                        <span>{anime.episodes || '??'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-primary opacity-40">SN:</span>
                                        <span>{anime.season}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="max-w-3xl">
                                <AnimeDescription description={anime.description} />
                            </div>

                            <div className="flex flex-wrap gap-2 pt-4">
                                {anime.genres?.map(genre => (
                                    <span key={genre} className="px-4 py-1.5 border border-white/5 bg-white/2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:bg-primary hover:text-background cursor-default transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_8px_16px_-8px_rgba(255,255,255,0.2)]">
                                        {genre}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </header>

                    <div className="mt-40 space-y-40">
                        {/* Trailer Section with Decorative Header */}
                        {anime.trailer?.id && anime.trailer?.site === 'youtube' && (
                            <section className="space-y-12 reveal">
                                <div className="flex items-end justify-between border-b border-white/5 pb-4 mb-16">
                                    <IndexSectionHeader title="Visual_Preview" className="mb-0 px-0" />
                                    <div className="hidden sm:flex flex-col items-end font-mono text-[8px] uppercase tracking-widest text-muted-foreground/40 gap-1 pb-1">
                                        <span>STREAM_HASH: 0x{anime.trailer.id.substring(0, 8).toUpperCase()}</span>
                                        <span>DECRYPT_STATUS: OK</span>
                                    </div>
                                </div>
                                <div className="relative group/trailer-box">
                                    <div className="absolute -top-4 -right-4 w-12 h-12 border-t border-r border-primary/20 opacity-0 group-hover/trailer-box:opacity-100 transition-opacity duration-700" />
                                    <div className="absolute -bottom-4 -left-4 w-12 h-12 border-b border-l border-primary/20 opacity-0 group-hover/trailer-box:opacity-100 transition-opacity duration-700" />
                                    <AnimeTrailer
                                        videoId={anime.trailer.id}
                                        title={title}
                                        thumbnail={anime.trailer.thumbnail || anime.bannerImage || anime.coverImage?.extraLarge}
                                    />
                                </div>
                            </section>
                        )}

                        {/* Data Grid Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
                            {/* Sidebar: Technical Metadata */}
                            <aside className="lg:col-span-4 space-y-16 order-1 lg:order-1">
                                <section className="space-y-8">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-white/20 leading-none font-black">System_Config</span>
                                        <span className="font-mono text-[14px] font-black uppercase tracking-widest text-foreground">Parameters</span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-px bg-white/5 border border-white/5 p-px">
                                        {[
                                            { label: 'Avg_Score', value: anime.averageScore ? `${anime.averageScore}%` : 'N/A', icon: '' },
                                            { label: 'Popularity', value: anime.popularity?.toLocaleString('en-US') || 'N/A', icon: '' },
                                            { label: 'Source', value: anime.source?.replace(/_/g, " ") || 'Unknown', icon: '' },
                                            { label: 'Studio', value: anime.studios?.nodes?.[0]?.name || 'Unknown', icon: '' },
                                            { label: 'Format', value: anime.format || 'Unknown', icon: '' },
                                            { label: 'Season', value: (anime.season && anime.startDate?.year) ? `${anime.season} ${anime.startDate.year}` : (anime.season || anime.startDate?.year || 'Unknown'), icon: '' }
                                        ].map((item, i) => (
                                            <div key={item.label} className="flex justify-between items-center bg-background/50 p-4 font-mono text-[10px] uppercase tracking-wider group/item hover:bg-white/2 transition-colors gap-4">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <span className="text-primary/20 text-[8px] shrink-0">{i < 9 ? `0${i + 1}` : i + 1}</span>
                                                    <span className="text-muted-foreground/60 group-hover:text-primary/80 transition-colors truncate">{item.label}</span>
                                                </div>
                                                <span className="text-foreground font-black tracking-widest shrink-0">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <AnimeEpisodes episodes={anime.streamingEpisodes || []} />

                                {anime.relations?.edges && anime.relations.edges.length > 0 && (
                                    <section className="space-y-10">
                                        <IndexSectionHeader title="Related_Hash" />
                                        <div className="flex flex-col gap-3">
                                            {anime.relations.edges
                                                .filter(edge => edge?.node && edge.node.type === 'ANIME' && !edge.node.isAdult)
                                                .map(edge => (
                                                    <a
                                                        key={edge?.node?.id}
                                                        href={`/anime/${edge?.node?.id}`}
                                                        className="block p-4 border border-white/5 hover:border-primary/40 bg-white/2 hover:bg-primary/5 transition-all group relative overflow-hidden"
                                                    >
                                                        <div className="absolute right-[-20px] top-[-20px] w-12 h-12 bg-primary/5 rotate-45 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                                                        <span className="font-mono text-[8px] uppercase block text-primary/30 mb-2 font-bold tracking-[0.2em]">
                                                            /{edge?.relationType?.replace(/_/g, '_')}
                                                        </span>
                                                        <span className="font-mono text-[12px] font-black uppercase block truncate text-foreground group-hover:text-primary transition-colors pr-8">
                                                            {getAnimeTitle(edge?.node as Media)}
                                                        </span>
                                                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                                                        </div>
                                                    </a>
                                                ))
                                            }
                                        </div>
                                    </section>
                                )}
                            </aside>

                            {/* Main Body: Cast and Recommendations */}
                            <div className="lg:col-span-8 space-y-32 order-2 lg:order-2">
                                {/* Characters / Cast */}
                                {anime.characters?.edges && anime.characters.edges.length > 0 && (
                                    <section className="space-y-12">
                                        <div className="flex items-center justify-between">
                                            <IndexSectionHeader title="Cast_Registry" className="mb-0" />
                                            <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/40 hidden sm:block">COUNT: {anime.characters.edges.length} UNITS</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 border border-white/5 p-px">
                                            {anime.characters.edges.slice(0, 10).map(edge => {
                                                if (!edge?.node) return null;
                                                const voiceActor = edge.voiceActors?.[0];

                                                return (
                                                    <div key={edge.node.id} className="flex h-24 bg-background group relative overflow-hidden hover:bg-secondary/40 transition-colors">
                                                        {/* Selection Marker */}
                                                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top" />

                                                        <div className="w-16 bg-secondary relative shrink-0 overflow-hidden border-r border-white/5">
                                                            <IndexImage
                                                                src={edge.node.image?.large || ''}
                                                                alt={edge.node.name?.full || ''}
                                                                fill
                                                                sizes="64px"
                                                                showTechnicalDetails={false}
                                                                className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                                                            />
                                                        </div>

                                                        <div className="flex-1 flex flex-col justify-center px-4 overflow-hidden border-r border-white/5">
                                                            <div className="font-mono text-[11px] font-black uppercase truncate text-foreground group-hover:text-primary transition-colors">
                                                                {edge.node.name?.full}
                                                            </div>
                                                            <div className="font-mono text-[8px] uppercase text-muted-foreground/40 font-bold tracking-widest mt-1">
                                                                ROLE: {edge.role}
                                                            </div>
                                                        </div>

                                                        {voiceActor && (
                                                            <>
                                                                <div className="flex-1 flex flex-col justify-center px-4 overflow-hidden text-right">
                                                                    <div className="font-mono text-[10px] font-bold uppercase truncate text-foreground/70 group-hover:text-foreground transition-colors">
                                                                        {voiceActor.name?.full}
                                                                    </div>
                                                                    <div className="font-mono text-[8px] uppercase text-muted-foreground/30 font-bold tracking-tighter">
                                                                        ACTOR // {voiceActor.languageV2}
                                                                    </div>
                                                                </div>
                                                                <div className="w-16 bg-secondary relative shrink-0 hidden sm:block overflow-hidden">
                                                                    <IndexImage
                                                                        src={voiceActor.image?.medium || ''}
                                                                        alt={voiceActor.name?.full || ''}
                                                                        fill
                                                                        sizes="64px"
                                                                        showTechnicalDetails={false}
                                                                        className="object-cover grayscale group-hover:grayscale-0 group-hover:rotate-2 transition-all duration-700"
                                                                    />
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </section>
                                )}

                                {/* Recommendations */}
                                {anime.recommendations?.nodes && anime.recommendations.nodes.length > 0 && (
                                    <section className="space-y-12">
                                        <IndexSectionHeader title="System_Matches" />
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                                            {anime.recommendations.nodes
                                                .filter(node => node?.mediaRecommendation && !node.mediaRecommendation.isAdult)
                                                .slice(0, 4)
                                                .map(node => {
                                                    const rec = node?.mediaRecommendation;
                                                    if (!rec) return null;
                                                    return (
                                                        <a key={rec.id} href={`/anime/${rec.id}`} className="group block space-y-4">
                                                            <div className="relative">
                                                                <div className="absolute -inset-2 border border-primary/0 group-hover:border-primary/20 transition-all duration-500" />
                                                                <div className="aspect-2/3 border border-white/10 overflow-hidden relative bg-secondary/20 shadow-xl">
                                                                    <IndexImage
                                                                        src={rec.coverImage?.large || ''}
                                                                        alt={getAnimeTitle(rec)}
                                                                        fill
                                                                        sizes="250px"
                                                                        showTechnicalDetails={false}
                                                                        className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                                                                    />
                                                                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                    <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                                                                        <span className="font-mono text-[8px] text-white font-black bg-primary px-1.5 py-0.5 uppercase tracking-widest">VIEW</span>
                                                                        <span className="font-mono text-[8px] text-white font-bold opacity-60">ID: {rec.id}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <div className="font-mono text-[10px] uppercase font-black text-muted-foreground group-hover:text-primary truncate transition-colors tracking-tighter">
                                                                    {getAnimeTitle(rec)}
                                                                </div>
                                                                <div className="h-[2px] w-8 bg-white/10 group-hover:w-full group-hover:bg-primary/40 transition-all duration-500" />
                                                            </div>
                                                        </a>
                                                    )
                                                })
                                            }
                                        </div>
                                    </section>
                                )}
                            </div>
                        </div>
                    </div>
                </main>

                {/* Scroll Interaction Script */}
                <script dangerouslySetInnerHTML={{
                    __html: `
                    (function() {
                        const handleScroll = () => {
                            const nav = document.getElementById('registry-nav');
                            if (!nav) return;
                            
                            const isScrolled = window.scrollY > 150;
                            if (isScrolled) {
                                nav.classList.add('scrolled');
                            } else {
                                nav.classList.remove('scrolled');
                            }
                        };
                        window.addEventListener('scroll', handleScroll, { passive: true });
                        handleScroll();
                    })();
                `
                }} />
            </div >
        </>

    )
}

export default function AnimeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    return (
        <Suspense fallback={
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-6">
                    {/* Loader Core */}
                    <div className="relative w-16 h-16 flex items-center justify-center">
                        <div className="absolute inset-0 border border-primary/20 rotate-45 animate-pulse" />
                        <div className="absolute inset-0 border border-primary/20 -rotate-45 animate-pulse delay-75" />
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>

                    {/* Technical Text */}
                    <div className="flex flex-col items-center gap-1 font-mono">
                        <span className="text-xs uppercase tracking-[0.5em] text-primary font-bold animate-pulse">
                            Registry_Sync
                        </span>
                        <span className="text-[10px] uppercase tracking-widest text-primary/40">
                            Retrieving_Archive_Data...
                        </span>
                    </div>
                </div>
            </div>
        }>
            <AnimeDetailContent params={params} />
        </Suspense>
    )
}
