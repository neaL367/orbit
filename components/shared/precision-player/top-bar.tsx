import { usePrecisionPlayerState } from "./context"

export function TopBar() {
    const { title, id } = usePrecisionPlayerState()

    return (
        <div
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            className="bg-black/95 border-b border-white/10 flex justify-between items-start z-30 transition-all duration-500 p-2 sm:p-4 lg:p-6"
        >
            <div className="flex flex-col gap-0 min-w-0 flex-1">
                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="w-1.5 h-1.5 bg-primary rotate-45 animate-pulse flex-shrink-0" />
                    <span className="font-mono text-[9px] sm:text-[11px] md:text-[13px] uppercase tracking-[0.2em] sm:tracking-[0.4em] text-primary font-bold truncate">
                        PRECISION_LINK
                    </span>
                </div>
                <h3 className="font-mono font-black uppercase tracking-tighter text-foreground leading-tight truncate text-[11px] sm:text-lg lg:text-xl mt-1">
                    {title}
                </h3>
            </div>

            <div className="hidden sm:flex flex-col items-end gap-0.5 sm:gap-1.5 font-mono text-[8px] sm:text-[10px] text-muted-foreground/60 uppercase ml-4 flex-shrink-0">
                <div className="flex items-center gap-2 sm:gap-2.5">
                    <span className="opacity-40">AUDIO//</span>
                    <span className="text-primary font-bold">L-PCM 24-bit / 48kHz</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-2.5">
                    <span className="opacity-40">UPLINK//</span>
                    <span className="text-foreground font-bold">READY</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-2.5">
                    <span className="opacity-40">ID//</span>
                    <span className="text-foreground font-bold truncate max-w-[80px] sm:max-w-none">{id}</span>
                </div>
            </div>
        </div>
    )
}
