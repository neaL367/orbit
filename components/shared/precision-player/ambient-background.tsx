import { cn } from "@/lib/utils"
import { usePrecisionPlayerState, usePrecisionPlayerRefs } from "./context"

export function AmbientBackground() {
    const {
        isMounted, hasStarted,
        isTerminated, videoId, playing,
        isSyncing, youtubeUIWait, isEnded, isBuffer
    } = usePrecisionPlayerState()

    const { ambientElementRef } = usePrecisionPlayerRefs()

    const enabled = isMounted && hasStarted && !isTerminated && !!videoId && !isSyncing && !youtubeUIWait && !isEnded && (playing || isBuffer)

    return (
        <div
            className={cn(
                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-full -z-50 pointer-events-none select-none transition-opacity ease-in-out",
                enabled ? "opacity-100 duration-1000" : cn("opacity-0", isEnded ? "duration-300" : "duration-2000")
            )}
            style={{
                maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 80%)',
                WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 80%)'
            }}
        >
            {/* The Main Ambient Glow - IMAX Projector Simulation */}
            <div
                className={cn(
                    "w-full h-full blur-[100px] saturate-[1.5] brightness-110 contrast-[1.25] opacity-50 scale-100",
                )}
                style={{
                    transform: "translate3d(0,0,0)",
                    backfaceVisibility: "hidden",
                    willChange: "transform, opacity"
                }}
            >
                <div ref={ambientElementRef} className="w-full h-full scale-[1.35]" />
            </div>

            {/* IMAX Stadium Vignette - Deep immersion */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.2)_40%,rgba(0,0,0,0.6)_80%,#000_100%)] mix-blend-multiply opacity-80" />

            {/* Physical Film Grain - 70mm Texture */}
            <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay">
                <div
                    className="w-full h-full animate-[grain_0.6s_steps(4)_infinite] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"
                    style={{ willChange: "transform" }}
                />
            </div>
        </div>
    )
}