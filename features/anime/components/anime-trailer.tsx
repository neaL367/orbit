"use client"

import { PrecisionPlayer } from "@/components/shared/precision-player"

interface AnimeTrailerProps {
    videoId: string
    title?: string
    thumbnail?: string | null
}

export function AnimeTrailer({ videoId, title }: AnimeTrailerProps) {
    if (!videoId) return null

    return (
        <div className="w-full relative">
            <PrecisionPlayer
                videoId={videoId}
                title={title}
                id={`0x${videoId.substring(0, 6).toUpperCase()}`}
            />
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
