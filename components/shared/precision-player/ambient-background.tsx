import { cn } from "@/lib/utils"
import { usePrecisionPlayerState } from "./context"

export function AmbientBackground() {
    const {
        isMounted,
        hasStarted,
        isMobile,
        isTerminated,
        videoId,
        playing,
        isSyncing,
        youtubeUIWait,
        isEnded,
        isBuffer,
        isPlayerReady,
        ambientColorRgb,
    } = usePrecisionPlayerState()

    const enabled =
        isMounted &&
        hasStarted &&
        !isMobile &&
        !isTerminated &&
        !!videoId &&
        isPlayerReady &&
        !isSyncing &&
        !youtubeUIWait &&
        !isEnded &&
        (playing || isBuffer)

    return (
        <div
            className={cn(
                "absolute top-1/2 left-1/2 w-[150%] h-[150%] -z-50 pointer-events-none select-none transition-opacity ease-in-out hidden md:block will-change-opacity",
                enabled ? "opacity-70 duration-2000" : "opacity-0 duration-1000"
            )}
            style={{
                transform: "translate3d(-50%, -50%, 0)",
                backfaceVisibility: "hidden"
            }}
            aria-hidden="true"
        >
            <div
                className="absolute inset-0 blur-[110px] sm:blur-[130px] md:blur-[160px] transform-gpu will-change-transform"
                style={{
                    background: `radial-gradient(circle at 45% 45%, rgba(${ambientColorRgb}, 0.95) 0%, transparent 65%),
                                 radial-gradient(circle at 55% 55%, rgba(${ambientColorRgb}, 0.85) 0%, transparent 65%),
                                 radial-gradient(circle at 55% 45%, rgba(${ambientColorRgb}, 0.75) 0%, transparent 65%),
                                 radial-gradient(circle at 45% 55%, rgba(${ambientColorRgb}, 0.75) 0%, transparent 65%)`,
                    animation: "ambient-pulse 18s ease-in-out infinite alternate, ambient-rotate 30s linear infinite",
                }}
            />

            <style jsx>{`
                @keyframes ambient-rotate {
                    from { transform: rotate(0deg) scale(1.1); }
                    to { transform: rotate(360deg) scale(1.1); }
                }
                @keyframes ambient-pulse {
                    0% { opacity: 0.8; transform: scale(1); }
                    100% { opacity: 1; transform: scale(1.15); }
                }
            `}</style>
        </div>
    )
}
