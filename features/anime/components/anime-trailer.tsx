"use client"

import { useMemo, useState } from "react"
import { PrecisionPlayer } from "@/components/shared/precision-player"

interface AnimeTrailerProps {
    videoId: string
    title?: string
    thumbnail?: string | null
}


export function AnimeTrailer({ videoId, title, thumbnail }: AnimeTrailerProps) {
    const [hasInteracted, setHasInteracted] = useState(false)

    const playerId = useMemo(() =>
        `0x${videoId?.substring(0, 6).toUpperCase() || 'NULL'}`,
        [videoId]
    )

    if (!videoId) return null

    return (
        <div
            className="w-full relative group/trailer cursor-pointer"
            onClick={() => !hasInteracted && setHasInteracted(true)}
        >
            {!hasInteracted ? (
                <div
                    className="relative w-full aspect-video bg-black overflow-hidden border border-white/5"
                    style={{
                        clipPath: 'polygon(8px 0, calc(100% - 24px) 0, 100% 24px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 24px 100%, 0 calc(100% - 24px), 0 8px)'
                    }}
                >
                    {thumbnail && (
                        <img
                            src={thumbnail}
                            alt={title}
                            className="w-full h-full object-cover opacity-40 grayscale group-hover/trailer:grayscale-0 group-hover/trailer:scale-105 transition-all duration-700"
                        />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-full border border-primary/50 flex items-center justify-center bg-black/60 group-hover/trailer:scale-110 transition-transform duration-300">
                                <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-primary border-b-[8px] border-b-transparent ml-1" />
                            </div>
                            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary/80">Initialize_Feed</span>
                        </div>
                    </div>
                </div>
            ) : (
                <PrecisionPlayer
                    videoId={videoId}
                    title={title}
                    id={playerId}
                    autoPlay={true}
                />
            )}
            {/* Contextual Subtext */}
            <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 border-t border-border/50 pt-3 sm:pt-4 px-1 sm:px-2">
                <div className="flex flex-col">
                    <span className="font-mono text-[8px] sm:text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40">Data_Package_Status</span>
                    <span className="font-mono text-[9px] sm:text-[11px] uppercase tracking-widest text-primary font-bold">Synchronized_Visual_Feed</span>
                </div>
                <div className="flex items-center gap-4 sm:gap-6 font-mono text-[8px] sm:text-[10px] uppercase tracking-widest text-muted-foreground/60 w-full sm:w-auto justify-between sm:justify-start">
                    <div className="flex flex-col gap-0.5 items-end">
                        <span className="text-[8px] opacity-40">ENCRYPTION</span>
                        <span className="text-foreground">AES-256-R</span>
                    </div>
                    <div className="flex flex-col gap-0.5 items-end">
                        <span className="text-[8px] opacity-40">SIGNAL</span>
                        <span className="text-foreground">STABLE</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
