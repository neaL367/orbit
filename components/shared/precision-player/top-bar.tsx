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
                <div className="flex items-center gap-1.5 sm:gap-3">
                    <div className="w-1 h-1 sm:h-1.5 sm:w-1.5 bg-primary rotate-45 animate-pulse flex-shrink-0" />
                    <span className="font-mono text-[7px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.4em] text-primary font-bold truncate">
                        PRECISION_LINK
                    </span>
                </div>
                <h3 className="font-mono font-black uppercase tracking-tighter text-foreground leading-tight truncate text-[10px] sm:text-base lg:text-lg">
                    {title}
                </h3>
            </div>

            <div className="hidden sm:flex flex-col items-end gap-0.5 sm:gap-1.5 font-mono text-[8px] sm:text-[10px] text-muted-foreground/60 uppercase ml-4 flex-shrink-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="opacity-40">ID//</span>
                    <span className="text-foreground font-bold truncate max-w-[60px] sm:max-w-none">{id}</span>
                </div>
            </div>
        </div>
    )
}
