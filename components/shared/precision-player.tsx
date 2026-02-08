"use client"

import { PrecisionPlayerProvider, usePrecisionPlayerState, usePrecisionPlayerRefs } from "./precision-player/context"
import { PlayerUI } from "./precision-player/player-ui"
import { AmbientBackground } from "./precision-player/ambient-background"
import Script from "next/script"

interface PrecisionPlayerProps {
    url?: string
    videoId?: string
    title?: string
    id?: string
}

function PrecisionPlayerContent() {
    const { isMounted } = usePrecisionPlayerState();
    const { containerRef } = usePrecisionPlayerRefs();

    if (!isMounted) return <div className="w-full aspect-video bg-black/50 animate-pulse" />;

    return (
        <div ref={containerRef} className="relative w-full aspect-video">
            <AmbientBackground />
            <PlayerUI />
        </div>
    );
}

export function PrecisionPlayer(props: PrecisionPlayerProps) {
    return (
        <PrecisionPlayerProvider {...props}>
            <Script
                src="https://www.youtube.com/iframe_api"
                strategy="lazyOnload"
                id="youtube-api-script"
            />
            <PrecisionPlayerContent />
        </PrecisionPlayerProvider>
    );
}