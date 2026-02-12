import { useRef, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { usePrecisionPlayerState, usePrecisionPlayerHandlers } from "./context"

export function VolumeUI() {
    const { volume, muted, playing } = usePrecisionPlayerState()
    const { onSetVolume } = usePrecisionPlayerHandlers()
    const [isVisible, setIsVisible] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const prevVolume = useRef(volume)
    const isFirstMount = useRef(true)

    useEffect(() => {
        // Show briefly on mount, or whenever volume changes
        if (isFirstMount.current || prevVolume.current !== volume) {
            setIsVisible(true)
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            timeoutRef.current = setTimeout(() => setIsVisible(false), 2000)

            if (isFirstMount.current) {
                isFirstMount.current = false
            }
            prevVolume.current = volume
        }
    }, [volume])

    return (
        <div
            className={cn(
                "absolute top-1/2 right-8 -translate-y-1/2 flex flex-col items-center gap-4 transition-all duration-500 z-[70] pointer-events-none",
                isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
            )}
        >
            <div className="flex flex-col items-center gap-3">
                <div
                    className="h-48 w-2 bg-white/5 relative border border-white/10 backdrop-blur-md overflow-hidden"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% 98%, 80% 100%, 0 100%)' }}
                >
                    <div
                        className="absolute bottom-0 inset-x-0 bg-primary transition-all duration-150"
                        style={{ height: `${muted ? 0 : volume}%` }}
                    >
                        <div className="absolute top-0 inset-x-0 h-1 bg-white/40 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                    </div>
                </div>

                <div
                    className="bg-primary/95 border border-white/20 backdrop-blur-xl px-2 py-1 flex flex-col items-center min-w-[54px]"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% 80%, 80% 100%, 0 100%)' }}
                >
                    <span className="font-mono text-[8px] font-black text-black leading-none opacity-60">AUD_GAIN</span>
                    <span className="font-mono text-[16px] font-bold text-black leading-none mt-1">
                        {muted ? "00" : Math.round(volume).toString().padStart(2, '0')}
                    </span>
                </div>
            </div>

            {/* Tactical Status Lines */}
            <div className="flex flex-col gap-0.5">
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "w-4 h-0.5 bg-primary/40",
                            i === 1 && "w-6",
                            isVisible && playing ? "animate-pulse" : ""
                        )}
                        style={{ animationDelay: `${i * 100}ms` }}
                    />
                ))}
            </div>
        </div>
    )
}
