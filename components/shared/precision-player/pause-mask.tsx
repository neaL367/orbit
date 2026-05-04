import Image from "next/image"
import { Play, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePrecisionPlayerState, usePrecisionPlayerHandlers } from "./context"

export function PauseMask() {
    const {
        isTerminated,
        hasStarted,
        isPlayerReady,
        visualPlaying,
        isBuffer,
        isPlayPending,
        thumbnailUrl,
        isEnded
    } = usePrecisionPlayerState()

    const { handlePlayPause, onSetHasStarted, onRestart } = usePrecisionPlayerHandlers()

    if (isTerminated) return <div className="absolute inset-0 bg-black z-60" />

    const isLoading = isPlayPending || isBuffer || (hasStarted && !isPlayerReady && !isEnded)

    const handleClick = () => {
        if (isEnded) {
            onRestart()
        } else if (!hasStarted) {
            onSetHasStarted(true)
        } else {
            handlePlayPause()
        }
    }

    return (
        <div
            className={cn(
                "absolute inset-0 bg-black z-50 flex flex-col items-center justify-center overflow-hidden transition-opacity",
                visualPlaying
                    ? "opacity-0 pointer-events-none duration-500 delay-0"
                    : "opacity-100 pointer-events-auto duration-0 delay-0"
            )}
            style={{
                willChange: "opacity",
                transform: "translate3d(0,0,0)"
            }}
        >
            {thumbnailUrl && (
                <div className="absolute inset-0 opacity-40 blur-2xl scale-110 pointer-events-none overflow-hidden">
                    <Image
                        src={thumbnailUrl}
                        alt="Background Thumbnail"
                        fill
                        className="object-cover object-center"
                        priority
                    />
                    <div className="absolute inset-0 bg-linear-to-b from-transparent via-primary/10 to-transparent h-1/2 w-full animate-pulse z-10" />
                </div>
            )}

            <div className="relative z-10 flex flex-col items-center gap-4">
                <button
                    disabled={isLoading}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleClick();
                    }}
                    className={cn(
                        "w-16 h-16 border border-primary/40 flex items-center justify-center rotate-45 bg-primary/5 transition-all duration-300",
                        "shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_20px_60px_-20px_rgba(255,255,255,0.18),0_0_36px_-12px_rgba(255,255,255,0.12)]",
                        isLoading ? "cursor-wait opacity-60" : "cursor-pointer hover:bg-primary/20 hover:scale-110 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_24px_80px_-24px_rgba(255,255,255,0.26),0_0_54px_-14px_rgba(255,255,255,0.18)]"
                    )}
                >
                    {isLoading ? (
                        <div className="w-8 h-8 flex items-center justify-center -rotate-45">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : isEnded ? (
                        <RotateCcw className="w-8 h-8 text-primary -rotate-45 fill-primary/20" />
                    ) : (
                        <Play className="w-8 h-8 text-primary -rotate-45 translate-x-0.5 fill-primary/20" />
                    )}
                </button>

                <div className="flex flex-col items-center gap-1 font-mono">
                    <span className="text-[10px] uppercase tracking-[0.5em] text-primary font-bold">
                        {isLoading ? "INITIALIZING" : isEnded ? "Signal_Terminated" : !hasStarted ? "Signal_Ready" : "Signal_Paused"}
                    </span>
                    <span className="text-[7px] uppercase tracking-widest text-primary/40">
                        {isLoading ? "Uplink_Establishment: Pending" : isEnded ? "Uplink_Cycle: Complete" : hasStarted ? "Encryption_Hold: Active" : "Encryption_Standby: Valid"}
                    </span>
                </div>
            </div>

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />
        </div>
    )
}
