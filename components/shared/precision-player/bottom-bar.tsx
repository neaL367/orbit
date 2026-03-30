import { useState, useEffect } from "react"
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
        onRestart, formatTime, toggleFullscreen,
        getAvailablePlaybackRates, setPlaybackRate, getPlaybackRate
    } = usePrecisionPlayerHandlers()

    const [rates, setRates] = useState<number[]>([1]);
    const [currentRate, setCurrentRate] = useState<number>(1);

    useEffect(() => {
        if (isPlayerReady) {
            setRates(getAvailablePlaybackRates());
            setCurrentRate(getPlaybackRate());
        }
    }, [isPlayerReady, getAvailablePlaybackRates, getPlaybackRate]);



    return (
        <div
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            className={cn(
                "z-30 px-3 pb-2 sm:px-5 sm:pb-4",
                "flex flex-col gap-1 sm:gap-2"
            )}
        >
            <SeekBar />

            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1 sm:gap-4">
                    <div className="flex items-center gap-1">
                        <button
                            disabled={!isPlayerReady}
                            onClick={handlePlayPause}
                            className={cn(
                                "flex items-center justify-center transition-all text-white w-9 h-9",
                                !isPlayerReady ? "opacity-50 cursor-not-allowed" : "hover:scale-110 active:scale-95 cursor-pointer"
                            )}
                        >
                            {playing ? <Pause size={20} className="fill-white" /> : <Play size={20} className="fill-white translate-x-0.5" />}
                        </button>
                        <button
                            disabled={!isPlayerReady}
                            onClick={onRestart}
                            className={cn(
                                "hidden xs:flex w-9 h-9 items-center justify-center transition-all text-white/70 hover:text-white",
                                !isPlayerReady ? "opacity-50 cursor-not-allowed" : "hover:scale-110 active:scale-95 cursor-pointer"
                            )}
                        >
                            <RotateCcw size={16} />
                        </button>
                    </div>

                    <div className="flex items-center gap-1 group/vol-container">
                        <button
                            disabled={!isPlayerReady}
                            onClick={() => onSetMuted(!muted)}
                            className={cn(
                                "text-white/80 hover:text-white transition-all p-2 flex items-center justify-center",
                                !isPlayerReady ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-110"
                            )}
                        >
                            {muted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </button>
                        <div className="hidden sm:flex items-center w-0 group-hover/vol-container:w-20 lg:group-hover/vol-container:w-28 transition-all duration-300 overflow-hidden">
                            <div
                                className={cn(
                                    "w-full h-5 relative flex items-center pr-4 ml-1",
                                    !isPlayerReady ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer"
                                )}
                                onMouseDown={(e) => {
                                    if (!isPlayerReady) return;
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
                                <div className="absolute inset-x-0 h-[3px] bg-white/20 rounded-full" />
                                <div
                                    className="absolute inset-y-0 left-0 h-[3px] bg-white my-auto rounded-full"
                                    style={{ width: `${volume}%` }}
                                >
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[11px] sm:text-[13px] text-white/90 ml-2">
                        <span className="font-bold tabular-nums">{formatTime(played * duration)}</span>
                        <span className="opacity-40">/</span>
                        <span className="opacity-60 tabular-nums">{formatTime(duration)}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    {isBuffer && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/20 rounded-full animate-pulse border border-primary/30">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                            <span className="text-[10px] uppercase tracking-wider text-primary font-bold">Buffering</span>
                        </div>
                    )}

                    <div className="hidden sm:flex items-center relative group">
                        <button
                            disabled={!isPlayerReady}
                            className={cn(
                                "flex items-center gap-1.5 text-[12px] text-white font-bold transition-all px-3 py-1.5 rounded-md",
                                !isPlayerReady ? "opacity-50 cursor-not-allowed" : "hover:bg-white/10 cursor-pointer"
                            )}
                        >
                            <span>{currentRate}x</span>
                        </button>

                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50">
                            <div className="bg-black/95 border border-white/10 p-1 flex flex-col-reverse shadow-2xl backdrop-blur-xl rounded-lg overflow-hidden min-w-[80px]">
                                {rates.map(r => (
                                    <button
                                        key={r}
                                        onClick={() => {
                                            setPlaybackRate(r);
                                            setCurrentRate(r);
                                        }}
                                        className={cn(
                                            "px-4 py-2 text-[11px] font-bold text-center transition-colors",
                                            currentRate === r ? "bg-primary text-black" : "text-white/80 hover:bg-white/10"
                                        )}
                                    >
                                        {r}x
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        disabled={!isPlayerReady}
                        onClick={toggleFullscreen}
                        className={cn(
                            "flex items-center justify-center w-9 h-9 transition-all text-white/80 hover:text-white",
                            !isPlayerReady ? "opacity-50 cursor-not-allowed" : "hover:scale-110 active:scale-95 cursor-pointer"
                        )}
                    >
                        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    </button>
                </div>
            </div>
        </div>
    )
}