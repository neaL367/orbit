import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import dynamic from "next/dynamic"
import { IndexSectionHeader } from "@/components/shared/index-section-header"
import { IndexImage } from "@/components/shared/index-image"
import { AnimeRegistryNav } from "@/components/shared/anime-registry-nav"
import { getCachedAnime } from "@/lib/graphql/data"
import { getAnimeTitle } from "@/lib/utils/anime-utils"
import type { Media } from "@/lib/graphql/types/graphql"

const AnimeDescription = dynamic(
  () =>
    import("@/features/anime/components/anime-description").then((m) => ({
      default: m.AnimeDescription,
    })),
  { loading: () => <div className="h-28 max-w-3xl animate-pulse rounded-sm border border-white/5 bg-secondary/25" aria-hidden /> }
)

const AnimeEpisodes = dynamic(
  () =>
    import("@/features/anime/components/anime-episodes").then((m) => ({
      default: m.AnimeEpisodes,
    })),
  { loading: () => <div className="h-40 w-full animate-pulse rounded-sm border border-white/5 bg-secondary/25" aria-hidden /> }
)

const AnimeTrailer = dynamic(
  () =>
    import("@/features/anime/components/anime-trailer").then((m) => ({
      default: m.AnimeTrailer,
    })),
  {
    loading: () => (
      <div className="aspect-video w-full animate-pulse rounded-sm border border-white/5 bg-secondary/25" aria-hidden />
    ),
  }
)

type Props = { params: Promise<{ id: string }> }

