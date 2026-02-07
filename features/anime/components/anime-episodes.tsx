"use client"

import Image from "next/image"
import { useState } from "react"
import { IndexSectionHeader } from "@/components/shared/index-section-header"
import type { MediaStreamingEpisode } from "@/lib/graphql/types/graphql"

interface AnimeEpisodesProps {
    episodes: (MediaStreamingEpisode | null)[]
}

export function AnimeEpisodes({ episodes }: AnimeEpisodesProps) {
    const [showAll, setShowAll] = useState(false)

    if (!episodes || episodes.length === 0) return null

    const validEpisodes = episodes.filter(ep => ep !== null) as MediaStreamingEpisode[]
    const displayedEpisodes = showAll ? validEpisodes : validEpisodes.slice(0, 4)

    return (
        <section className="space-y-6">
            <IndexSectionHeader title="Broadcast_Log" subtitle={`Count: ${validEpisodes.length}`} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {displayedEpisodes.map((ep, i) => (
                    <a
                        key={i}
                        href={ep?.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-2 border border-border/50 hover:border-foreground hover:bg-white/5 transition-all group"
                    >
                        <div className="relative w-24 aspect-video bg-black/50 overflow-hidden shrink-0 border border-border/30">
                            {ep?.thumbnail ? (
                                <Image
                                    src={ep.thumbnail}
                                    alt={ep.title || ''}
                                    fill
                                    className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-[9px] font-mono text-muted-foreground">NO_SIGNAL</span>
                                </div>
                            )}
                            {/* Play Icon Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-6 h-6 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                                    <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[8px] border-l-white border-b-[4px] border-b-transparent ml-0.5" />
                                </div>
                            </div>
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="font-mono text-[10px] uppercase font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                {ep?.title || `Episode ${i + 1}`}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="font-mono text-[9px] uppercase text-muted-foreground/70">
                                    {ep?.site}
                                </span>
                            </div>
                        </div>
                    </a>
                ))}
            </div>
            {validEpisodes.length > 4 && (
                <div className="pt-2">
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="w-full py-2 border border-border/50 hover:border-border font-mono text-[9px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {showAll ? "Collapse_Broadcasts" : "View_All_Broadcasts"}
                    </button>
                </div>
            )}
        </section>
    )
}
