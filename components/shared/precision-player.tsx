"use client"

import {
    PrecisionPlayerProvider,
    usePrecisionPlayerRefs,
    usePrecisionPlayerState,
} from "./precision-player/context"
import { AmbientBackground } from "./precision-player/ambient-background"
import { PlayerUI } from "./precision-player/player-ui"

export interface PrecisionPlayerProps {
    url?: string
    videoId?: string
    title?: string
    id?: string
    autoPlay?: boolean
    /** Cover / banner image for ambient color and pause mask (optional). */
    externalPosterUrl?: string | null
}

function PrecisionPlayerContent() {
    const { isMounted } = usePrecisionPlayerState()
    const { containerRef } = usePrecisionPlayerRefs()

    if (!isMounted) {
        return <div className="aspect-video w-full animate-pulse bg-black/50" aria-hidden />
    }

    return (
        <div className="relative w-full">
            <AmbientBackground />

            <div
                ref={containerRef}
                className="precision-frame-cut relative z-10 aspect-video w-full overflow-hidden border border-white/5 shadow-2xl"
            >
                <PlayerUI />
            </div>
        </div>
    )
}

export function PrecisionPlayer(props: PrecisionPlayerProps) {
    return (
        <PrecisionPlayerProvider {...props}>
            <PrecisionPlayerContent />
        </PrecisionPlayerProvider>
    )
}
