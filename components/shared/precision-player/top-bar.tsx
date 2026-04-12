import { useState, useEffect } from "react"
import { usePrecisionPlayerState, usePrecisionPlayerHandlers } from "./context"

export function TopBar() {
    const { title: propTitle, isPlayerReady } = usePrecisionPlayerState()
    const { getVideoData } = usePrecisionPlayerHandlers()

    const [title, setTitle] = useState(propTitle)

    useEffect(() => {
        if (isPlayerReady) {
            const data = getVideoData()
            if (data?.title) {
                setTitle(data.title)
            }
        }
    }, [isPlayerReady, getVideoData])

    return (
        <div
            role="region"
            aria-label="Trailer title"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            className="z-30 flex justify-between items-start transition-all duration-500 p-4 sm:p-6 lg:p-8"
        >
            <div className="flex flex-col gap-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse shrink-0" />
                    <span className="font-mono text-[10px] sm:text-[12px] uppercase tracking-[0.3em] text-primary font-black">
                        PRECISION_LINK
                    </span>
                </div>
                <h3 className="font-sans font-black uppercase tracking-tight text-white leading-tight truncate text-[14px] sm:text-2xl lg:text-3xl filter drop-shadow-md">
                    {title}
                </h3>
            </div>

            <div className="hidden md:flex flex-col items-end gap-1 font-mono text-[10px] text-white/50 uppercase ml-4 shrink-0">
                <div className="flex items-center gap-3">
                    <span className="opacity-30">ENCODER//</span>
                    <span className="text-primary font-bold">L-PCM 24-BIT</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="opacity-30">UPLINK//</span>
                    <span className="text-white font-bold tracking-widest">ESTABLISHED</span>
                </div>
            </div>
        </div>
    )
}