export async function AnimeDetailContent({ params }: Props) {
  const { id: idStr } = await params
  const id = parseInt(idStr, 10)
  const result = await getCachedAnime(id)
  const anime = result.data?.Media as Media | undefined

  if (!anime) notFound()

  const title = getAnimeTitle(anime)
  const bannerSrc = anime.bannerImage || anime.coverImage?.extraLarge || ""

  return (
    <>
      <AnimeRegistryNav anime={anime} title={title} />

      <div className="reveal relative pb-20">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": anime.format === "MOVIE" ? "Movie" : "TVSeries",
              name: title,
              description: anime.description?.replace(/<[^>]*>/g, ""),
              image: anime.coverImage?.extraLarge || anime.bannerImage,
              genre: anime.genres,
              datePublished: anime.startDate?.year
                ? `${anime.startDate.year}-${anime.startDate.month || "01"}-${anime.startDate.day || "01"}`
                : undefined,
              aggregateRating: anime.averageScore
                ? {
                    "@type": "AggregateRating",
                    ratingValue: anime.averageScore,
                    bestRating: 100,
                    worstRating: 0,
                    ratingCount: anime.popularity,
                  }
                : undefined,
            }),
          }}
        />

        <header className="w-screen relative left-1/2 -translate-x-1/2 min-h-[42dvh] max-h-[min(72dvh,820px)] h-[52dvh] group select-none overflow-hidden">
          <div className="absolute inset-0 z-0">
            {bannerSrc ? (
              <div className="relative h-full w-full overflow-hidden">
                <Image
                  src={bannerSrc}
                  alt=""
                  fill
                  className="object-cover blur-3xl opacity-20 scale-125 transition-[transform,opacity] duration-1000 group-hover:scale-110 motion-reduce:transition-none"
                  sizes="100vw"
                  aria-hidden
                />
                <div className="absolute inset-0 bg-background/25" />
              </div>
            ) : null}
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="relative w-full h-full overflow-hidden">
              {anime.bannerImage ? (
                <div className="relative w-full h-full overflow-hidden">
                  <IndexImage
                    src={anime.bannerImage}
                    alt=""
                    fill
                    priority
                    sizes="100vw"
                    showTechnicalDetails={false}
                    className="h-full w-full object-cover object-center opacity-95 saturate-[1.08] transition-[opacity,transform] duration-1000 group-hover:opacity-100 motion-reduce:transition-none scale-[1.01] group-hover:scale-[1.005] motion-reduce:group-hover:scale-[1.01]"
                  />
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-secondary/5">
                  <span className="font-mono text-[10px] uppercase tracking-[1em] text-muted-foreground/20">
                    No banner image
                  </span>
                </div>
              )}

              <div
                className="pointer-events-none absolute right-6 top-10 z-20 hidden flex-col items-end gap-2.5 text-right md:flex lg:right-10 lg:top-14"
                aria-hidden="true"
              >
                <div className="h-px w-12 bg-white/20" />
                <div className="h-px w-7 bg-white/12" />
                <div className="h-px w-16 bg-white/10" />
              </div>

              <div className="absolute inset-0 z-10 bg-linear-to-t from-background from-28% via-background/70 via-45% to-transparent to-100%" />
              <div className="absolute inset-0 z-10 bg-linear-to-b from-background/35 via-transparent to-transparent" />
            </div>
          </div>
        </header>

        <main className="relative z-30 -mt-16 w-full pb-24 md:-mt-28 md:pb-32 lg:-mt-36">
          <div className="pointer-events-none absolute inset-x-0 -top-px h-32 bg-linear-to-b from-background to-transparent md:h-40" />

          <div className="relative flex flex-col gap-10 md:flex-row md:items-start md:gap-14 lg:gap-20">
            <div className="relative z-10 w-full md:-mt-4 md:w-80 md:shrink-0 group/poster">
              <div className="absolute -inset-3 border border-white/6 pointer-events-none transition-colors group-hover/poster:border-primary/25 md:-inset-4" />
              <div className="absolute -top-3 -left-3 h-6 w-6 border-t border-l border-white/15 md:-top-4 md:-left-4 md:h-8 md:w-8" />
              <div className="absolute -bottom-3 -right-3 h-6 w-6 border-b border-r border-white/15 md:-bottom-4 md:-right-4 md:h-8 md:w-8" />

              <div className="relative aspect-2/3 overflow-hidden rounded-sm border border-white/10 bg-secondary/20 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.85)] ring-1 ring-black/40 md:rounded-md">
                <IndexImage
                  src={anime.coverImage?.extraLarge || ""}
                  alt={title}
                  fill
                  sizes="(max-width: 768px) 100vw, 320px"
                  priority
                  showTechnicalDetails={false}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/poster:scale-105"
                />
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover/poster:opacity-20 transition-opacity mix-blend-overlay" />
              </div>

              <div className="mt-8 border border-white/5 bg-white/5 p-px tabular-nums">
                <div className="bg-background/40 p-4">
                  <span className="mb-1 block font-mono text-[8px] uppercase leading-none tracking-widest text-primary/40">
                    Popularity
                  </span>
                  <span className="font-mono text-xl font-black text-foreground">
                    #{anime.popularity?.toLocaleString("en-US") ?? "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="relative z-10 min-w-0 flex-1 space-y-10 pt-2 md:pt-0">
              <div className="space-y-5">
                <div className="flex flex-wrap items-baseline gap-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    <a
                      href={`https://anilist.co/anime/${anime.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-foreground/90 underline decoration-white/15 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary/50"
                    >
                      AniList
                    </a>
                    <span className="text-muted-foreground/50"> · </span>
                    <span className="tabular-nums text-muted-foreground">Entry {anime.id}</span>
                  </p>
                </div>

                <h1 className="text-balance font-sans text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                  {title}
                </h1>

                <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">
                  {[
                    anime.status?.replace(/_/g, " "),
                    anime.format,
                    anime.episodes != null ? `${anime.episodes} episodes` : null,
                    anime.season && anime.startDate?.year
                      ? `${anime.season} ${anime.startDate.year}`
                      : anime.startDate?.year != null
                        ? String(anime.startDate.year)
                        : null,
                  ]
                    .filter((s): s is string => Boolean(s))
                    .join(" · ")}
                </p>
              </div>

              <div className="max-w-3xl">
                <AnimeDescription description={anime.description} />
              </div>

              <div className="flex flex-wrap gap-2 pt-4">
                {anime.genres?.map((genre) => (
                  <Link
                    key={genre}
                    href={`/anime?sort=trending&genres=${encodeURIComponent(genre ?? "")}`}
                    className="px-4 py-1.5 border border-white/5 bg-white/5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    {genre}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-24 space-y-24 md:mt-32 md:space-y-32 lg:mt-40 lg:space-y-40">
            {anime.trailer?.id && anime.trailer?.site === "youtube" && (
              <section className="space-y-12 reveal">
                <div className="flex items-end justify-between border-b border-white/5 pb-4 mb-16">
                  <IndexSectionHeader title="Trailer" className="mb-0 px-0" />
                  <span className="hidden sm:block font-mono text-[9px] uppercase tracking-widest text-muted-foreground/50">
                    Official trailer
                  </span>
                </div>
                <div className="relative group/trailer-box">
                  <div className="absolute -top-4 -right-4 w-12 h-12 border-t border-r border-primary/20 opacity-0 group-hover/trailer-box:opacity-100 transition-opacity duration-700" />
                  <div className="absolute -bottom-4 -left-4 w-12 h-12 border-b border-l border-primary/20 opacity-0 group-hover/trailer-box:opacity-100 transition-opacity duration-700" />
                  <AnimeTrailer
                    videoId={anime.trailer.id}
                    title={title}
                    thumbnail={anime.trailer.thumbnail || anime.bannerImage || anime.coverImage?.extraLarge}
                    className="mx-auto max-w-6xl"
                  />
                </div>
              </section>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
              <aside className="lg:col-span-4 space-y-16 order-1 lg:order-1">
                <section className="space-y-8">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[9px] uppercase tracking-[0.35em] text-muted-foreground/60 leading-none font-black">
                      Record
                    </span>
                    <span className="font-mono text-sm font-black uppercase tracking-widest text-foreground">
                      Parameters
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-px bg-white/5 border border-white/5 p-px">
                    {[
                      { label: "Popularity", value: anime.popularity?.toLocaleString("en-US") || "N/A" },
                      { label: "Source", value: anime.source?.replace(/_/g, " ") || "Unknown" },
                      { label: "Studio", value: anime.studios?.nodes?.[0]?.name || "Unknown" },
                      { label: "Format", value: anime.format || "Unknown" },
                      {
                        label: "Season",
                        value:
                          anime.season && anime.startDate?.year
                            ? `${anime.season} ${anime.startDate.year}`
                            : anime.season || anime.startDate?.year || "Unknown",
                      },
                    ].map((item, i) => (
                      <div
                        key={item.label}
                        className="flex justify-between items-center bg-background/50 p-4 font-mono text-[10px] uppercase tracking-wider group/item hover:bg-white/5 transition-colors gap-4"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-primary/30 text-[8px] shrink-0 tabular-nums">
                            {i < 9 ? `0${i + 1}` : i + 1}
                          </span>
                          <span className="text-muted-foreground/70 group-hover/item:text-primary/80 transition-colors truncate">
                            {item.label}
                          </span>
                        </div>
                        <span className="text-foreground font-black tracking-widest shrink-0 tabular-nums">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                <AnimeEpisodes episodes={anime.streamingEpisodes || []} />

                {anime.relations?.edges && anime.relations.edges.length > 0 && (
                  <section className="space-y-10">
                    <IndexSectionHeader title="Related" />
                    <div className="flex flex-col gap-3">
                      {anime.relations.edges
                        .filter((edge) => edge?.node && edge.node.type === "ANIME" && !edge.node.isAdult)
                        .map((edge) => (
                          <Link
                            key={edge?.node?.id}
                            href={`/anime/${edge?.node?.id}`}
                            className="block p-4 border border-white/5 hover:border-primary/40 bg-white/2 hover:bg-primary/5 transition-colors group relative overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                          >
                            <div className="absolute right-[-20px] top-[-20px] w-12 h-12 bg-primary/5 rotate-45 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                            <span className="font-mono text-[8px] uppercase block text-primary/40 mb-2 font-bold tracking-[0.2em]">
                              {edge?.relationType?.replace(/_/g, " ")}
                            </span>
                            <span className="font-mono text-[12px] font-black uppercase block truncate text-foreground group-hover:text-primary transition-colors pr-8">
                              {getAnimeTitle(edge?.node as Media)}
                            </span>
                          </Link>
                        ))}
                    </div>
                  </section>
                )}
              </aside>

              <div className="lg:col-span-8 space-y-32 order-2 lg:order-2">
                {anime.characters?.edges && anime.characters.edges.length > 0 && (
                  <section className="space-y-12">
                    <div className="flex items-center justify-between">
                      <IndexSectionHeader title="Cast" className="mb-0" />
                      <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/50 hidden sm:block tabular-nums">
                        {anime.characters.edges.length} roles
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 border border-white/5 p-px">
                      {anime.characters.edges.slice(0, 10).map((edge) => {
                        if (!edge?.node) return null
                        const voiceActor = edge.voiceActors?.[0]

                        return (
                          <div
                            key={edge.node.id}
                            className="flex h-24 bg-background group relative overflow-hidden hover:bg-secondary/40 transition-colors"
                          >
                            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top" />

                            <div className="w-16 bg-secondary relative shrink-0 overflow-hidden border-r border-white/5">
                              <IndexImage
                                src={edge.node.image?.large || ""}
                                alt={edge.node.name?.full || ""}
                                fill
                                sizes="64px"
                                showTechnicalDetails={false}
                                className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                              />
                            </div>

                            <div className="flex-1 flex flex-col justify-center px-4 overflow-hidden border-r border-white/5 min-w-0">
                              <div className="font-mono text-[11px] font-black uppercase truncate text-foreground group-hover:text-primary transition-colors">
                                {edge.node.name?.full}
                              </div>
                              <div className="font-mono text-[8px] uppercase text-muted-foreground/50 font-bold tracking-widest mt-1">
                                {edge.role}
                              </div>
                            </div>

                            {voiceActor && (
                              <>
                                <div className="flex-1 flex flex-col justify-center px-4 overflow-hidden text-right min-w-0">
                                  <div className="font-mono text-[10px] font-bold uppercase truncate text-foreground/70 group-hover:text-foreground transition-colors">
                                    {voiceActor.name?.full}
                                  </div>
                                  <div className="font-mono text-[8px] uppercase text-muted-foreground/40 font-bold tracking-tighter">
                                    {voiceActor.languageV2}
                                  </div>
                                </div>
                                <div className="w-16 bg-secondary relative shrink-0 hidden sm:block overflow-hidden">
                                  <IndexImage
                                    src={voiceActor.image?.medium || ""}
                                    alt={voiceActor.name?.full || ""}
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

                {anime.recommendations?.nodes && anime.recommendations.nodes.length > 0 && (
                  <section className="space-y-12">
                    <IndexSectionHeader title="Recommendations" />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                      {anime.recommendations.nodes
                        .filter((node) => node?.mediaRecommendation && !node.mediaRecommendation.isAdult)
                        .slice(0, 4)
                        .map((node) => {
                          const rec = node?.mediaRecommendation
                          if (!rec) return null
                          return (
                            <Link
                              key={rec.id}
                              href={`/anime/${rec.id}`}
                              className="group block space-y-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
                            >
                              <div className="relative">
                                <div className="absolute -inset-2 border border-primary/0 group-hover:border-primary/20 transition-colors duration-500" />
                                <div className="aspect-2/3 border border-white/10 overflow-hidden relative bg-secondary/20 shadow-xl">
                                  <IndexImage
                                    src={rec.coverImage?.large || ""}
                                    alt={getAnimeTitle(rec)}
                                    fill
                                    sizes="250px"
                                    showTechnicalDetails={false}
                                    className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                                  />
                                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                  <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                    <span className="font-mono text-[8px] text-white font-black bg-primary px-1.5 py-0.5 uppercase tracking-widest">
                                      Open
                                    </span>
                                    <span className="font-mono text-[8px] text-white/70 tabular-nums">ID {rec.id}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-1 min-w-0">
                                <div className="font-mono text-[10px] uppercase font-black text-muted-foreground group-hover:text-primary truncate transition-colors tracking-tighter">
                                  {getAnimeTitle(rec)}
                                </div>
                                <div className="h-[2px] w-8 bg-white/10 group-hover:w-full group-hover:bg-primary/40 transition-[width,background-color] duration-500" />
                              </div>
                            </Link>
                          )
                        })}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
