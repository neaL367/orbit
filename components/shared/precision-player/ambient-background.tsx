import { cn } from "@/lib/utils"
import { usePrecisionPlayerState, usePrecisionPlayerRefs } from "./context"

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
        <div className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[121%] h-[121%] -z-50 pointer-events-none select-none transition-opacity ease-in-out hidden md:block",
            enabled ? "opacity-100 duration-1000" : cn("opacity-0", isEnded ? "duration-300" : "duration-2000")
        )}>
            <div
                className={cn(
                    "w-full h-full blur-[80px] saturate-[2] brightness-110 contrast-125 opacity-40 transition-opacity duration-1000",
                )}
                style={{ transform: "translate3d(0,0,0)", backfaceVisibility: "hidden" }}
            >
                {/* API mounts iframe here */}
                <div ref={ambientElementRef} className="w-full h-full" />
            </div>
        </div>
    )
}