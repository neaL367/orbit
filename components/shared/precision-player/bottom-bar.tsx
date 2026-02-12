import { Play, Pause, Volume2, VolumeX, RotateCcw, Maximize, Minimize } from "lucide-react"
import { cn } from "@/lib/utils"
import { SeekBar } from "./seek-bar"
import { usePrecisionPlayerState, usePrecisionPlayerHandlers } from "./context"

export function BottomBar() {
    const {
        playing, muted, volume, played, duration,
        isBuffer, isPlayerReady, isFullscreen
    } = usePrecisionPlayerState()

    const {
        handlePlayPause, onSetMuted, onSetVolume,
        onRestart, formatTime, toggleFullscreen
    } = usePrecisionPlayerHandlers()

    return (
        <div
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            className={cn(
                "bg-black/95 border-t border-white/10 z-30 transition-all duration-300",
                "p-2 sm:p-4 lg:p-6"
            )}
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
                            {playing ? <Pause size={14} className="sm:size-5" /> : <Play size={14} className="sm:size-5 translate-x-0.5" />}
                        </button>
                        <button onClick={onRestart} className="hidden xs:flex w-7 h-7 sm:w-8 sm:h-8 items-center justify-center hover:bg-white/10 transition-colors text-muted-foreground hover:text-white">
                            <RotateCcw size={12} className="sm:size-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-4 sm:border-l sm:pl-5 border-white/10">
                        <button onClick={() => onSetMuted(!muted)} className="text-muted-foreground hover:text-white transition-colors p-1 flex items-center justify-center">
                            {muted || volume === 0 ? <VolumeX size={14} className="sm:size-5" /> : <Volume2 size={14} className="sm:size-5" />}
                        </button>
                        <div className="hidden sm:flex items-center gap-3">
                            <div
                                className="w-16 lg:w-24 h-5 relative group/vol cursor-pointer flex items-center"
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
                                {/* Track Background */}
                                <div className="absolute inset-x-0 h-[2px] bg-white/10 rounded-full" />

                                {/* Active Fill */}
                                <div
                                    className="absolute inset-y-0 left-0 h-[2px] bg-primary transition-all duration-75 my-auto"
                                    style={{ width: `${volume}%` }}
                                >
                                    {/* Handle Glow */}
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary-rgb),0.8)]" />
                                </div>

                                {/* Interaction Trigger */}
                                <div className="absolute inset-0 z-10" />
                            </div>
                            <span className="font-mono text-[10px] sm:text-[11px] text-primary font-black tabular-nums min-w-[32px]">
                                {Math.round(volume).toString().padStart(2, '0')}%
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:px-5 sm:border-l border-white/10 font-mono text-[10px] sm:text-[12px]">
                        <span className="text-foreground font-black tracking-tighter">{formatTime(played * duration)}</span>
                        <span className="text-muted-foreground/40 sm:inline hidden">/</span>
                        <span className="text-muted-foreground/60 sm:inline hidden font-medium">{formatTime(duration)}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 font-mono">
                    {isBuffer && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 sm:px-3 sm:py-1 bg-primary/10 border border-primary/20 animate-pulse">
                            <span className="text-[7px] sm:text-[9px] uppercase tracking-widest text-primary font-bold">BUF</span>
                        </div>
                    )}
                    <button
                        onClick={toggleFullscreen}
                        className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 hover:bg-white/10 transition-colors text-muted-foreground hover:text-white"
                        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    >
                        {isFullscreen ? <Minimize size={14} className="sm:size-5" /> : <Maximize size={14} className="sm:size-5" />}
                    </button>
                </div>
            </div>
        </div>
    )
}