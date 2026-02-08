import { Play, Pause, Volume2, VolumeX, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { SeekBar } from "./seek-bar"
import { usePrecisionPlayerState, usePrecisionPlayerHandlers } from "./context"

export function BottomBar() {
    const {
        playing, muted, volume, played, duration,
        isBuffer, isPlayerReady
    } = usePrecisionPlayerState()

    const {
        handlePlayPause, onSetMuted, onSetVolume,
        onRestart, formatTime
    } = usePrecisionPlayerHandlers()

    return (
        <div
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            className="bg-black/95 border-t border-white/10 z-30 transition-all duration-300 p-2 sm:p-4 lg:p-6"
        >
            <div className="flex items-center gap-2 sm:gap-4 mb-0.5 sm:mb-2 ml-1 sm:ml-0">
                <div className="flex-1">
                    <SeekBar />
                </div>
            </div>

            <div className="flex items-center justify-between gap-2 px-1 sm:px-0">
                <div className="flex items-center gap-1 sm:gap-5">
                    <div className="flex bg-white/5 border border-white/10 p-0.5 rounded-sm gap-0.5">
                        <button
                            disabled={!isPlayerReady}
                            onClick={handlePlayPause}
                            className={cn(
                                "flex items-center justify-center transition-colors text-white w-7 h-7 sm:w-8 sm:h-8",
                                !isPlayerReady ? "opacity-50 cursor-not-allowed" : "hover:bg-white/10"
                            )}
                        >
                            {playing ? <Pause size={12} className="sm:size-4" /> : <Play size={12} className="sm:size-4 translate-x-0.5" />}
                        </button>
                        <button onClick={onRestart} className="hidden xs:flex w-7 h-7 sm:w-8 sm:h-8 items-center justify-center hover:bg-white/10 transition-colors text-muted-foreground hover:text-white">
                            <RotateCcw size={11} className="sm:size-[14px]" />
                        </button>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-4 sm:border-l sm:pl-5 border-white/10">
                        <button onClick={() => onSetMuted(!muted)} className="text-muted-foreground hover:text-white transition-colors p-1 flex items-center justify-center">
                            {muted || volume === 0 ? <VolumeX size={12} className="sm:size-4" /> : <Volume2 size={12} className="sm:size-4" />}
                        </button>
                        <div className="hidden sm:flex items-center gap-3">
                            <div
                                className="w-16 lg:w-20 h-1 bg-white/10 relative group/vol overflow-hidden cursor-pointer touch-none"
                                onMouseDown={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const updateVolume = (clientX: number) => {
                                        const val = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
                                        onSetVolume(val * 100);
                                    };
                                    updateVolume(e.clientX);
                                    const onMouseMove = (moveEvent: MouseEvent) => updateVolume(moveEvent.clientX);
                                    const onMouseUp = () => {
                                        window.removeEventListener('mousemove', onMouseMove);
                                        window.removeEventListener('mouseup', onMouseUp);
                                    };
                                    window.addEventListener('mousemove', onMouseMove);
                                    window.addEventListener('mouseup', onMouseUp);
                                }}
                            >
                                <div className="absolute inset-x-0 bottom-0 h-full bg-white/20 pointer-events-none" />
                                <div className="absolute inset-y-0 left-0 bg-white/60 group-hover/vol:bg-primary transition-colors" style={{ width: `${volume}%` }} />
                            </div>
                            <span className="font-mono text-[9px] text-muted-foreground/60 w-8">{Math.round(volume)}%</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:px-4 sm:border-l border-white/10 font-mono text-[8px] sm:text-[10px]">
                        <span className="text-foreground font-bold">{formatTime(played * duration)}</span>
                        <span className="text-muted-foreground/40 sm:inline hidden">/</span>
                        <span className="text-muted-foreground/60 sm:inline hidden">{formatTime(duration)}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 font-mono">
                    {isBuffer && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 sm:px-3 sm:py-1 bg-primary/10 border border-primary/20 animate-pulse">
                            <span className="text-[7px] sm:text-[9px] uppercase tracking-widest text-primary font-bold">BUF</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}