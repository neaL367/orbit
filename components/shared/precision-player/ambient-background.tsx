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
    const enabled = isMounted && hasStarted && !isTerminated && !!videoId && !isSyncing && !youtubeUIWait && !isEnded && (playing || isBuffer)

    return (
        <div className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[115%] h-[115%] -z-50 pointer-events-none select-none transition-opacity ease-in-out hidden md:block",
            enabled ? "opacity-100 duration-1000" : cn("opacity-0", isEnded ? "duration-300" : "duration-2000")
        )}>

            <div
                className={cn(
                    "w-full h-full blur-[64px] saturate-[1.8] brightness-110 contrast-110 opacity-45 transition-opacity duration-1000 scale-105",
                )}
                style={{
                    transform: "translate3d(0,0,0)",
                    backfaceVisibility: "hidden",
                    willChange: "transform, opacity"
                }}
            >
                {/* API mounts iframe here */}
                <div ref={ambientElementRef} className="w-full h-full scale-105" />
            </div>
        </div>
    )
}