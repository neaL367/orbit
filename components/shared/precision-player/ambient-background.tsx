import { memo } from "react"
import { cn } from "@/lib/utils"
import { usePrecisionPlayerState, usePrecisionPlayerRefs } from "./context"

const AmbientLayer = memo(({ ambientElementRef }: { ambientElementRef: React.RefObject<HTMLDivElement | null> }) => (
    <div
        className="w-full h-full blur-[140px] saturate-[1.8] brightness-105 contrast-110 opacity-40 transition-all duration-1200 ease-out will-change-transform"
        style={{
            transform: "translate3d(0,0,0)",
            backfaceVisibility: "hidden"
        }}
    >
        {/* API mounts iframe here */}
        <div ref={ambientElementRef} className="w-full h-full scale-[1.1]" />
    </div>
))

AmbientLayer.displayName = "AmbientLayer"

export function AmbientBackground() {
    const {
        isMounted, hasStarted, isMobile,
        isTerminated, videoId, playing,
        isSyncing, youtubeUIWait, isEnded, isBuffer
    } = usePrecisionPlayerState()

    const { ambientElementRef } = usePrecisionPlayerRefs()

    // Ensuring the ambient layer is only visible during active playback prevents end-screen glitches
    const enabled = isMounted && hasStarted && !isMobile && !isTerminated && !!videoId && !isSyncing && !youtubeUIWait && !isEnded && (playing || isBuffer)

    return (
        <div
            className={cn(
                "absolute top-1/2 left-1/2 w-[121%] h-[121%] -z-50 pointer-events-none select-none transition-opacity ease-in-out hidden md:block will-change-[transform,opacity]",
                enabled ? "opacity-100 duration-1000" : cn("opacity-0", isEnded ? "duration-300" : "duration-2000")
            )}
            style={{
                transform: "translate3d(-50%, -50%, 0)",
                backfaceVisibility: "hidden"
            }}
            aria-hidden="true"
        >
            <AmbientLayer ambientElementRef={ambientElementRef} />
        </div>
    )
}
